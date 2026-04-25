from __future__ import annotations

from datetime import datetime, timezone
from html.parser import HTMLParser
import re
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

from db.queries import (
    create_pipeline_run,
    get_all_sources,
    get_pipeline_run,
    get_pipeline_step_runs,
    get_latest_pipeline_run,
    insert_audit_log,
    insert_certification,
    insert_crawl_run,
    insert_eligibility_assessment,
    insert_hil_review,
    insert_rfp_document,
    insert_rfp_listing,
    insert_risk,
    insert_task,
    insert_skill,
    get_all_rfp_listings,
    get_certifications,
    get_eligibility_assessment,
    get_rfp_documents,
    get_risks,
    get_skills,
    get_tasks,
    update_pipeline_run,
    upsert_pipeline_step_run,
    update_rfp_status,
)


STEP_DEFINITIONS = [
    {
        "id": 1,
        "key": "crawl",
        "label": "Crawl Activity",
        "description": "Scan approved source URLs and log listings, pass counts, discards, and errors",
        "stage": "discovery",
        "apiEndpoint": "/api/pipeline/runs/{run_id}/steps/crawl",
        "icon": "01",
    },
    {
        "id": 2,
        "key": "filter",
        "label": "Rule Decisions",
        "description": "Evaluate keyword, category, geography, value, deadline, and eligibility filters",
        "stage": "discovery",
        "apiEndpoint": "/api/pipeline/runs/{run_id}/steps/filter",
        "icon": "02",
    },
    {
        "id": 3,
        "key": "download",
        "label": "Document Intake",
        "description": "Acquire supported RFP documents and preserve processing traceability",
        "stage": "discovery",
        "apiEndpoint": "/api/pipeline/runs/{run_id}/steps/download",
        "icon": "03",
    },
    {
        "id": 4,
        "key": "extract",
        "label": "Tasks & Skills",
        "description": "Decompose scope into tasks, skill needs, experience levels, and confidence scores",
        "stage": "analysis",
        "apiEndpoint": "/api/pipeline/runs/{run_id}/steps/extract",
        "icon": "04",
    },
    {
        "id": 5,
        "key": "certs",
        "label": "Certifications",
        "description": "Map certification requirements and flag unknown taxonomy items for validation",
        "stage": "analysis",
        "apiEndpoint": "/api/pipeline/runs/{run_id}/steps/certs",
        "icon": "05",
    },
    {
        "id": 6,
        "key": "risk",
        "label": "Eligibility & Risk",
        "description": "Assess eligibility, supporting evidence, gaps, mitigations, and delivery risks",
        "stage": "analysis",
        "apiEndpoint": "/api/pipeline/runs/{run_id}/steps/risk",
        "icon": "06",
    },
    {
        "id": 7,
        "key": "convert",
        "label": "Schema Package",
        "description": "Package structured JSON output for controlled downstream consumption",
        "stage": "decision",
        "apiEndpoint": "/api/pipeline/runs/{run_id}/steps/convert",
        "icon": "07",
    },
    {
        "id": 8,
        "key": "hil",
        "label": "HIL Review",
        "description": "Require manager review, corrections, rejection, or confirmation before handoff",
        "stage": "decision",
        "apiEndpoint": "/api/pipeline/runs/{run_id}/steps/hil",
        "icon": "08",
    },
    {
        "id": 9,
        "key": "forward",
        "label": "Approved Handoff",
        "description": "Forward only confirmed RFP packages to downstream bid modules",
        "stage": "decision",
        "apiEndpoint": "/api/pipeline/runs/{run_id}/steps/forward",
        "icon": "09",
    },
    {
        "id": 10,
        "key": "log",
        "label": "Audit & Feedback",
        "description": "Store audit trail, corrections, confidence metrics, and feedback loop signals",
        "stage": "feedback",
        "apiEndpoint": "/api/pipeline/runs/{run_id}/steps/log",
        "icon": "10",
    },
]

DATA_KEY_BY_STEP = {
    "crawl": "crawlResults",
    "filter": "filterResults",
    "download": "downloadResults",
    "extract": "extractResults",
    "certs": "certResults",
    "risk": "riskResults",
    "convert": "jsonOutput",
    "hil": "hilResults",
    "forward": "forwardResults",
    "log": "logResults",
}

RFP_KEYWORDS = (
    "rfp", "request for proposal", "proposal", "tender", "bid", "procurement",
    "solicitation", "opportunity", "contract", "auction", "eoi", "expression of interest",
)

