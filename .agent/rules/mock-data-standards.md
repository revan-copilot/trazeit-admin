---
trigger: always_on
---

# Rule: Mock API Standards

## Data Storage
- All mock data must reside in `src/mocks/data/`.
- Each entity (users, bookings, settings) must have its own `.json` file.

## Interaction Pattern
- DO NOT use local state to simulate APIs in components.
- Use the Service Layer (`src/services/`) to fetch this JSON data.
- All service methods must return a `Promise` to simulate network latency.

## Transition Path
- Write code assuming an eventual REST API. 
- Use a `USE_MOCK` environment variable or a toggle in `BaseService.ts` to switch between local JSON and real API calls.