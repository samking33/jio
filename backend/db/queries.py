import json
from datetime import date, datetime
from decimal import Decimal
import psycopg2
import psycopg2.extras
from db.connection import get_connection


# ─── Source URLs ──────────────────────────────────────────────────────────────

def get_all_sources():
    """
    Fetches all source URLs from the source_urls table.
    
    Returns:
        list[dict]: Each dict contains: source_id, source_name, url, category, 
                    crawl_frequency, active_flag, created_at
    """
    query = "SELECT * FROM source_urls ORDER BY source_id;"
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query)
                rows = cur.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except psycopg2.Error as e:
        print(f"[DB] get_all_sources error: {e}")
        return []


def insert_source(source_name: str, url: str, category: str = None, 
                  crawl_frequency: str = None):
    """
    Inserts a new source URL into the source_urls table.
    
    Args:
        source_name: Name/label for this source
        url: The source URL to crawl
        category: Category of the source (optional)
        crawl_frequency: How often to crawl (optional)
    
    Returns:
        int | None: The new source_id, or None on failure
    """
    query = """
        INSERT INTO source_urls (source_name, url, category, crawl_frequency)
        VALUES (%s, %s, %s, %s)
        RETURNING source_id;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, (source_name, url, category, crawl_frequency))
                new_id = cur.fetchone()[0]
        conn.close()
        return new_id
    except psycopg2.Error as e:
        print(f"[DB] insert_source error: {e}")
        return None


def get_source_by_id(source_id: int):
    """
    Fetches a single source by ID.
    
    Returns:
        dict | None: Source record or None if not found
    """
    query = "SELECT * FROM source_urls WHERE source_id = %s;"
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, (source_id,))
                row = cur.fetchone()
        conn.close()
        return dict(row) if row else None
    except psycopg2.Error as e:
        print(f"[DB] get_source_by_id error: {e}")
        return None


# ─── Crawl Runs ───────────────────────────────────────────────────────────────

def insert_crawl_run(source_id: int, started_at: str, ended_at: str = None,
                     listings_detected: int = 0, passed_count: int = 0,
                     discarded_count: int = 0, status: str = "pending",
                     error_message: str = None):
    """
    Records a crawl run for a source.
    
    Args:
        source_id: Foreign key to source_urls
        started_at: ISO timestamp when crawl started
        ended_at: ISO timestamp when crawl ended (optional)
        listings_detected: Number of RFPs detected
        passed_count: Number passed validation
        discarded_count: Number discarded
        status: Crawl status (pending, running, completed, failed)
        error_message: Error details if failed (optional)
    
    Returns:
        int | None: The new crawl_id, or None on failure
    """
    query = """
        INSERT INTO crawl_runs 
        (source_id, started_at, ended_at, listings_detected, passed_count,
         discarded_count, status, error_message)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING crawl_id;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, (source_id, started_at, ended_at, 
                                   listings_detected, passed_count,
                                   discarded_count, status, error_message))
                new_id = cur.fetchone()[0]
        conn.close()
        return new_id
    except psycopg2.Error as e:
        print(f"[DB] insert_crawl_run error: {e}")
        return None


def get_crawl_runs(source_id: int = None):
    """
    Fetches all crawl runs, optionally filtered by source_id.
    
    Returns:
        list[dict]: Crawl run records
    """
    if source_id:
        query = "SELECT * FROM crawl_runs WHERE source_id = %s ORDER BY started_at DESC;"
        params = (source_id,)
    else:
        query = "SELECT * FROM crawl_runs ORDER BY started_at DESC;"
        params = ()
    
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, params)
                rows = cur.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except psycopg2.Error as e:
        print(f"[DB] get_crawl_runs error: {e}")
        return []


# ─── RFP Listings ─────────────────────────────────────────────────────────────