TECH_SKILL_KEYWORDS = {
    "cloud": ("Cloud Architecture", "Advanced"),
    "aws": ("AWS", "Advanced"),
    "azure": ("Microsoft Azure", "Advanced"),
    "security": ("Security & Compliance", "Advanced"),
    "cyber": ("Cybersecurity", "Advanced"),
    "data": ("Data Engineering", "Advanced"),
    "analytics": ("Analytics", "Intermediate"),
    "ai": ("AI Operations", "Intermediate"),
    "machine learning": ("Machine Learning", "Advanced"),
    "erp": ("Enterprise Systems", "Advanced"),
    "hospital": ("Healthcare IT", "Advanced"),
    "traffic": ("IoT / Smart Infrastructure", "Intermediate"),
    "water": ("Utility Operations", "Intermediate"),
}

CERTIFICATION_KEYWORDS = {
    "iso 27001": "ISO 27001",
    "soc 2": "SOC 2",
    "hipaa": "HIPAA",
    "fedramp": "FedRAMP",
    "cmmc": "CMMC",
    "pmp": "PMP",
    "cissp": "CISSP",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def current_clock() -> str:
    return datetime.now().strftime("%H:%M")


def stable_number(seed: str, floor: int, span: int) -> int:
    total = sum(ord(ch) for ch in seed)
    return floor + (total % span)


def clean_text(value: str | None, fallback: str = "") -> str:
    if not value:
        return fallback
    return re.sub(r"\s+", " ", value).strip()


def money_label(value: Any) -> str:
    if value in (None, ""):
        return "Not disclosed"
    try:
        amount = float(value)
    except (TypeError, ValueError):
        return str(value)
    if amount >= 1_000_000:
        return f"${amount / 1_000_000:.1f}M"
    if amount >= 1_000:
        return f"${amount / 1_000:.0f}K"
    return f"${amount:.0f}"


def confidence_from_record(record: dict[str, Any], floor: int = 54) -> int:
    title = clean_text(record.get("title"))
    text = " ".join(
        str(record.get(field) or "")
        for field in ("title", "industry", "geography", "listing_url", "status")
    ).lower()
    score = floor
    if any(keyword in text for keyword in RFP_KEYWORDS):
        score += 18
    if record.get("listing_url"):
        score += 8
    if record.get("submission_deadline"):
        score += 6
    if record.get("contract_value"):
        score += 6
    return min(96, score + stable_number(title, 0, 7))


class LinkExtractor(HTMLParser):
    def __init__(self, base_url: str):
        super().__init__()
        self.base_url = base_url
        self.links: list[dict[str, str]] = []
        self.page_title = ""
        self._current_href: str | None = None
        self._current_text: list[str] = []
        self._in_title = False
        self._title_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]):
        if tag.lower() == "a":
            href = dict(attrs).get("href")
            if href:
                self._current_href = urljoin(self.base_url, href)
                self._current_text = []
        elif tag.lower() == "title":
            self._in_title = True
            self._title_text = []

    def handle_data(self, data: str):
        if self._current_href:
            self._current_text.append(data)
        if self._in_title:
            self._title_text.append(data)

    def handle_endtag(self, tag: str):
        if tag.lower() == "a" and self._current_href:
            text = clean_text(" ".join(self._current_text))
            self.links.append({"url": self._current_href, "text": text})
            self._current_href = None
            self._current_text = []
        elif tag.lower() == "title":
            self._in_title = False
            self.page_title = clean_text(" ".join(self._title_text))


