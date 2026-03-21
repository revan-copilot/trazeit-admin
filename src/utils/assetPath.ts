/**
 * Resolves a public asset path using Vite's BASE_URL.
 * Usage: assetPath('assets/logo.png') → '/trazeit-admin/assets/logo.png'
 */
export const assetPath = (path: string): string =>
    `${import.meta.env.BASE_URL}${path}`;