def insert_rfp_listing(source_id: int, title: str, industry: str = None,
                       geography: str = None, contract_value: float = None,
                       submission_deadline: str = None, listing_url: str = None,
                       status: str = "new"):
    """
    Records a discovered RFP listing.
    
    Args:
        source_id: Foreign key to source_urls
        title: RFP title
        industry: Industry classification
        geography: Geographic scope
        contract_value: Estimated contract value
        submission_deadline: Deadline date (ISO format)
        listing_url: URL to the RFP
        status: Status (new, in_progress, completed, archived)
    
    Returns:
        int | None: The new rfp_id, or None on failure
    """
    query = """
        INSERT INTO rfp_listings 
        (source_id, title, industry, geography, contract_value, 
         submission_deadline, listing_url, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING rfp_id;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, (source_id, title, industry, geography,
                                   contract_value, submission_deadline,
                                   listing_url, status))
                new_id = cur.fetchone()[0]
        conn.close()
        return new_id
    except psycopg2.Error as e:
        print(f"[DB] insert_rfp_listing error: {e}")
        return None


def get_all_rfp_listings():
    """
    Fetches all RFP listings.
    
    Returns:
        list[dict]: All RFP records
    """
    query = "SELECT * FROM rfp_listings ORDER BY detected_at DESC;"
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query)
                rows = cur.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except psycopg2.Error as e:
        print(f"[DB] get_all_rfp_listings error: {e}")
        return []


def get_rfp_listing_by_id(rfp_id: int):
    """
    Fetches a single RFP listing by ID.
    
    Returns:
        dict | None: RFP record or None if not found
    """
    query = "SELECT * FROM rfp_listings WHERE rfp_id = %s;"
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, (rfp_id,))
                row = cur.fetchone()
        conn.close()
        return dict(row) if row else None
    except psycopg2.Error as e:
        print(f"[DB] get_rfp_listing_by_id error: {e}")
        return None


# ─── RFP Documents ────────────────────────────────────────────────────────────

def insert_rfp_document(rfp_id: int, file_name: str, file_type: str,
                       document_path: str, parse_status: str = "pending",
                       processed_at: str = None):
    """
    Records an RFP document.
    
    Returns:
        int | None: The new document_id, or None on failure
    """
    query = """
        INSERT INTO rfp_documents 
        (rfp_id, file_name, file_type, document_path, parse_status, processed_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING document_id;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, (rfp_id, file_name, file_type, 
                                   document_path, parse_status, processed_at))
                new_id = cur.fetchone()[0]
        conn.close()
        return new_id
    except psycopg2.Error as e:
        print(f"[DB] insert_rfp_document error: {e}")
        return None


def get_rfp_documents(rfp_id: int):
    """
    Fetches all documents for an RFP.
    
    Returns:
        list[dict]: Document records
    """
    query = "SELECT * FROM rfp_documents WHERE rfp_id = %s;"
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, (rfp_id,))
                rows = cur.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except psycopg2.Error as e:
        print(f"[DB] get_rfp_documents error: {e}")
        return []


# ─── Tasks ────────────────────────────────────────────────────────────────────

def insert_task(rfp_id: int, task_name: str, description: str = None,
                priority: str = "medium", estimated_effort: int = None,
                confidence_score: float = None):
    """
    Records a task extracted from an RFP.
    
    Returns:
        int | None: The new task_id, or None on failure
    """
    query = """
        INSERT INTO tasks 
        (rfp_id, task_name, description, priority, estimated_effort, confidence_score)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING task_id;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, (rfp_id, task_name, description, priority,
                                   estimated_effort, confidence_score))
                new_id = cur.fetchone()[0]
        conn.close()
        return new_id
    except psycopg2.Error as e:
        print(f"[DB] insert_task error: {e}")
        return None


def get_tasks(rfp_id: int):
    """
    Fetches all tasks for an RFP.
    
    Returns:
        list[dict]: Task records
    """
    query = "SELECT * FROM tasks WHERE rfp_id = %s;"
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, (rfp_id,))
                rows = cur.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except psycopg2.Error as e:
        print(f"[DB] get_tasks error: {e}")
        return []


# ─── Skills ───────────────────────────────────────────────────────────────────

def insert_skill(task_id: int, skill_name: str, experience_level: str = None,
                 mandatory_flag: bool = False, confidence_score: float = None):
    """
    Records a skill requirement for a task.
    
    Returns:
        int | None: The new skill_id, or None on failure
    """
    query = """
        INSERT INTO skills 
        (task_id, skill_name, experience_level, mandatory_flag, confidence_score)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING skill_id;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, (task_id, skill_name, experience_level,
                                   mandatory_flag, confidence_score))
                new_id = cur.fetchone()[0]
        conn.close()
        return new_id
    except psycopg2.Error as e:
        print(f"[DB] insert_skill error: {e}")
        return None


