# Skill: Generate Service Layer

## Description
Use this skill when the user asks to create a new API interaction, a data-fetching service, or a logic-heavy data model.

## Core Procedural Steps
1. **Model First:** Check `src/models/` for existing TypeScript classes. If none exist for this entity, create an OOP-compliant class with private properties and public getters.
2. **Interface Definition:** Define a `DTO` (Data Transfer Object) interface for the API response.
3. **Class Implementation:** - Create a file in `src/services/`.
   - The class MUST extend `BaseApiService`.
   - Use the `private readonly` pattern for the endpoint URL.
4. **Validation:** Ensure every method returns a `Promise<T>` where T is the typed model.

5. 

## Examples
(You can provide a small snippet of your preferred code style here so the AI copies the 'vibe' perfectly).