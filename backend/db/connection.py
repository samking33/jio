import psycopg2
import psycopg2.extras  # enables dict-style cursor
from config import DB_CONFIG


def get_connection():
    """
    Opens and returns a new PostgreSQL connection using settings from config.py.
    Caller is responsible for closing the connection (use with `with` or explicit .close()).
    Raises psycopg2.OperationalError if the DB is unreachable.
    """
    conn = psycopg2.connect(**DB_CONFIG)
    return conn


def init_db():
    """
    Creates the required tables if they don't already exist.
    Call this once at application startup.
    """
    tables = [
        """
        CREATE TABLE IF NOT EXISTS source_urls (
            source_id SERIAL PRIMARY KEY,
            source_name TEXT,
            url TEXT,
            category TEXT,
            crawl_frequency TEXT,
            active_flag BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS crawl_runs (
            crawl_id SERIAL PRIMARY KEY,
            source_id INT REFERENCES source_urls(source_id),
            started_at TIMESTAMP,
            ended_at TIMESTAMP,
            listings_detected INT,
            passed_count INT,
            discarded_count INT,
            status VARCHAR(50),
            error_message TEXT
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS rfp_listings (
            rfp_id SERIAL PRIMARY KEY,
            source_id INT REFERENCES source_urls(source_id),
            title TEXT,
            industry TEXT,
            geography TEXT,
            contract_value NUMERIC,
            submission_deadline DATE,
            listing_url TEXT,
            status VARCHAR(50),
            detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS rfp_documents (
            document_id SERIAL PRIMARY KEY,
            rfp_id INT REFERENCES rfp_listings(rfp_id),
            file_name TEXT,
            file_type VARCHAR(50),
            document_path TEXT,
            parse_status VARCHAR(50),
            processed_at TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS tasks (
            task_id SERIAL PRIMARY KEY,
            rfp_id INT REFERENCES rfp_listings(rfp_id),
            task_name TEXT,
            description TEXT,
            priority VARCHAR(30),
            estimated_effort INT,
            confidence_score NUMERIC
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS skills (
            skill_id SERIAL PRIMARY KEY,
            task_id INT REFERENCES tasks(task_id),
            skill_name TEXT,
            experience_level VARCHAR(50),
            mandatory_flag BOOLEAN,
            confidence_score NUMERIC
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS certifications (
            cert_id SERIAL PRIMARY KEY,
            rfp_id INT REFERENCES rfp_listings(rfp_id),
            cert_name TEXT,
            mandatory_flag BOOLEAN,
            source_reference TEXT,
            confidence_score NUMERIC
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS eligibility_assessments (
            assessment_id SERIAL PRIMARY KEY,
            rfp_id INT REFERENCES rfp_listings(rfp_id),
            eligibility_status VARCHAR(50),
            gaps_identified TEXT,
            mitigation TEXT,
            assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS risk_register (
            risk_id SERIAL PRIMARY KEY,
            rfp_id INT REFERENCES rfp_listings(rfp_id),
            risk_name TEXT,
            severity VARCHAR(30),
            description TEXT
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS hil_reviews (
            review_id SERIAL PRIMARY KEY,
            rfp_id INT REFERENCES rfp_listings(rfp_id),
            reviewer_name TEXT,
            review_status VARCHAR(50),
            corrections TEXT,
            reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS audit_logs (
            log_id SERIAL PRIMARY KEY,
            rfp_id INT REFERENCES rfp_listings(rfp_id),
            action_type VARCHAR(100),
            action_detail TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
    ]

    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                for table_sql in tables:
                    cur.execute(table_sql)
        conn.close()
        print("[DB] All tables initialised successfully.")
    except psycopg2.Error as e:
        print(f"[DB] Error during init_db: {e}")
        raise