def get_skills(task_id: int):
    """
    Fetches all skills for a task.
    
    Returns:
        list[dict]: Skill records
    """
    query = "SELECT * FROM skills WHERE task_id = %s;"
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, (task_id,))
                rows = cur.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except psycopg2.Error as e:
        print(f"[DB] get_skills error: {e}")
        return []


# ─── Certifications ───────────────────────────────────────────────────────────

def insert_certification(rfp_id: int, cert_name: str, mandatory_flag: bool = False,
                        source_reference: str = None, confidence_score: float = None):
    """
    Records a certification requirement for an RFP.
    
    Returns:
        int | None: The new cert_id, or None on failure
    """
    query = """
        INSERT INTO certifications 
        (rfp_id, cert_name, mandatory_flag, source_reference, confidence_score)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING cert_id;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, (rfp_id, cert_name, mandatory_flag,
                                   source_reference, confidence_score))
                new_id = cur.fetchone()[0]
        conn.close()
        return new_id
    except psycopg2.Error as e:
        print(f"[DB] insert_certification error: {e}")
        return None


def get_certifications(rfp_id: int):
    """
    Fetches all certifications required for an RFP.
    
    Returns:
        list[dict]: Certification records
    """
    query = "SELECT * FROM certifications WHERE rfp_id = %s;"
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, (rfp_id,))
                rows = cur.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except psycopg2.Error as e:
        print(f"[DB] get_certifications error: {e}")
        return []


# ─── Eligibility Assessments ──────────────────────────────────────────────────

def insert_eligibility_assessment(rfp_id: int, eligibility_status: str = "pending",
                                 gaps_identified: str = None, mitigation: str = None):
    """
    Records an eligibility assessment for an RFP.
    
    Returns:
        int | None: The new assessment_id, or None on failure
    """
    query = """
        INSERT INTO eligibility_assessments 
        (rfp_id, eligibility_status, gaps_identified, mitigation)
        VALUES (%s, %s, %s, %s)
        RETURNING assessment_id;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, (rfp_id, eligibility_status, 
                                   gaps_identified, mitigation))
                new_id = cur.fetchone()[0]
        conn.close()
        return new_id
    except psycopg2.Error as e:
        print(f"[DB] insert_eligibility_assessment error: {e}")
        return None


def get_eligibility_assessment(rfp_id: int):
    """
    Fetches the eligibility assessment for an RFP.
    
    Returns:
        dict | None: Assessment record or None if not found
    """
    query = "SELECT * FROM eligibility_assessments WHERE rfp_id = %s;"
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, (rfp_id,))
                row = cur.fetchone()
        conn.close()
        return dict(row) if row else None
    except psycopg2.Error as e:
        print(f"[DB] get_eligibility_assessment error: {e}")
        return None


# ─── Risk Register ────────────────────────────────────────────────────────────

def insert_risk(rfp_id: int, risk_name: str, severity: str = "medium",
                description: str = None):
    """
    Records a risk for an RFP.
    
    Returns:
        int | None: The new risk_id, or None on failure
    """
    query = """
        INSERT INTO risk_register 
        (rfp_id, risk_name, severity, description)
        VALUES (%s, %s, %s, %s)
        RETURNING risk_id;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, (rfp_id, risk_name, severity, description))
                new_id = cur.fetchone()[0]
        conn.close()
        return new_id
    except psycopg2.Error as e:
        print(f"[DB] insert_risk error: {e}")
        return None


def get_risks(rfp_id: int):
    """
    Fetches all risks for an RFP.
    
    Returns:
        list[dict]: Risk records
    """
    query = "SELECT * FROM risk_register WHERE rfp_id = %s;"
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, (rfp_id,))
                rows = cur.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except psycopg2.Error as e:
        print(f"[DB] get_risks error: {e}")
        return []


# ─── HIL Reviews ──────────────────────────────────────────────────────────────

def insert_hil_review(rfp_id: int, reviewer_name: str, review_status: str = "pending",
                     corrections: str = None):
    """
    Records a human-in-the-loop review for an RFP.
    
    Returns:
        int | None: The new review_id, or None on failure
    """
    query = """
        INSERT INTO hil_reviews 
        (rfp_id, reviewer_name, review_status, corrections)
        VALUES (%s, %s, %s, %s)
        RETURNING review_id;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, (rfp_id, reviewer_name, review_status, corrections))
                new_id = cur.fetchone()[0]
        conn.close()
        return new_id
    except psycopg2.Error as e:
        print(f"[DB] insert_hil_review error: {e}")
        return None


