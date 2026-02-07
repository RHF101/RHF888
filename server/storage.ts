import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { 
  profiles, transactions, games, gameSessions,
  type Profile, type Transaction, type Game,
  type CreateDepositRequest, type CreateWithdrawRequest,
  type AdminUpdateUserRequest, type AdminProcessTransactionRequest,
  type UserResponse, users as authUsers
} from "@shared/schema";

export interface IStorage {
  // User/Profile
  getUserFull(userId: string): Promise<UserResponse | undefined>;
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(userId: string): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile>;
  getAllUsers(): Promise<UserResponse[]>;

  // Transactions
  createTransaction(userId: string, type: 'deposit' | 'withdraw', data: CreateDepositRequest | CreateWithdrawRequest): Promise<Transaction>;
  getTransactions(userId?: string): Promise<Transaction[]>; // If userId null, get all (admin)
  getPendingTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction>;

  // Games
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  getGameBySlug(slug: string): Promise<Game | undefined>;
  createGame(game: typeof games.$inferInsert): Promise<Game>;
  
  // Game Sessions
  createGameSession(userId: string, gameId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // === USER / PROFILE ===
  async getUserFull(userId: string): Promise<UserResponse | undefined> {
    // Join auth user and profile
    const [user] = await db.select({
      id: authUsers.id,
      email: authUsers.email,
      firstName: authUsers.firstName,
      lastName: authUsers.lastName,
      profileImageUrl: authUsers.profileImageUrl,
      balance: profiles.balance,
      isAdmin: profiles.isAdmin,
      isFrozen: profiles.isFrozen,
      winRate: profiles.winRate,
      bankDetails: {
        bankName: profiles.bankName,
        accountNumber: profiles.bankAccountNumber,
        accountName: profiles.bankAccountName,
      }
    })
    .from(authUsers)
    .leftJoin(profiles, eq(authUsers.id, profiles.userId))
    .where(eq(authUsers.id, userId));

    if (!user) return undefined;

    // If profile missing (first login?), return defaults or create it logic should be handled upstream
    // But here we format the response
    return {
      ...user,
      balance: user.balance ? Number(user.balance) : 0,
      isAdmin: user.isAdmin ?? false,
      isFrozen: user.isFrozen ?? false,
      winRate: user.winRate ?? 50,
      bankDetails: user.bankDetails
    };
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(userId: string): Promise<Profile> {
    const [profile] = await db.insert(profiles).values({
      userId,
      balance: "0",
      isAdmin: false, 
      isFrozen: false,
      winRate: 50
    }).returning();
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const [updated] = await db.update(profiles)
      .set(updates)
      .where(eq(profiles.userId, userId))
      .returning();
    return updated;
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const users = await db.select({
      id: authUsers.id,
      email: authUsers.email,
      firstName: authUsers.firstName,
      lastName: authUsers.lastName,
      profileImageUrl: authUsers.profileImageUrl,
      balance: profiles.balance,
      isAdmin: profiles.isAdmin,
      isFrozen: profiles.isFrozen,
      winRate: profiles.winRate,
      bankDetails: {
        bankName: profiles.bankName,
        accountNumber: profiles.bankAccountNumber,
        accountName: profiles.bankAccountName,
      }
    })
    .from(authUsers)
    .leftJoin(profiles, eq(authUsers.id, profiles.userId));

    return users.map(u => ({
      ...u,
      balance: u.balance ? Number(u.balance) : 0,
      isAdmin: u.isAdmin ?? false,
      isFrozen: u.isFrozen ?? false,
      winRate: u.winRate ?? 50,
      bankDetails: u.bankDetails
    }));
  }

  // === TRANSACTIONS ===
  async createTransaction(userId: string, type: 'deposit' | 'withdraw', data: any): Promise<Transaction> {
    const [txn] = await db.insert(transactions).values({
      userId,
      type,
      amount: data.amount.toString(),
      status: 'pending',
      proofImageUrl: type === 'deposit' ? data.proofImageUrl : null,
      destinationAccount: type === 'withdraw' ? data.destinationAccount : null,
    }).returning();
    return txn;
  }

  async getTransactions(userId?: string): Promise<Transaction[]> {
    if (userId) {
      return await db.select().from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.createdAt));
    }
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.status, 'pending'))
      .orderBy(desc(transactions.createdAt));
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [txn] = await db.select().from(transactions).where(eq(transactions.id, id));
    return txn;
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction> {
    const [updated] = await db.update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
    return updated;
  }

  // === GAMES ===
  async getGames(): Promise<Game[]> {
    return await db.select().from(games).where(eq(games.isActive, true));
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async getGameBySlug(slug: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.slug, slug));
    return game;
  }

  async createGame(game: typeof games.$inferInsert): Promise<Game> {
    const [newGame] = await db.insert(games).values(game).returning();
    return newGame;
  }

  async createGameSession(userId: string, gameId: number): Promise<void> {
    await db.insert(gameSessions).values({
      userId,
      gameId,
    });
  }
}

export const storage = new DatabaseStorage();
