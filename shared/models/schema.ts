import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users as authUsers } from "./models/auth";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

// Extend the auth users table with app-specific fields
// We can't actually extend the table definition directly since it's in another file,
// so we'll define a profile table that links 1:1 to authUsers
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // Links to authUsers.id
  balance: numeric("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isFrozen: boolean("is_frozen").default(false).notNull(),
  winRate: integer("win_rate").default(50).notNull(), // Percentage 0-100
  phoneNumber: text("phone_number"),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankAccountName: text("bank_account_name"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // 'deposit' | 'withdraw'
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
  proofImageUrl: text("proof_image_url"), // For deposits
  destinationAccount: text("destination_account"), // For withdrawals
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  provider: text("provider").notNull(), // 'PGSoft' | 'PragmaticPlay'
  imageUrl: text("image_url").notNull(),
  demoUrl: text("demo_url").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").default("slots"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  gameId: integer("game_id").notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  totalBet: numeric("total_bet", { precision: 12, scale: 2 }).default("0"),
  totalWin: numeric("total_win", { precision: 12, scale: 2 }).default("0"),
});

// === RELATIONS ===
export const profilesRelations = relations(profiles, ({ one, many }) => ({
  // In a real DB we'd define the relation to authUsers, but for Drizzle queries we might join manually or just query by userId
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  profile: one(profiles, {
    fields: [transactions.userId],
    references: [profiles.userId],
  }),
}));

// === ZOD SCHEMAS ===
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, balance: true, isAdmin: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, userId: true, status: true, createdAt: true, adminNote: true });
export const insertGameSchema = createInsertSchema(games).omit({ id: true });

// === EXPLICIT API TYPES ===
export type Profile = typeof profiles.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Game = typeof games.$inferSelect;

export type CreateDepositRequest = {
  amount: number;
  proofImageUrl: string;
};

export type CreateWithdrawRequest = {
  amount: number;
  destinationAccount: string;
};

export type AdminUpdateUserRequest = {
  isFrozen?: boolean;
  winRate?: number;
  balance?: number; // Admin can adjust balance manually
  isAdmin?: boolean;
};

export type AdminProcessTransactionRequest = {
  status: "approved" | "rejected";
  adminNote?: string;
};

// Response combining Auth User + Profile
export type UserResponse = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  balance: number;
  isAdmin: boolean;
  isFrozen: boolean;
  winRate: number;
  bankDetails?: {
    bankName?: string | null;
    accountNumber?: string | null;
    accountName?: string | null;
  };
};

export * from "./models/auth";
