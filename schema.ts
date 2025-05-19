import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const userBalances = pgTable("user_balances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  currency: text("currency").notNull(),
  amount: doublePrecision("amount").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserBalanceSchema = createInsertSchema(userBalances).omit({
  id: true,
  updatedAt: true,
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // deposit, withdrawal, bet, win
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").notNull(),
  gameType: text("game_type"), // slots, blackjack, roulette, sports
  status: text("status").notNull(), // pending, completed, failed
  txHash: text("tx_hash"), // blockchain transaction hash
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const sportsBets = pgTable("sports_bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  matchId: text("match_id").notNull(),
  selectionId: text("selection_id").notNull(),
  odds: doublePrecision("odds").notNull(),
  stake: doublePrecision("stake").notNull(),
  currency: text("currency").notNull(),
  potentialWin: doublePrecision("potential_win").notNull(),
  status: text("status").notNull(), // pending, won, lost
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSportsBetSchema = createInsertSchema(sportsBets).omit({
  id: true,
  createdAt: true,
});

export const sportsMatches = pgTable("sports_matches", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").notNull().unique(),
  sportType: text("sport_type").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  startTime: timestamp("start_time").notNull(),
  isLive: boolean("is_live").default(false),
  status: text("status").notNull(), // scheduled, in_progress, finished
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSportsMatchSchema = createInsertSchema(sportsMatches).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertUserBalance = z.infer<typeof insertUserBalanceSchema>;
export type UserBalance = typeof userBalances.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertSportsBet = z.infer<typeof insertSportsBetSchema>;
export type SportsBet = typeof sportsBets.$inferSelect;

export type InsertSportsMatch = z.infer<typeof insertSportsMatchSchema>;
export type SportsMatch = typeof sportsMatches.$inferSelect;

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const walletConnectSchema = z.object({
  walletAddress: z.string(),
});

// Game schemas
export const betSchema = z.object({
  amount: z.number().positive("Bet amount must be positive"),
  currency: z.string(),
  gameType: z.string(),
});

export const depositSchema = z.object({
  amount: z.number().positive("Deposit amount must be positive"),
  currency: z.string(),
  walletAddress: z.string(),
});

export const withdrawSchema = z.object({
  amount: z.number().positive("Withdrawal amount must be positive"),
  currency: z.string(),
  walletAddress: z.string(),
});

// Unique wallet address table for deposits
export const walletAddresses = pgTable("wallet_addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  currency: text("currency").notNull(),
  address: text("address").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWalletAddressSchema = createInsertSchema(walletAddresses).omit({
  id: true,
  createdAt: true,
});

export type InsertWalletAddress = z.infer<typeof insertWalletAddressSchema>;
export type WalletAddress = typeof walletAddresses.$inferSelect;
