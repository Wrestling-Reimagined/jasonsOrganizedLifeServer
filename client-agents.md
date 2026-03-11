# Client Agent Notes

- Stack: React + TypeScript + Material UI.
- Keep UI simple and functional first; prioritize correctness over visual polish.
- Use `src/api/client.ts` for all API calls.
- Keep auth token in local storage via `src/lib/storage.ts`.
- New protected pages should be routed in `src/App.tsx` under `ProtectedRoute`.
