import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.core.database import engine
from sqlalchemy import text


def alter():
    print(f"Connecting to database (dialect: {engine.dialect.name})...")
    if engine.dialect.name == "sqlite":
        print(
            "SQLite does not enforce strict VARCHAR limits or support MODIFY COLUMN; skipping."
        )
        return
    with engine.connect() as conn:
        conn.execute(
            text(
                "ALTER TABLE tenders MODIFY COLUMN schedule_purchase_method VARCHAR(255) DEFAULT NULL"
            )
        )
        conn.execute(
            text(
                "ALTER TABLE tenders MODIFY COLUMN tender_security_method VARCHAR(255) DEFAULT NULL"
            )
        )
        conn.commit()
    print(
        "Columns schedule_purchase_method and tender_security_method resized to VARCHAR(255) successfully!"
    )


if __name__ == "__main__":
    alter()
