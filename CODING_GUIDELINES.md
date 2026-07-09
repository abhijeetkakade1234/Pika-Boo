# Coding Guidelines

## General

- Use TypeScript in strict mode.
- Keep modules small and single-purpose.
- Prefer platform features before new dependencies.
- Keep business logic out of React components.
- Keep renderer code thin; background behavior belongs in Electron main/services.

## Project Style

- Feature-first folders when the codebase grows.
- No `any` without a written reason.
- No giant utility dump files.
- No abstractions for one caller.
- No dependency added without a short justification in the PR or task note.

## Performance

- This app idles all day, so default to boring low-overhead solutions.
- Polling, scheduling, and duplicate checks should be simple and predictable.
- Avoid constant rerenders or hidden busy loops.

## Docs Discipline

- Update docs when behavior changes.
- If a task changes product scope, update `ROADMAP.md`.
- If a task changes architecture, update `ARCHITECTURE.md`.

## Testing

- Leave one small runnable check for non-trivial logic.
- Prefer minimal tests over heavy harness setup.
