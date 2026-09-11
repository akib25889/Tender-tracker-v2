import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.config import settings
from sqlalchemy import create_engine, text


def main():
    table_arg = sys.argv[1].lower() if len(sys.argv) > 1 else None
    db_url = settings.DATABASE_URL
    print("=" * 65)
    print(f" TenderTracker Database Inspector")
    print(f" Connected to: {db_url}")
    print("=" * 65)

    engine = create_engine(db_url)
    with engine.connect() as conn:
        if not table_arg:
            # 1. Summary of all tables
            print("\n[ Database Tables & Record Counts ]")
            tables_res = conn.execute(text("SHOW TABLES;")).fetchall()
            for r in tables_res:
                tbl = r[0]
                cnt = conn.execute(text(f"SELECT COUNT(*) FROM `{tbl}`;")).scalar()
                print(f"  - {tbl.ljust(30)} : {cnt} rows")

            # 2. Preview Tenders
            print("\n[ Recent Tenders in Database ]")
            tenders = conn.execute(
                text(
                    "SELECT id, title, stage, decision, estimated_value, currency, ai_chat_share_link FROM tenders ORDER BY id LIMIT 10;"
                )
            ).fetchall()
            for t in tenders:
                ai_flag = " [✨ AI Chat Linked]" if t[6] else ""
                print(
                    f"  [{t[0]}] {t[1][:45]}... | {t[2]} | {t[3]} | {t[5]} {t[4]:,.0f}{ai_flag}"
                )

            # 3. Preview Users
            print("\n[ Registered Team Users ]")
            users = conn.execute(
                text("SELECT id, name, role, email FROM users LIMIT 10;")
            ).fetchall()
            for u in users:
                print(f"  - {u[1]} ({u[2]}) - {u[3]}")

            print(
                "\nTip: Run 'python scripts/view_db.py <table_name>' to view all columns of a specific table."
            )
        else:
            # Display full content of specific table
            print(f"\n[ Inspecting Table: `{table_arg}` ]")
            try:
                rows = conn.execute(
                    text(f"SELECT * FROM `{table_arg}` LIMIT 25;")
                ).fetchall()
                cols = conn.execute(
                    text(f"SHOW COLUMNS FROM `{table_arg}`;")
                ).fetchall()
                col_names = [c[0] for c in cols]
                print("Columns:", " | ".join(col_names))
                print("-" * 65)
                for row in rows:
                    print(dict(zip(col_names, row)))
            except Exception as err:
                print(f"Error reading table '{table_arg}': {err}")

    print("=" * 65)


if __name__ == "__main__":
    main()
