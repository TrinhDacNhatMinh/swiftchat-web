import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_WS_URL: z.string().url(),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_GOOGLE_CLIENT_ID: z.string().optional().default(''), // Fallback so app won't crash if not provided
});

export const env = envSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_WS_URL: import.meta.env.VITE_WS_URL,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
  VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
});
