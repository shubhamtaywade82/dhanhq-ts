# TypeScript Notes

- Keep `strict` mode enabled
- Do not weaken validation types to satisfy incomplete request payloads
- Prefer generated API models for REST request and response shapes
- Add custom types only when representing SDK-only concepts such as:
  - correlation-safe results
  - WebSocket events
  - in-memory store state
- Avoid root export collisions between custom types and generated models
