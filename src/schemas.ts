import { z } from 'zod';

export const ShoppingItemSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type ShoppingItem = z.infer<typeof ShoppingItemSchema>;

export const ThemePreferenceSchema = z.enum(['light', 'dark', 'system']);

export type ThemePreference = z.infer<typeof ThemePreferenceSchema>;