def get_hil_reviews(rfp_id: int):
    """
    Fetches all reviews for an RFP.
    
    Returns:
        list[dict]: Review records
    """
    query = "SELECT * FROM hil_reviews WHERE rfp_id = %s;"
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, (rfp_id,))
                rows = cur.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except psycopg2.Error as e:
        print(f"[DB] get_hil_reviews error: {e}")
        return []


# ─── Audit Logs ───────────────────────────────────────────────────────────────

def insert_audit_log(rfp_id: int, action_type: str, action_detail: str = None):
    """
    Records an audit log entry for an RFP.
    
    Returns:
        int | None: The new log_id, or None on failure
    """
    query = """
        INSERT INTO audit_logs 
        (rfp_id, action_type, action_detail)
        VALUES (%s, %s, %s)
        RETURNING log_id;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, (rfp_id, action_type, action_detail))
                new_id = cur.fetchone()[0]
        conn.close()
        return new_id
    except psycopg2.Error as e:
        print(f"[DB] insert_audit_log error: {e}")
        return None


def get_audit_logs(rfp_id: int):
    """
    Fetches all audit logs for an RFP.

    Returns:
        list[dict]: Audit log records
    """
    query = "SELECT * FROM audit_logs WHERE rfp_id = %s ORDER BY timestamp DESC;"
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, (rfp_id,))
                rows = cur.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except psycopg2.Error as e:
        print(f"[DB] get_audit_logs error: {e}")
        return []


# ─── RFP Status Update ────────────────────────────────────────────────────────

def update_rfp_status(rfp_id: int, status: str) -> bool:
    """
    Updates the status field of an RFP listing.

    Args:
        rfp_id: The RFP to update
        status: New status value (e.g. "approved", "rejected", "in_progress")

    Returns:
        bool: True on success, False on failure
    """
    query = "UPDATE rfp_listings SET status = %s WHERE rfp_id = %s;"
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, (status, rfp_id))
        conn.close()
        return True
    except psycopg2.Error as e:
        print(f"[DB] update_rfp_status error: {e}")
        return False


# ─── Source Updates ───────────────────────────────────────────────────────────

def update_source_active_flag(source_id: int, active_flag: bool) -> bool:
    """
    Toggles the active_flag for a source URL.

    Returns:
        bool: True on success, False on failure
    """
    query = "UPDATE source_urls SET active_flag = %s WHERE source_id = %s;"
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, (active_flag, source_id))
        conn.close()
        return True
    except psycopg2.Error as e:
        print(f"[DB] update_source_active_flag error: {e}")
        return False


def delete_source(source_id: int) -> bool:
    """
    Deletes a source URL record by ID.

    Returns:
        bool: True on success, False on failure
    """
    query = "DELETE FROM source_urls WHERE source_id = %s;"
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, (source_id,))
        conn.close()
        return True
    except psycopg2.Error as e:
        print(f"[DB] delete_source error: {e}")
        return False


# ─── Pipeline Runs ───────────────────────────────────────────────────────────

def create_pipeline_run(status: str = "pending", current_step_id: int = 1):
    query = """
        INSERT INTO pipeline_runs (status, current_step_id)
        VALUES (%s, %s)
        RETURNING run_id, status, current_step_id, started_at, completed_at, error_message;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, (status, current_step_id))
                row = cur.fetchone()
        conn.close()
        return dict(row) if row else None
    except psycopg2.Error as e:
        print(f"[DB] create_pipeline_run error: {e}")
        return None


