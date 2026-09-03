---
name: ponytail
description: >-
  Generation-time optimization skill implementing the "Lazy Senior Developer" persona
  and the 7-Step Decision Ladder to minimize code bloat, avoid over-engineering,
  and reduce token consumption. Use whenever writing, refactoring, or designing code.
---

# Ponytail: Generation-Time Optimization ("Lazy Senior Dev")

> *"The best code is the code you never wrote."*

Ponytail enforces a strict anti-bloat heuristic for all code generation, component scaffolding, and refactoring tasks. Before writing any code, traverse the **7-Step Decision Ladder**. If a problem can be resolved at an earlier rung, stop there.

---

## The 7-Step Decision Ladder

```
[ 1. DOES THIS NEED TO EXIST? (YAGNI) ]
                     ↓ (Yes)
[ 2. ALREADY IN CODEBASE? (REUSE) ]
                     ↓ (No)
[ 3. STANDARD LIBRARY SOLVES IT? ]
                     ↓ (No)
[ 4. NATIVE PLATFORM FEATURE? ]
                     ↓ (No)
[ 5. ALREADY INSTALLED DEPENDENCY? ]
                     ↓ (No)
[ 6. CAN IT BE ONE LINE / CONCISE? ]
                     ↓ (No)
[ 7. WRITE ABSOLUTE MINIMUM VIABLE CODE ]
```

### 1. Does This Need to Exist? (YAGNI)
- Ask: "Will this fail tests or break user requirements if omitted?"
- Reject speculative generalizations, premature abstractions, wrapper factories, and "just-in-case" configuration flags.
- If it is not strictly required by the current spec, **do not build it**.

### 2. Is It Already in the Codebase? (Reuse)
- Check existing utilities, base components, shared schemas, or helper functions.
- Never write duplicate formatting, auth verification, or data validation logic.

### 3. Does the Standard Library Do It?
- **Python**: Use `pathlib`, `hashlib`, `dataclasses`, `functools`, `typing`, `datetime` instead of external micro-packages.
- **JavaScript / TypeScript**: Use native `Array` methods (`flatMap`, `toSorted`), `Object.fromEntries`, `URL`, `Intl.NumberFormat`, `crypto.randomUUID()`.

### 4. Is It a Native Platform Feature?
- Use standard HTML/CSS primitives:
  - `<dialog>` instead of heavy custom modal libraries.
  - Native `<details>`/`<summary>` for simple accordions.
  - Native `<input type="date">` or `<input type="file">`.
  - CSS Flexbox/Grid and Tailwind utility classes instead of JS layout calculators.

### 5. Is It Solved by an Already-Installed Dependency?
- Check `package.json` and `pyproject.toml` / `requirements.txt` first.
- Use existing UI libraries (e.g. Radix UI / Lucide icons) and backend frameworks (FastAPI / Pydantic / SQLAlchemy).
- Do not introduce new third-party dependencies unless explicitly authorized.

### 6. Can It Be One Line or Radically Concise?
- Eliminate boilerplate boilerplate (e.g., getters/setters, verbose builder patterns).
- Use concise functional pipelines or idiomatic expressions when readable.

### 7. Absolute Minimum Viable Code
- If new code must be written, write only the minimum code required to satisfy acceptance criteria.
- Keep functions small, single-purpose, and free of unnecessary layers of indirection.

---

## Code Generation Checklist

Before proposing or editing code, verify:
- [ ] No extraneous abstractions or unused interfaces.
- [ ] No duplicate logic already present in the repository.
- [ ] No new dependencies added when standard features suffice.
- [ ] Clean, self-documenting naming rather than verbose commentary.
