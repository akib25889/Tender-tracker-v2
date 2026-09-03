---
name: graphify
description: >-
  Retrieval-time optimization skill using a precomputed knowledge graph
  and dependency index. Use this skill when searching or navigating across
  modules, routes, database tables, screens, or storage specifications
  to avoid costly, high-token full-repository file re-reading.
---

# Graphify: Retrieval-Time Knowledge Graph Optimizer

Graphify transforms project specifications, schemas, routes, and directory structures into an indexed, queryable knowledge graph.

Instead of scanning thousands of lines of PRD documents or repeatedly grepping the codebase, consult the graph index first.

---

## 1. Quick Graph Lookup

- **Human / Agent Readable Map**: [`tools/graphify/knowledge_graph.md`](file:///h:/Tender%20tracker%20v2/tools/graphify/knowledge_graph.md)
- **Machine-Readable Graph**: [`tools/graphify/knowledge_graph.json`](file:///h:/Tender%20tracker%20v2/tools/graphify/knowledge_graph.json)

---

## 2. Graph Update Workflow

Whenever new backend endpoints, frontend screens, or database models are added or changed, regenerate the graph:

```powershell
python "tools/graphify/graphify.py"
```

---

## 3. Navigation Rules

1. **Finding Screen & Route Mappings**: Check Section 2 of `knowledge_graph.md` for exact URLs and component modules.
2. **Finding Database Entities**: Check Section 3 for entity names, fields, and descriptions.
3. **Storage Vault Hierarchy**: Check Section 4 for the 6 subfolder paths required under `storage/tenders/{TDR-ID}/`.
4. **Relationship Tracing**: Check Section 5 to trace connections (e.g. `screen -> database entity` or `lifecycle_stage -> lifecycle_stage`).

