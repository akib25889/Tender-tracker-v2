# TenderTracker Command Center - Agent Guidelines & Rules

This project uses **Ponytail** (for code generation optimization) and **Graphify** (for context retrieval optimization).

---

## 1. Generation-Time Optimization: Ponytail ("Lazy Senior Dev")

> *"The best code is the code you never wrote."*

Before writing any new component, helper, API endpoint, or refactor, traverse the **7-Step Decision Ladder**:

1. **YAGNI (Does this need to exist?)**: Reject speculative features, premature abstractions, boilerplate wrapper layers, and unnecessary configuration flags.
2. **Reuse Existing Code**: Always check existing components, models, and utility functions in `frontend/` and `backend/` before writing new ones.
3. **Standard Library**: Prefer standard language features (`pathlib`, `hashlib`, native TS/JS methods) over third-party micro-libraries.
4. **Native Platform Features**: Prefer native browser elements (`<dialog>`, `<details>`, `<input type="date">`), standard CSS, and native FastAPI/Pydantic validation.
5. **Installed Dependencies**: Rely only on the existing stack (React, Tailwind, Lucide, FastAPI, SQLAlchemy, Pydantic). Do not install new packages without explicit user approval.
6. **Radical Conciseness**: Eliminate boilerplate, multi-layer indirection, and redundant getters/setters.
7. **Minimum Viable Code**: Produce the smallest, most maintainable, and cleanest implementation that satisfies requirements.

---

## 2. Retrieval-Time Optimization: Graphify (Knowledge Graph)

To avoid token bloat and excessive full-file re-reads:

- Consult [`tools/graphify/knowledge_graph.md`](file:///h:/Tender%20tracker%20v2/tools/graphify/knowledge_graph.md) and [`tools/graphify/knowledge_graph.json`](file:///h:/Tender%20tracker%20v2/tools/graphify/knowledge_graph.json) for:
  - Screen-to-route mappings (17 core screens)
  - 6-gate tender lifecycle stages
  - Database schema entities
  - Local file storage vault directory paths
  - Entity-to-screen relationships
- Keep the graph updated by executing `python "tools/graphify/graphify.py"` whenever modifying system architectures or adding major endpoints/screens.

---

## 3. Core Architectural Principles

- **The 10-Second Rule**: Dashboards and workspaces must communicate urgent items, missing documents, and approaching deadlines within 10 seconds.
- **Segregation of Status vs. Go/No-Go**: Operational lifecycle stages (`DISCOVERED`, `PREPARATION`, etc.) must never be conflated with the `GO` / `NO-GO` decision matrix.
- **Local SSD Storage**: MVP uses local server filesystem under `storage/tenders/{TDR-ID}/...` with SHA-256 versioning. No cloud object storage is needed for MVP.

