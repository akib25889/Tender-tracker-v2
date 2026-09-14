import json
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal, Base, engine, run_migrations
from app.models.organization import Organization

SEED_JSON_PATH = backend_dir / "app" / "services" / "organizations_seed.json"


def sync_organizations():
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)
        run_migrations()

        with open(SEED_JSON_PATH, "r", encoding="utf-8") as f:
            records = json.load(f)

        existing_ids = {o.id for o in db.query(Organization.id).all()}
        print(f"Existing in DB: {len(existing_ids)}, Total in Seed JSON: {len(records)}")

        added = 0
        updated = 0

        for r in records:
            if r["id"] not in existing_ids:
                db.add(
                    Organization(
                        id=r["id"],
                        name=r["name"],
                        short_name=r.get("short_name"),
                        type=r.get("type", "GOVERNMENT"),
                        parent_id=r.get("parent_id"),
                        country=r.get("country", "Bangladesh"),
                        website=r.get("website"),
                        priority=r.get("priority", "MEDIUM"),
                        aliases_json=r.get("aliases_json"),
                        description=r.get("description"),
                    )
                )
                added += 1
            else:
                existing_org = db.query(Organization).filter(Organization.id == r["id"]).first()
                if existing_org:
                    existing_org.name = r["name"]
                    existing_org.short_name = r.get("short_name")
                    existing_org.type = r.get("type", "GOVERNMENT")
                    existing_org.parent_id = r.get("parent_id")
                    existing_org.country = r.get("country", "Bangladesh")
                    existing_org.website = r.get("website")
                    existing_org.priority = r.get("priority", "MEDIUM")
                    existing_org.aliases_json = r.get("aliases_json")
                    existing_org.description = r.get("description")
                    updated += 1

        db.commit()
        total_now = db.query(Organization).count()
        print(f"Sync complete: {added} inserted, {updated} updated. Total DB count: {total_now}")
    finally:
        db.close()


if __name__ == "__main__":
    sync_organizations()
