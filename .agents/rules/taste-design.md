---
description: Anti-slop frontend design rules derived from Leonxlnx/taste-skill
trigger: always_on
---

# Anti-Slop Frontend Design Standard (Taste-Skill Integration)

This project strictly adheres to the **Anti-Slop Frontend Framework (`taste-skill`)**:

## 1. Core Principles
- **No Generic AI Slop**: Avoid stereotypical purple/cyan linear-gradients, centered generic heros, repetitive 3-column feature cards, unreadable floating glassmorphism, and meaningless infinite float animations.
- **Brief Inference & Contextual Design**:
  - For Resident Portal & Public Mobile: Clean, warm, accessible, high-trust, responsive micro-interactions (`VARIANCE: 6`, `MOTION: 4`, `DENSITY: 4`).
  - For Security Gate & Guard Terminal: High-contrast, tactile, fast-action, physical button feedback, industrial precision (`VARIANCE: 4`, `MOTION: 2`, `DENSITY: 8`).
  - For Admin Dashboard & Financial Ledger: Swiss typographic grid, tabular alignment, dense analytical hierarchy, clear statuses (`VARIANCE: 5`, `MOTION: 3`, `DENSITY: 8`).
- **Typography & Hierarchy**:
  - High typographic contrast (bold display numbers vs clean legible micro-labels).
  - Clear Indonesian vernacular suited for residential community management (RT/RW, Komplek, Warga).
- **Physical & Micro-Interactions**:
  - Tactile button press (`active:scale-[0.98]`, subtle `shadow-2xs` to `shadow-xs`).
  - Real feedback states (toast notifications, optimistic UI updates, loading spinners, sound/vibration cues).
- **Zero Truncation**:
  - Always output complete components without placeholders (`// TODO: implement later` or truncated JSX).

## 2. Available Workspace Skills
Located under `.agents/skills/`:
- `design-taste-frontend` (`.agents/skills/taste-skill/SKILL.md`): Flagship Anti-Slop Frontend Skill v2.
- `redesign-existing-projects` (`.agents/skills/redesign-skill/SKILL.md`): Safe upgrade of existing UI/UX without breaking logic.
- `high-end-visual-design` (`.agents/skills/soft-skill/SKILL.md`): Agency-tier visual refinement and elegance.
- `minimalist-ui` (`.agents/skills/minimalist-skill/SKILL.md`): Editorial typographic restraint.
- `industrial-brutalist-ui` (`.agents/skills/brutalist-skill/SKILL.md`): High-density utilitarian terminal aesthetic.
- `stitch-design-taste` (`.agents/skills/stitch-skill/SKILL.md`): Google Stitch MCP & `DESIGN.md` integration.
- `full-output-enforcement` (`.agents/skills/output-skill/SKILL.md`): Strict no-truncation enforcement.
