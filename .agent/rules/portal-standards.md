---
trigger: always_on
---

# Admin Portal Development Standards

## Tech Stack
- **Framework:** React with TypeScript in docker container.
- **Styling:** Tailwind CSS only. No inline styles or external CSS files.
- **Type Safety:** Enable `strict` mode. Use Interfaces for all Data Models and Service Layer payloads.

## Architecture
- **Theme:** All colors, spacing, and typography must reference `src/theme/theme.ts`. Do not use arbitrary hex codes.
- **Service Layer:** All API calls must live in `src/services/`. Each service must extend a base `ApiService` class (OOP).
- **OOP Structure:** Use Classes for complex data objects to encapsulate logic and validation.
- **Component Pattern:** Follow an Atomic design or "Common Component" structure. Place reusable UI in `src/components/common/`.

## Routing & Security
- **RBAC:** Use a centralized routing config. 
- **Roles:** Handle `super_admin` and `admin` roles using a `ProtectedRoute` wrapper.
- **Logic:** `super_admin` has full access; `admin` has restricted module access.