def update_pipeline_run(run_id: int, status: str = None, current_step_id: int = None,
                        completed_at: str = None, error_message: str = None) -> bool:
    fields = []
    params = []

    if status is not None:
        fields.append("status = %s")
        params.append(status)
    if current_step_id is not None:
        fields.append("current_step_id = %s")
        params.append(current_step_id)
    if completed_at is not None:
        fields.append("completed_at = %s")
        params.append(completed_at)
    if error_message is not None:
        fields.append("error_message = %s")
        params.append(error_message)

    if not fields:
        return False

    params.append(run_id)
    query = f"""
        UPDATE pipeline_runs
        SET {", ".join(fields)}
        WHERE run_id = %s;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, tuple(params))
        conn.close()
        return True
    except psycopg2.Error as e:
        print(f"[DB] update_pipeline_run error: {e}")
        return False


def get_pipeline_run(run_id: int):
    query = """
        SELECT run_id, status, current_step_id, started_at, completed_at, error_message
        FROM pipeline_runs
        WHERE run_id = %s;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, (run_id,))
                row = cur.fetchone()
        conn.close()
        return dict(row) if row else None
    except psycopg2.Error as e:
        print(f"[DB] get_pipeline_run error: {e}")
        return None


def get_latest_pipeline_run():
    query = """
        SELECT run_id, status, current_step_id, started_at, completed_at, error_message
        FROM pipeline_runs
        ORDER BY started_at DESC, run_id DESC
        LIMIT 1;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query)
                row = cur.fetchone()
        conn.close()
        return dict(row) if row else None
    except psycopg2.Error as e:
        print(f"[DB] get_latest_pipeline_run error: {e}")
        return None


def upsert_pipeline_step_run(run_id: int, step_id: int, step_key: str, status: str,
                             message: str = None, error_message: str = None, payload=None,
                             duration_ms: int = None, completed_at: str = None):
    query = """
        INSERT INTO pipeline_step_runs (
            run_id, step_id, step_key, status, message, error_message,
            payload, duration_ms, completed_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (run_id, step_id)
        DO UPDATE SET
            status = EXCLUDED.status,
            message = EXCLUDED.message,
            error_message = EXCLUDED.error_message,
            payload = EXCLUDED.payload,
            duration_ms = EXCLUDED.duration_ms,
            completed_at = EXCLUDED.completed_at
        RETURNING step_run_id, run_id, step_id, step_key, status, message,
                  error_message, payload, started_at, completed_at, duration_ms;
    """
    wrapped_payload = psycopg2.extras.Json(payload) if payload is not None else None
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(
                    query,
                    (
                        run_id, step_id, step_key, status, message, error_message,
                        wrapped_payload, duration_ms, completed_at,
                    ),
                )
                row = cur.fetchone()
        conn.close()
        return dict(row) if row else None
    except psycopg2.Error as e:
        print(f"[DB] upsert_pipeline_step_run error: {e}")
        return None


def get_pipeline_step_runs(run_id: int):
    query = """
        SELECT step_run_id, run_id, step_id, step_key, status, message,
               error_message, payload, started_at, completed_at, duration_ms
        FROM pipeline_step_runs
        WHERE run_id = %s
        ORDER BY step_id ASC;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, (run_id,))
                rows = cur.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except psycopg2.Error as e:
        print(f"[DB] get_pipeline_step_runs error: {e}")
        return []


# ─── Platform Metrics ───────────────────────────────────────────────────────

def _metrics_json_safe(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, list):
        return [_metrics_json_safe(item) for item in value]
    if isinstance(value, dict):
        return {key: _metrics_json_safe(item) for key, item in value.items()}
    return value

