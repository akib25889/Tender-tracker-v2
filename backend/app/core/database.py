from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Engine configuration with dialect-specific settings
connect_args = {}
engine_kwargs = {"echo": False}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    engine_kwargs.update(
        {
            "pool_pre_ping": True,
            "pool_recycle": 3600,
            "pool_size": 10,
            "max_overflow": 20,
        }
    )

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs,
)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def run_migrations():
    """Ensure newly introduced columns exist in SQLite / MySQL tables."""
    from sqlalchemy import text

    try:
        with engine.connect() as conn:
            if engine.dialect.name == "sqlite":
                result = conn.execute(text("PRAGMA table_info(tenders)")).fetchall()
                existing_cols = {row[1] for row in result}
                if "currency" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN currency VARCHAR(10) DEFAULT 'USD'"
                        )
                    )
                if "exchange_rate_to_bdt" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN exchange_rate_to_bdt FLOAT DEFAULT 122.0"
                        )
                    )
                if "exchange_rate_date" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN exchange_rate_date VARCHAR(50) DEFAULT ''"
                        )
                    )
                if "estimated_value_bdt" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN estimated_value_bdt FLOAT DEFAULT 0.0"
                        )
                    )
                if "important_clauses" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN important_clauses JSON DEFAULT '[]'"
                        )
                    )
                if "procurement_manager_name" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN procurement_manager_name VARCHAR(150) DEFAULT NULL"
                        )
                    )
                if "procurement_manager_designation" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN procurement_manager_designation VARCHAR(150) DEFAULT NULL"
                        )
                    )
                if "procurement_manager_email" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN procurement_manager_email VARCHAR(150) DEFAULT NULL"
                        )
                    )
                if "procurement_manager_phone" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN procurement_manager_phone VARCHAR(100) DEFAULT NULL"
                        )
                    )
                if "helpline_phone" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN helpline_phone VARCHAR(100) DEFAULT NULL"
                        )
                    )
                if "helpline_email" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN helpline_email VARCHAR(150) DEFAULT NULL"
                        )
                    )
                if "helpline_hours" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN helpline_hours VARCHAR(150) DEFAULT NULL"
                        )
                    )
                # Milestone Schedule & Commercial migrations (Req #17 & #20)
                if "opening_date" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN opening_date VARCHAR(50) DEFAULT NULL"
                        )
                    )
                if "contract_signing_date" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN contract_signing_date VARCHAR(50) DEFAULT NULL"
                        )
                    )
                if "work_start_date" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN work_start_date VARCHAR(50) DEFAULT NULL"
                        )
                    )
                if "possible_period" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN possible_period VARCHAR(100) DEFAULT NULL"
                        )
                    )
                if "product_handover_date" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN product_handover_date VARCHAR(50) DEFAULT NULL"
                        )
                    )
                if "maintenance_period" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN maintenance_period VARCHAR(100) DEFAULT NULL"
                        )
                    )
                if "schedule_purchase_deadline" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN schedule_purchase_deadline VARCHAR(50) DEFAULT NULL"
                        )
                    )
                if "schedule_purchase_method" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN schedule_purchase_method VARCHAR(50) DEFAULT NULL"
                        )
                    )
                if "tender_security_amount" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN tender_security_amount FLOAT DEFAULT NULL"
                        )
                    )
                if "tender_security_method" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN tender_security_method VARCHAR(50) DEFAULT NULL"
                        )
                    )
                if "post_award_data" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN post_award_data JSON DEFAULT NULL"
                        )
                    )
                if "financial_model" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tenders ADD COLUMN financial_model JSON DEFAULT '{}'"
                        )
                    )
                # Ensure tender_financial_rules table exists in SQLite
                conn.execute(text("""
                        CREATE TABLE IF NOT EXISTS tender_financial_rules (
                            id VARCHAR(50) PRIMARY KEY,
                            tender_id VARCHAR(50) NOT NULL,
                            rule_category VARCHAR(100) NOT NULL,
                            rule_type VARCHAR(100) DEFAULT NULL,
                            financial_value FLOAT DEFAULT NULL,
                            currency VARCHAR(10) DEFAULT 'BDT',
                            percentage FLOAT DEFAULT NULL,
                            frequency VARCHAR(50) DEFAULT NULL,
                            payment_trigger VARCHAR(255) DEFAULT NULL,
                            payment_due_days INTEGER DEFAULT NULL,
                            penalty_rate FLOAT DEFAULT NULL,
                            penalty_frequency VARCHAR(50) DEFAULT NULL,
                            maximum_penalty FLOAT DEFAULT NULL,
                            penalty_basis VARCHAR(100) DEFAULT NULL,
                            retention_percentage FLOAT DEFAULT NULL,
                            advance_percentage FLOAT DEFAULT NULL,
                            advance_recovery_method VARCHAR(255) DEFAULT NULL,
                            subscription_type VARCHAR(50) DEFAULT NULL,
                            subscription_frequency VARCHAR(50) DEFAULT NULL,
                            contract_duration VARCHAR(100) DEFAULT NULL,
                            price_escalation VARCHAR(255) DEFAULT NULL,
                            tax_rate FLOAT DEFAULT NULL,
                            vat_rate FLOAT DEFAULT NULL,
                            payment_currency VARCHAR(10) DEFAULT NULL,
                            liability_limit VARCHAR(100) DEFAULT NULL,
                            risk_level VARCHAR(20) DEFAULT 'LOW',
                            original_clause TEXT DEFAULT NULL,
                            source_document VARCHAR(255) DEFAULT NULL,
                            page_number VARCHAR(50) DEFAULT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE
                        )
                        """))
                # Migrations for tender_documents
                td_result = conn.execute(
                    text("PRAGMA table_info(tender_documents)")
                ).fetchall()
                td_cols = {row[1] for row in td_result}
                if "company_name" not in td_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tender_documents ADD COLUMN company_name VARCHAR(150) DEFAULT 'PrimeTech Ltd'"
                        )
                    )
                if "company_role" not in td_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tender_documents ADD COLUMN company_role VARCHAR(50) DEFAULT 'LEAD_BIDDER'"
                        )
                    )
                if "is_jv_partner" not in td_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tender_documents ADD COLUMN is_jv_partner BOOLEAN DEFAULT 0"
                        )
                    )
                if "status" not in td_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tender_documents ADD COLUMN status VARCHAR(50) DEFAULT 'CLEARED'"
                        )
                    )
                if "action_comment" not in td_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tender_documents ADD COLUMN action_comment TEXT DEFAULT NULL"
                        )
                    )
                if "requested_by" not in td_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tender_documents ADD COLUMN requested_by VARCHAR(100) DEFAULT NULL"
                        )
                    )
                if "action_due_date" not in td_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE tender_documents ADD COLUMN action_due_date VARCHAR(50) DEFAULT NULL"
                        )
                    )

                # Migrations for reusable_documents
                rd_result = conn.execute(
                    text("PRAGMA table_info(reusable_documents)")
                ).fetchall()
                rd_cols = {row[1] for row in rd_result}
                if "company_name" not in rd_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE reusable_documents ADD COLUMN company_name VARCHAR(150) DEFAULT 'PrimeTech Ltd'"
                        )
                    )
                if "company_role" not in rd_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE reusable_documents ADD COLUMN company_role VARCHAR(50) DEFAULT 'LEAD_BIDDER'"
                        )
                    )
                if "is_jv_partner" not in rd_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE reusable_documents ADD COLUMN is_jv_partner BOOLEAN DEFAULT 0"
                        )
                    )

                # Migrations for users table
                u_result = conn.execute(text("PRAGMA table_info(users)")).fetchall()
                u_cols = {row[1] for row in u_result}
                if "phone" not in u_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(50) DEFAULT NULL"))
                if "location" not in u_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN location VARCHAR(150) DEFAULT 'Dhaka, Bangladesh'"))
                if "employment_type" not in u_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN employment_type VARCHAR(50) DEFAULT 'PERMANENT'"))
                if "proposed_designation" not in u_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN proposed_designation VARCHAR(150) DEFAULT NULL"))
                if "past_assignments" not in u_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN past_assignments JSON DEFAULT NULL"))
                if "certifications" not in u_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN certifications JSON DEFAULT NULL"))
                if "education" not in u_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN education JSON DEFAULT NULL"))
                if "active_tender_roles" not in u_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN active_tender_roles JSON DEFAULT NULL"))

                conn.commit()
            elif engine.dialect.name == "mysql":
                for tbl, cols in [
                    (
                        "tenders",
                        [
                            ("currency", "VARCHAR(10) DEFAULT 'USD'"),
                            ("exchange_rate_to_bdt", "FLOAT DEFAULT 122.0"),
                            ("exchange_rate_date", "VARCHAR(50) DEFAULT ''"),
                            ("estimated_value_bdt", "FLOAT DEFAULT 0.0"),
                            ("important_clauses", "JSON DEFAULT NULL"),
                            ("procurement_manager_name", "VARCHAR(150) DEFAULT NULL"),
                            (
                                "procurement_manager_designation",
                                "VARCHAR(150) DEFAULT NULL",
                            ),
                            ("procurement_manager_email", "VARCHAR(150) DEFAULT NULL"),
                            ("procurement_manager_phone", "VARCHAR(100) DEFAULT NULL"),
                            ("helpline_phone", "VARCHAR(100) DEFAULT NULL"),
                            ("helpline_email", "VARCHAR(150) DEFAULT NULL"),
                            ("helpline_hours", "VARCHAR(150) DEFAULT NULL"),
                            ("opening_date", "VARCHAR(50) DEFAULT NULL"),
                            ("contract_signing_date", "VARCHAR(50) DEFAULT NULL"),
                            ("work_start_date", "VARCHAR(50) DEFAULT NULL"),
                            ("possible_period", "VARCHAR(100) DEFAULT NULL"),
                            ("product_handover_date", "VARCHAR(50) DEFAULT NULL"),
                            ("maintenance_period", "VARCHAR(100) DEFAULT NULL"),
                            ("schedule_purchase_deadline", "VARCHAR(50) DEFAULT NULL"),
                            ("schedule_purchase_method", "VARCHAR(50) DEFAULT NULL"),
                            ("tender_security_amount", "FLOAT DEFAULT NULL"),
                            ("tender_security_method", "VARCHAR(50) DEFAULT NULL"),
                            ("post_award_data", "JSON DEFAULT NULL"),
                            ("financial_model", "JSON DEFAULT NULL"),
                        ],
                    ),
                    (
                        "tender_documents",
                        [
                            ("company_name", "VARCHAR(150) DEFAULT 'PrimeTech Ltd'"),
                            ("company_role", "VARCHAR(50) DEFAULT 'LEAD_BIDDER'"),
                            ("is_jv_partner", "BOOLEAN DEFAULT FALSE"),
                            ("status", "VARCHAR(50) DEFAULT 'CLEARED'"),
                            ("action_comment", "TEXT DEFAULT NULL"),
                            ("requested_by", "VARCHAR(100) DEFAULT NULL"),
                            ("action_due_date", "VARCHAR(50) DEFAULT NULL"),
                        ],
                    ),
                    (
                        "reusable_documents",
                        [
                            ("company_name", "VARCHAR(150) DEFAULT 'PrimeTech Ltd'"),
                            ("company_role", "VARCHAR(50) DEFAULT 'LEAD_BIDDER'"),
                            ("is_jv_partner", "BOOLEAN DEFAULT FALSE"),
                        ],
                    ),
                    (
                        "users",
                        [
                            ("phone", "VARCHAR(50) DEFAULT NULL"),
                            ("location", "VARCHAR(150) DEFAULT 'Dhaka, Bangladesh'"),
                            ("employment_type", "VARCHAR(50) DEFAULT 'PERMANENT'"),
                            ("proposed_designation", "VARCHAR(150) DEFAULT NULL"),
                            ("past_assignments", "JSON DEFAULT NULL"),
                            ("certifications", "JSON DEFAULT NULL"),
                            ("education", "JSON DEFAULT NULL"),
                            ("active_tender_roles", "JSON DEFAULT NULL"),
                        ],
                    ),
                ]:
                    for col, col_def in cols:
                        try:
                            conn.execute(
                                text(f"ALTER TABLE {tbl} ADD COLUMN {col} {col_def}")
                            )
                            conn.commit()
                        except Exception:
                            pass
    except Exception as e:
        print(f"Warning during migration check: {e}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