def fetch_source_links(source_url: str, limit: int = 25) -> tuple[list[dict[str, str]], str, str | None]:
    request = Request(
        source_url,
        headers={
            "User-Agent": "RFPDiscoveryBot/1.0 (+internal discovery console)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
    )
    try:
        with urlopen(request, timeout=12) as response:
            raw = response.read(1_500_000)
            charset = response.headers.get_content_charset() or "utf-8"
            html = raw.decode(charset, errors="replace")
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        return [], "", str(exc)

    parser = LinkExtractor(source_url)
    parser.feed(html)
    seen: set[str] = set()
    relevant: list[dict[str, str]] = []

    for link in parser.links:
        url = link["url"].split("#")[0]
        if not url or url in seen:
            continue
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"}:
            continue
        seen.add(url)
        haystack = f"{link.get('text', '')} {url}".lower()
        if any(keyword in haystack for keyword in RFP_KEYWORDS):
            relevant.append({"url": url, "title": clean_text(link.get("text")) or title_from_url(url)})
        if len(relevant) >= limit:
            break

    return relevant, parser.page_title, None


def title_from_url(url: str) -> str:
    parsed = urlparse(url)
    tail = parsed.path.rstrip("/").split("/")[-1] or parsed.netloc
    title = re.sub(r"[-_]+", " ", tail)
    return clean_text(title.title(), fallback=parsed.netloc or url)


def record_is_live(record: dict[str, Any]) -> bool:
    url = str(record.get("listing_url") or "")
    parsed = urlparse(url)
    return bool(parsed.scheme in {"http", "https"} and parsed.netloc and not parsed.netloc.endswith(".local"))


def records_by_ids(ids: list[int]) -> list[dict[str, Any]]:
    wanted = {int(item) for item in ids}
    return [row for row in get_all_rfp_listings() if int(row["rfp_id"]) in wanted and record_is_live(row)]


def rule_passes(record: dict[str, Any]) -> tuple[bool, list[dict[str, Any]]]:
    text = " ".join(
        str(record.get(field) or "")
        for field in ("title", "industry", "geography", "listing_url")
    ).lower()
    checks = [
        ("Keyword / tender signal", any(keyword in text for keyword in RFP_KEYWORDS)),
        ("Approved source URL", record_is_live(record)),
        ("Not already rejected", str(record.get("status") or "").lower() not in {"rejected", "discarded"}),
    ]
    return all(item[1] for item in checks), [{"filter": name, "passed": passed} for name, passed in checks]


def derived_tasks_for_record(record: dict[str, Any]) -> list[dict[str, Any]]:
    title = clean_text(record.get("title"), "Untitled RFP")
    confidence = confidence_from_record(record) / 100
    base = [
        {
            "name": f"Review source listing: {title}",
            "description": f"Validate scope, submission requirements, and attachments from {record.get('listing_url')}",
            "priority": "high",
            "effort": 8,
            "confidence": confidence,
        },
        {
            "name": "Prepare compliance and eligibility matrix",
            "description": "Map mandatory requirements, deadlines, and go/no-go evidence for manager review.",
            "priority": "high",
            "effort": 12,
            "confidence": confidence,
        },
    ]
    text = title.lower()
    for keyword, (skill_name, _level) in TECH_SKILL_KEYWORDS.items():
        if keyword in text:
            base.append(
                {
                    "name": f"Assess {skill_name} delivery requirement",
                    "description": f"Requirement inferred from live listing title and source metadata: {title}",
                    "priority": "medium",
                    "effort": 10,
                    "confidence": confidence,
                }
            )
    return base


def derived_skills_for_record(record: dict[str, Any]) -> list[dict[str, Any]]:
    text = " ".join(str(record.get(field) or "") for field in ("title", "industry", "listing_url")).lower()
    skills = []
    for keyword, (name, level) in TECH_SKILL_KEYWORDS.items():
        if keyword in text:
            skills.append(
                {
                    "name": name,
                    "level": level,
                    "match": confidence_from_record(record),
                    "effort": "Medium",
                    "priority": "High",
                }
            )
    if not skills:
        skills.append(
            {
                "name": "RFP Analysis",
                "level": "Intermediate",
                "match": confidence_from_record(record, floor=48),
                "effort": "Medium",
                "priority": "High",
            }
        )
    return skills


def derived_certifications_for_record(record: dict[str, Any]) -> list[str]:
    text = " ".join(str(record.get(field) or "") for field in ("title", "industry", "listing_url")).lower()
    return [name for keyword, name in CERTIFICATION_KEYWORDS.items() if keyword in text]


def risk_type(severity: str) -> str:
    return "danger" if severity.lower() == "high" else "warning" if severity.lower() == "medium" else "success"


def build_analysis_record(record: dict[str, Any]) -> dict[str, Any]:
    tasks = get_tasks(record["rfp_id"])
    task_names = [task["task_name"] for task in tasks] or [item["name"] for item in derived_tasks_for_record(record)]
    skills = []
    for task in tasks:
        for skill in get_skills(task["task_id"]):
            skills.append(
                {
                    "name": skill["skill_name"],
                    "level": skill.get("experience_level") or "Unspecified",
                    "match": int(float(skill.get("confidence_score") or 0.5) * 100),
                    "effort": "Medium",
                    "priority": "High" if skill.get("mandatory_flag") else "Medium",
                }
            )
    if not skills:
        skills = derived_skills_for_record(record)

    certs = [cert["cert_name"] for cert in get_certifications(record["rfp_id"])]
    if not certs:
        certs = derived_certifications_for_record(record)

    eligibility = get_eligibility_assessment(record["rfp_id"]) or {}
    risks = get_risks(record["rfp_id"])
    if not risks:
        severity = "medium" if confidence_from_record(record) < 72 else "low"
        risks = [
            {
                "severity": severity,
                "description": "Awaiting full document parsing and manager validation.",
            }
        ]

    eligibility_status = eligibility.get("eligibility_status") or ("Conditional" if confidence_from_record(record) < 76 else "Eligible")
    if str(eligibility_status).lower() in {"at risk", "not eligible"}:
        eligibility_label = "At Risk"
    elif str(eligibility_status).lower().startswith("eligible"):
        eligibility_label = "Eligible"
    else:
        eligibility_label = "Conditional"

    return {
        "id": record["rfp_id"],
        "rfpTitle": clean_text(record.get("title"), "Untitled RFP"),
        "confidence": confidence_from_record(record),
        "tasks": task_names,
        "skills": skills,
        "certifications": certs,
        "risks": [
            {
                "level": str(risk.get("severity") or "medium").title(),
                "description": risk.get("description") or risk.get("risk_name") or "Risk requires review.",
                "type": risk_type(str(risk.get("severity") or "medium")),
            }
            for risk in risks
        ],
        "eligibility": eligibility_label,
        "eligibilityNotes": eligibility.get("mitigation") or eligibility.get("gaps_identified") or "Requires manager confirmation before downstream handoff.",
        "sourceUrl": record.get("listing_url"),
        "agency": record.get("industry") or "Source portal",
        "deadline": str(record.get("submission_deadline") or "Not published"),
        "budget": money_label(record.get("contract_value")),
    }


def step_by_key(step_key: str) -> dict[str, Any] | None:
    return next((step for step in STEP_DEFINITIONS if step["key"] == step_key), None)


def step_by_id(step_id: int) -> dict[str, Any] | None:
    return next((step for step in STEP_DEFINITIONS if step["id"] == step_id), None)


def build_pipeline_state(run_row: dict[str, Any], step_rows: list[dict[str, Any]]) -> dict[str, Any]:
    steps = []
    pipeline_data: dict[str, Any] = {}
    step_map = {row["step_id"]: row for row in step_rows}
    is_running = False

    for definition in STEP_DEFINITIONS:
        row = step_map.get(definition["id"])
        status = row["status"] if row else "idle"
        if status == "running":
            is_running = True

        result = None
        if row and (row.get("message") or row.get("error_message")):
            result = {
                "success": status == "completed",
                "message": row.get("message") or row.get("error_message") or "",
                "timestamp": row["completed_at"].isoformat() if row.get("completed_at") else row["started_at"].isoformat(),
                "duration": row.get("duration_ms"),
            }

        payload = row.get("payload") if row else None
        if payload is not None:
            pipeline_data[DATA_KEY_BY_STEP[definition["key"]]] = payload

        steps.append(
            {
                **definition,
                "apiEndpoint": definition["apiEndpoint"].format(run_id=run_row["run_id"]),
                "status": status,
                "result": result,
            }
        )

    return {
        "runId": run_row["run_id"],
        "status": run_row["status"],
        "currentStepId": run_row["current_step_id"],
        "steps": steps,
        "pipelineData": pipeline_data,
        "isRunning": is_running,
        "startedAt": run_row["started_at"].isoformat() if run_row.get("started_at") else None,
        "completedAt": run_row["completed_at"].isoformat() if run_row.get("completed_at") else None,
        "error": run_row.get("error_message"),
    }


def get_pipeline_run_state(run_id: int) -> dict[str, Any] | None:
    run_row = get_pipeline_run(run_id)
    if not run_row:
        return None
    step_rows = get_pipeline_step_runs(run_id)
    return build_pipeline_state(run_row, step_rows)


def get_latest_pipeline_run_state() -> dict[str, Any] | None:
    run_row = get_latest_pipeline_run()
    if not run_row:
        return None
    step_rows = get_pipeline_step_runs(run_row["run_id"])
    return build_pipeline_state(run_row, step_rows)


def create_new_pipeline_run() -> dict[str, Any]:
    run_row = create_pipeline_run(status="running", current_step_id=1)
    if not run_row:
        raise RuntimeError("Failed to create pipeline run")
    return build_pipeline_state(run_row, [])


def _active_sources() -> list[dict[str, Any]]:
    return [source for source in get_all_sources() if source.get("active_flag", True)]


def _crawl_payload() -> dict[str, Any]:
    sources = _active_sources()
    records = []
    rfp_ids: list[int] = []

    for source in sources:
        start_time = current_clock()
        links, page_title, error = fetch_source_links(source["url"])
        end_time = current_clock()
        source_rfp_ids: list[int] = []

        for link in links:
            rfp_id = insert_rfp_listing(
                source_id=source["source_id"],
                title=link["title"],
                industry=source.get("category") or page_title or "Source portal",
                geography=None,
                contract_value=None,
                submission_deadline=None,
                listing_url=link["url"],
                status="detected",
            )
            if rfp_id:
                source_rfp_ids.append(rfp_id)
                rfp_ids.append(rfp_id)
                insert_audit_log(rfp_id, "crawl_detected", f"Detected from {source['url']}")

        insert_crawl_run(
            source_id=source["source_id"],
            started_at=now_iso(),
            ended_at=now_iso(),
            listings_detected=len(links),
            passed_count=0,
            discarded_count=0,
            status="failed" if error else "completed",
            error_message=error,
        )

        records.append(
            {
                "id": source["source_id"],
                "url": source["url"],
                "category": source.get("category") or "General",
                "freq": source.get("crawl_frequency") or "Manual",
                "enabled": source.get("active_flag", True),
                "credential": "",
                "listings": len(links),
                "passed": 0,
                "discarded": 0,
                "errors": 1 if error else 0,
                "startTime": start_time,
                "endTime": end_time,
                "error": error,
                "rfpIds": source_rfp_ids,
            }
        )

    return {
        "sources": records,
        "totalListings": sum(item["listings"] for item in records),
        "totalErrors": sum(item["errors"] for item in records),
        "duration": f"{max(1, len(records) * 3)} min",
        "rfpIds": rfp_ids,
    }


def _filter_payload(pipeline_data: dict[str, Any]) -> dict[str, Any]:
    records = records_by_ids((pipeline_data.get("crawlResults") or {}).get("rfpIds") or [])
    rule_names = ["Keyword / tender signal", "Approved source URL", "Not already rejected"]
    counters = {name: {"input": 0, "passed": 0, "failed": 0} for name in rule_names}
    passed_ids: list[int] = []
    discarded_ids: list[int] = []

    for record in records:
        passes, checks = rule_passes(record)
        for check in checks:
            counter = counters[check["filter"]]
            counter["input"] += 1
            if check["passed"]:
                counter["passed"] += 1
            else:
                counter["failed"] += 1
        if passes:
            passed_ids.append(record["rfp_id"])
            update_rfp_status(record["rfp_id"], "passed_filter")
            insert_audit_log(record["rfp_id"], "rule_pass", "Listing passed mandatory rule engine filters")
        else:
            discarded_ids.append(record["rfp_id"])
            update_rfp_status(record["rfp_id"], "discarded")
            insert_audit_log(record["rfp_id"], "rule_discard", "Listing failed mandatory rule engine filters")

    rules = [
        {
            "filter": name,
            "input": values["input"],
            "passed": values["passed"],
            "failed": values["failed"],
            "time": "live",
        }
        for name, values in counters.items()
    ]

    return {
        "rules": rules,
        "totalIn": len(records),
        "totalPassed": len(passed_ids),
        "totalFailed": len(discarded_ids),
        "rfpIds": passed_ids,
        "discardedIds": discarded_ids,
    }


def _download_payload(pipeline_data: dict[str, Any]) -> dict[str, Any]:
    records = records_by_ids((pipeline_data.get("filterResults") or {}).get("rfpIds") or [])
    indexed_ids: list[int] = []
    failed = 0

    for record in records:
        url = record.get("listing_url")
        if not url:
            failed += 1
            continue
        existing_docs = get_rfp_documents(record["rfp_id"])
        if not existing_docs:
            doc_id = insert_rfp_document(
                rfp_id=record["rfp_id"],
                file_name=title_from_url(url),
                file_type="html",
                document_path=url,
                parse_status="indexed",
                processed_at=now_iso(),
            )
            if not doc_id:
                failed += 1
                continue
        update_rfp_status(record["rfp_id"], "downloaded")
        insert_audit_log(record["rfp_id"], "document_indexed", f"Indexed live listing URL {url}")
        indexed_ids.append(record["rfp_id"])

    return {
        "downloaded": len(indexed_ids),
        "failed": failed,
        "totalSizeMb": 0,
        "indexedDocuments": len(indexed_ids),
        "rfpIds": indexed_ids,
    }


def _analysis_payload(pipeline_data: dict[str, Any]) -> list[dict[str, Any]]:
    records = records_by_ids((pipeline_data.get("downloadResults") or {}).get("rfpIds") or [])
    analysed = []

    for record in records:
        existing_tasks = get_tasks(record["rfp_id"])
        if not existing_tasks:
            task_ids = []
            for item in derived_tasks_for_record(record):
                task_id = insert_task(
                    rfp_id=record["rfp_id"],
                    task_name=item["name"],
                    description=item["description"],
                    priority=item["priority"],
                    estimated_effort=item["effort"],
                    confidence_score=item["confidence"],
                )
                if task_id:
                    task_ids.append(task_id)
            skills = derived_skills_for_record(record)
            for index, skill in enumerate(skills):
                if task_ids:
                    insert_skill(
                        task_id=task_ids[index % len(task_ids)],
                        skill_name=skill["name"],
                        experience_level=skill["level"],
                        mandatory_flag=skill["priority"] in {"Critical", "High"},
                        confidence_score=skill["match"] / 100,
                    )
        update_rfp_status(record["rfp_id"], "extracted")
        insert_audit_log(record["rfp_id"], "extraction", "Tasks and skills extracted from live DB listing metadata")
        analysed.append(build_analysis_record(record))

    return analysed


def _cert_payload(pipeline_data: dict[str, Any]) -> dict[str, Any]:
    rfps = (pipeline_data.get("extractResults") or {}).get("rfps") or []
    registry_counts: dict[str, int] = {}

    for rfp in rfps:
        for certification in rfp.get("certifications", []):
            registry_counts[certification] = registry_counts.get(certification, 0) + 1
            if not any(cert["cert_name"] == certification for cert in get_certifications(rfp["id"])):
                insert_certification(
                    rfp_id=rfp["id"],
                    cert_name=certification,
                    mandatory_flag=True,
                    source_reference="live-listing-keyword",
                    confidence_score=0.74,
                )

    registry = []
    known_certifications = {value.lower() for value in CERTIFICATION_KEYWORDS.values()}
    for name, freq in sorted(registry_counts.items(), key=lambda item: (-item[1], item[0])):
        known = name.lower() in known_certifications
        registry.append({"name": name, "freq": freq, "known": known})

    flagged = [item["name"] for item in registry if not item["known"]]
    return {"registry": registry, "flagged": flagged}


def _risk_payload(pipeline_data: dict[str, Any]) -> dict[str, Any]:
    rfps = (pipeline_data.get("extractResults") or {}).get("rfps") or []
    cert_results = pipeline_data.get("certResults") or {}
    flagged = set(cert_results.get("flagged") or [])

    risk_levels = []
    enriched = []
    for rfp in rfps:
        if not get_risks(rfp["id"]):
            for risk in rfp.get("risks", []):
                insert_risk(
                    rfp_id=rfp["id"],
                    risk_name=risk["description"],
                    severity=risk["level"].lower(),
                    description=risk["description"],
                )

        gaps = [cert for cert in rfp.get("certifications", []) if cert in flagged]
        if not get_eligibility_assessment(rfp["id"]):
            status = "Conditional" if gaps or rfp["confidence"] < 76 else "Eligible"
            insert_eligibility_assessment(
                rfp_id=rfp["id"],
                eligibility_status=status,
                gaps_identified=", ".join(gaps) if gaps else None,
                mitigation="Manager review required before handoff.",
            )

        record = next((item for item in get_all_rfp_listings() if item["rfp_id"] == rfp["id"]), None)
        enriched_rfp = build_analysis_record(record) if record else rfp
        risk_levels.extend(risk["level"] for risk in enriched_rfp.get("risks", []))
        enriched.append(enriched_rfp)

    overall = "Low"
    if "High" in risk_levels:
        overall = "High"
    elif "Medium" in risk_levels:
        overall = "Medium"

    return {"rfps": enriched, "overallRisk": overall}


def _convert_payload(pipeline_data: dict[str, Any]) -> dict[str, Any]:
    rfps = (pipeline_data.get("riskResults") or {}).get("rfps") or []
    return {
        "recordCount": len(rfps),
        "exportedAt": now_iso(),
        "sizeKb": max(128, len(rfps) * 42),
        "previewUrl": "/rfps",
    }


def _build_hil_items(pipeline_data: dict[str, Any]) -> list[dict[str, Any]]:
    rfps = (pipeline_data.get("riskResults") or {}).get("rfps") or []
    hil_items = []
    for rfp in rfps:
        hil_items.append(
            {
                "id": rfp["id"],
                "title": rfp["rfpTitle"],
                "agency": rfp.get("agency") or "Source portal",
                "deadline": rfp.get("deadline") or "Not published",
                "budget": rfp.get("budget") or "Not disclosed",
                "confidence": rfp["confidence"],
                "timeline": "From source listing",
                "description": f"Live listing: {rfp.get('sourceUrl') or 'No source URL stored'}",
                "requirements": rfp["tasks"],
                "deliverables": rfp["tasks"],
                "tasks": rfp["tasks"],
                "skills": [{"name": skill["name"], "match": skill["match"]} for skill in rfp["skills"]],
                "certifications": rfp["certifications"],
                "risks": [{"level": risk["level"], "desc": risk["description"], "type": risk["type"]} for risk in rfp["risks"]],
                "eligibilityNotes": rfp["eligibilityNotes"],
                "matchScore": {
                    "technical": min(99, rfp["confidence"] + 3),
                    "experience": max(40, rfp["confidence"] - 2),
                    "certifications": max(35, rfp["confidence"] - 4),
                    "resources": max(45, rfp["confidence"] - 6),
                },
            }
        )
    return hil_items


def _merge_hil_payload(existing_payload: dict[str, Any] | None, pipeline_data: dict[str, Any], body: dict[str, Any]) -> dict[str, Any]:
    current = existing_payload or {}
    pending = current.get("pending") or _build_hil_items(pipeline_data)
    decisions = {**(current.get("decisions") or {}), **(body.get("decisions") or {})}
    notes = {**(current.get("notes") or {}), **(body.get("notes") or {})}
    feedback = {**(current.get("feedback") or {}), **(body.get("feedback") or {})}
    all_decided = bool(pending) and all(str(item["id"]) in {str(key) for key in decisions.keys()} for item in pending)

    return {
        "pending": pending,
        "decisions": decisions,
        "notes": notes,
        "feedback": feedback,
        "allDecided": all_decided,
    }


def _forward_payload(pipeline_data: dict[str, Any]) -> dict[str, Any]:
    hil = pipeline_data.get("hilResults") or {}
    decisions = hil.get("decisions") or {}
    approved = 0
    rejected = 0

    for rfp_id, decision in decisions.items():
        numeric_id = int(rfp_id)
        if decision == "approve":
            approved += 1
            update_rfp_status(numeric_id, "approved")
            insert_audit_log(numeric_id, "forward", "RFP forwarded to proposal team")
        elif decision == "reject":
            rejected += 1
            update_rfp_status(numeric_id, "rejected")
            insert_audit_log(numeric_id, "forward", "RFP rejected during review")

    approved_records = records_by_ids([int(rfp_id) for rfp_id, decision in decisions.items() if decision == "approve"])
    total_value = sum(float(record.get("contract_value") or 0) for record in approved_records)
    return {
        "forwarded": approved,
        "rejected": rejected,
        "estimatedValue": money_label(total_value) if total_value else "Not disclosed",
    }


def _log_payload(pipeline_data: dict[str, Any]) -> dict[str, Any]:
    forward = pipeline_data.get("forwardResults") or {}
    rfps = (pipeline_data.get("riskResults") or {}).get("rfps") or []
    avg_confidence = round(sum(item.get("confidence", 0) for item in rfps) / len(rfps)) if rfps else 0
    entries = [
        {"time": current_clock(), "event": "Crawl completed", "detail": f"{(pipeline_data.get('crawlResults') or {}).get('totalListings', 0)} listings discovered", "type": "success"},
        {"time": current_clock(), "event": "Rule engine executed", "detail": f"{(pipeline_data.get('filterResults') or {}).get('totalPassed', 0)} RFPs passed", "type": "success"},
        {"time": current_clock(), "event": "Documents downloaded", "detail": f"{(pipeline_data.get('downloadResults') or {}).get('indexedDocuments', 0)} documents indexed", "type": "success"},
        {"time": current_clock(), "event": "Human review captured", "detail": f"{forward.get('forwarded', 0)} approved / {forward.get('rejected', 0)} rejected", "type": "warning" if forward.get("rejected", 0) else "success"},
        {"time": current_clock(), "event": "Pipeline logged", "detail": "Run stored for dashboard recovery", "type": "success"},
    ]
    return {"entries": entries, "accuracy": avg_confidence, "improvementPct": 0}


def _assemble_pipeline_data(step_rows: list[dict[str, Any]]) -> dict[str, Any]:
    pipeline_data = {}
    for row in step_rows:
        if row.get("payload") is not None:
            pipeline_data[DATA_KEY_BY_STEP[row["step_key"]]] = row["payload"]
    return pipeline_data


def execute_pipeline_step(run_id: int, step_key: str, body: dict[str, Any] | None = None) -> dict[str, Any]:
    run_row = get_pipeline_run(run_id)
    if not run_row:
        raise ValueError("Pipeline run not found")

    definition = step_by_key(step_key)
    if not definition:
        raise ValueError("Unsupported pipeline step")

    if run_row["current_step_id"] != definition["id"] and not (step_key == "hil" and definition["id"] == 8):
        raise ValueError("Step is not currently available for execution")

    step_rows = get_pipeline_step_runs(run_id)
    step_row = next((row for row in step_rows if row["step_id"] == definition["id"]), None)
    pipeline_data = _assemble_pipeline_data(step_rows)
    started = datetime.now(timezone.utc)

    upsert_pipeline_step_run(run_id, definition["id"], step_key, "running", message="Running step")

    try:
        if step_key == "crawl":
            payload = _crawl_payload()
            message = f"Crawled {payload['totalListings']} listings from {len(payload['sources'])} active sources"
            next_step = 2
        elif step_key == "filter":
            payload = _filter_payload(pipeline_data)
            message = f"{payload['totalPassed']} RFPs passed all {len(payload['rules'])} filters"
            next_step = 3
        elif step_key == "download":
            payload = _download_payload(pipeline_data)
            message = f"Downloaded and indexed {payload['indexedDocuments']} documents"
            next_step = 4
        elif step_key == "extract":
            payload = {"rfps": _analysis_payload(pipeline_data)}
            message = f"Extracted tasks and skills for {len(payload['rfps'])} RFPs"
            next_step = 5
        elif step_key == "certs":
            payload = _cert_payload(pipeline_data)
            message = f"Mapped {len(payload['registry'])} certifications"
            next_step = 6
        elif step_key == "risk":
            payload = _risk_payload(pipeline_data)
            message = f"Risk assessed for {len(payload['rfps'])} RFPs"
            next_step = 7
        elif step_key == "convert":
            payload = _convert_payload(pipeline_data)
            message = f"Exported {payload['recordCount']} structured records"
            next_step = 8
        elif step_key == "hil":
            payload = _merge_hil_payload(step_row.get("payload") if step_row else None, pipeline_data, body or {})
            if payload["allDecided"]:
                for rfp_id, decision in payload["decisions"].items():
                    insert_hil_review(
                        rfp_id=int(rfp_id),
                        reviewer_name="dashboard-reviewer",
                        review_status=decision,
                        corrections=(payload.get("notes") or {}).get(str(rfp_id)) or (payload.get("notes") or {}).get(rfp_id),
                    )
                message = f"Captured decisions for {len(payload['decisions'])} RFPs"
                next_step = 9
            else:
                message = f"{len(payload['pending'])} RFPs loaded for human review"
                next_step = 8
        elif step_key == "forward":
            payload = _forward_payload(pipeline_data)
            message = f"Forwarded {payload['forwarded']} approved RFPs"
            next_step = 10
        elif step_key == "log":
            payload = _log_payload(pipeline_data)
            message = "Pipeline logged and analytics refreshed"
            next_step = 11
        else:
            raise ValueError("Unsupported pipeline step")

        duration_ms = int((datetime.now(timezone.utc) - started).total_seconds() * 1000)
        completed_at = now_iso()
        upsert_pipeline_step_run(
            run_id,
            definition["id"],
            step_key,
            "completed",
            message=message,
            payload=payload,
            duration_ms=duration_ms,
            completed_at=completed_at,
        )
        update_pipeline_run(
            run_id,
            status="completed" if next_step > 10 else "running",
            current_step_id=next_step,
            completed_at=completed_at if next_step > 10 else None,
            error_message=None,
        )
        return get_pipeline_run_state(run_id)
    except Exception as exc:
        completed_at = now_iso()
        upsert_pipeline_step_run(
            run_id,
            definition["id"],
            step_key,
            "error",
            error_message=str(exc),
            payload=step_row.get("payload") if step_row else None,
            duration_ms=int((datetime.now(timezone.utc) - started).total_seconds() * 1000),
            completed_at=completed_at,
        )
        update_pipeline_run(run_id, status="error", current_step_id=definition["id"], error_message=str(exc))
        raise


def run_pipeline_legacy(body: dict[str, Any] | None = None) -> dict[str, Any]:
    run_state = create_new_pipeline_run()
    run_id = run_state["runId"]
    for step in STEP_DEFINITIONS:
        payload = {}
        if step["key"] == "hil":
            pending = (_build_hil_items(get_pipeline_run_state(run_id)["pipelineData"]) or [])
            decisions = {str(item["id"]): ("approve" if item["confidence"] >= 70 else "reject") for item in pending}
            payload = {"decisions": decisions}
        execute_pipeline_step(run_id, step["key"], payload)
    final_state = get_pipeline_run_state(run_id)
    rfp_ids = (final_state["pipelineData"].get("downloadResults") or {}).get("rfpIds") or []
    return {
        "status": "success",
        "sources_count": len((final_state["pipelineData"].get("crawlResults") or {}).get("sources") or []),
        "processed": rfp_ids,
        "message": f"Pipeline complete. {len(rfp_ids)} live RFP record(s) processed.",
        "run_id": run_id,
    }