def get_platform_metrics():
    """
    Returns live dashboard metrics computed from persisted PostgreSQL state.
    No display numbers are synthesized here; missing data returns zero/null.
    """
    query = """
        SELECT
            (SELECT COUNT(*) FROM source_urls) AS sources_total,
            (SELECT COUNT(*) FROM source_urls WHERE active_flag IS DISTINCT FROM FALSE) AS sources_active,
            (SELECT COUNT(*) FROM rfp_listings) AS rfps_total,
            (SELECT COUNT(*) FROM rfp_listings WHERE status IN ('detected','passed_filter','downloaded','extracted')) AS rfps_active,
            (SELECT COUNT(*) FROM rfp_listings WHERE status = 'approved') AS rfps_approved,
            (SELECT COUNT(*) FROM rfp_listings WHERE status IN ('rejected','discarded')) AS rfps_rejected,
            (SELECT COALESCE(SUM(contract_value), 0) FROM rfp_listings WHERE contract_value IS NOT NULL) AS contract_value_total,
            (SELECT COUNT(*) FROM crawl_runs) AS crawl_runs_total,
            (SELECT COALESCE(SUM(listings_detected), 0) FROM crawl_runs) AS listings_detected_total,
            (SELECT COALESCE(SUM(passed_count), 0) FROM crawl_runs) AS listings_passed_total,
            (SELECT COALESCE(SUM(discarded_count), 0) FROM crawl_runs) AS listings_discarded_total,
            (SELECT COUNT(*) FROM crawl_runs WHERE status = 'failed') AS crawl_errors_total,
            (SELECT COUNT(*) FROM tasks) AS tasks_total,
            (SELECT COUNT(*) FROM skills) AS skills_total,
            (SELECT COUNT(*) FROM certifications) AS certifications_total,
            (SELECT COUNT(*) FROM certifications WHERE confidence_score IS NULL OR confidence_score < 0.75) AS certifications_flagged,
            (SELECT COUNT(*) FROM risk_register) AS risks_total,
            (SELECT COUNT(*) FROM risk_register WHERE LOWER(severity) = 'high') AS risks_high,
            (SELECT COUNT(*) FROM hil_reviews) AS reviews_total,
            (SELECT COUNT(*) FROM hil_reviews WHERE review_status IN ('approve','approved')) AS reviews_approved,
            (SELECT COUNT(*) FROM hil_reviews WHERE review_status IN ('reject','rejected')) AS reviews_rejected,
            (SELECT COUNT(*) FROM audit_logs) AS audit_logs_total,
            (SELECT AVG(confidence_score) FROM tasks WHERE confidence_score IS NOT NULL) AS avg_task_confidence;
    """
    latest_rfps_query = """
        SELECT rfp_id, title, industry, listing_url, status, detected_at, contract_value, submission_deadline
        FROM rfp_listings
        ORDER BY detected_at DESC, rfp_id DESC
        LIMIT 8;
    """
    latest_audit_query = """
        SELECT log_id, rfp_id, action_type, action_detail, timestamp
        FROM audit_logs
        ORDER BY timestamp DESC, log_id DESC
        LIMIT 8;
    """
    latest_runs_query = """
        SELECT crawl_runs.crawl_id, crawl_runs.source_id, source_urls.source_name, source_urls.url,
               crawl_runs.started_at, crawl_runs.ended_at, crawl_runs.listings_detected,
               crawl_runs.passed_count, crawl_runs.discarded_count, crawl_runs.status,
               crawl_runs.error_message
        FROM crawl_runs
        LEFT JOIN source_urls ON source_urls.source_id = crawl_runs.source_id
        ORDER BY crawl_runs.started_at DESC, crawl_runs.crawl_id DESC
        LIMIT 8;
    """
    try:
        conn = get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query)
                metrics = dict(cur.fetchone() or {})
                cur.execute(latest_rfps_query)
                latest_rfps = [dict(row) for row in cur.fetchall()]
                cur.execute(latest_audit_query)
                latest_audit = [dict(row) for row in cur.fetchall()]
                cur.execute(latest_runs_query)
                latest_crawls = [dict(row) for row in cur.fetchall()]
        conn.close()
        return _metrics_json_safe({
            **metrics,
            "latest_rfps": latest_rfps,
            "latest_audit_logs": latest_audit,
            "latest_crawl_runs": latest_crawls,
        })
    except psycopg2.Error as e:
        print(f"[DB] get_platform_metrics error: {e}")
        return {}
