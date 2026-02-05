# Agent Rules

Project-specific guidance for AI agents. Apply these rules when working in this codebase.

## Skills & context

- For frontend design work—building web components, pages, or interfaces—read and apply the guidance in `ai/skills/frontend-design/SKILL.md`.

## Styling & Tailwind

- When writing dynamic class names, use the `cn` function from `src/lib/utils.ts` instead of string concatenation.
- Use the `size-*` utility when width and height are the same (e.g. `size-4` instead of `w-4 h-4`).

## Components & UI

- Prefer existing UI primitives (e.g. `src/components/ui/dialog.tsx`) before creating new ones.
- Avoid modifying the button component directly. If a variant is missing, leave a comment and a new variant can be added.

## Data & schemas

- Reuse existing schemas (e.g. recipes) where possible instead of defining new ones for each function.
