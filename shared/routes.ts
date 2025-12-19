import { z } from 'zod';
import { imageSchema, insertImageSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  images: {
    upload: {
      method: 'POST' as const,
      path: '/api/images',
      // Input is FormData, so we don't strictly validate body schema here in the route definition
      // but we expect a file.
      responses: {
        201: imageSchema,
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/images',
      responses: {
        200: z.array(imageSchema),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/images/:id',
      responses: {
        200: imageSchema,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
