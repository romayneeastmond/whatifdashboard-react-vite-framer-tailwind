export const siteUrl: string = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SITE_URL ?? 'http://localhost:3002';
