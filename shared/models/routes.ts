import { z } from 'zod';
import { insertTransactionSchema, insertGameSchema, games, profiles, transactions } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  user: {
    get: {
      method: 'GET' as const,
      path: '/api/user/me',
      responses: {
        200: z.custom<any>(), // Returns UserResponse
        401: errorSchemas.forbidden,
      },
    },
    updateBank: {
      method: 'PUT' as const,
      path: '/api/user/bank',
      input: z.object({
        bankName: z.string(),
        bankAccountNumber: z.string(),
        bankAccountName: z.string(),
      }),
      responses: {
        200: z.custom<any>(),
      },
    },
  },
  wallet: {
    deposit: {
      method: 'POST' as const,
      path: '/api/wallet/deposit',
      input: z.object({
        amount: z.coerce.number().min(10000), // Min 10k
        proofImageUrl: z.string().url(),
      }),
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    withdraw: {
      method: 'POST' as const,
      path: '/api/wallet/withdraw',
      input: z.object({
        amount: z.coerce.number().min(10000), // Min 10k
        destinationAccount: z.string(),
      }),
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/wallet/history',
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
      },
    },
  },
  games: {
    list: {
      method: 'GET' as const,
      path: '/api/games',
      responses: {
        200: z.array(z.custom<typeof games.$inferSelect>()),
      },
    },
    play: {
      method: 'POST' as const,
      path: '/api/games/:id/play', // Checks balance and returns launch URL
      responses: {
        200: z.object({ url: z.string() }),
        403: errorSchemas.forbidden, // Frozen or no balance
      },
    },
  },
  admin: {
    users: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/users',
        responses: {
          200: z.array(z.custom<any>()),
        },
      },
      update: {
        method: 'PATCH' as const,
        path: '/api/admin/users/:userId',
        input: z.object({
          isFrozen: z.boolean().optional(),
          winRate: z.number().min(0).max(100).optional(),
          balance: z.number().optional(),
          isAdmin: z.boolean().optional(),
        }),
        responses: {
          200: z.custom<any>(),
        },
      },
    },
    transactions: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/transactions',
        input: z.object({
          status: z.enum(['pending', 'approved', 'rejected']).optional(),
        }).optional(),
        responses: {
          200: z.array(z.custom<typeof transactions.$inferSelect>()),
        },
      },
      process: {
        method: 'POST' as const,
        path: '/api/admin/transactions/:id/process',
        input: z.object({
          status: z.enum(['approved', 'rejected']),
          adminNote: z.string().optional(),
        }),
        responses: {
          200: z.custom<typeof transactions.$inferSelect>(),
        },
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
