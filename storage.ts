import { 
  users, type User, type InsertUser,
  userBalances, type UserBalance, type InsertUserBalance,
  transactions, type Transaction, type InsertTransaction,
  sportsBets, type SportsBet, type InsertSportsBet,
  sportsMatches, type SportsMatch, type InsertSportsMatch
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(userId: number, walletAddress: string): Promise<User>;
  
  // Balance management
  getUserBalance(userId: number, currency: string): Promise<UserBalance | undefined>;
  getAllUserBalances(userId: number): Promise<UserBalance[]>;
  createUserBalance(balance: InsertUserBalance): Promise<UserBalance>;
  updateUserBalance(userId: number, currency: string, amount: number): Promise<UserBalance>;
  
  // Transaction history
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Sports betting
  getSportsBetsByUserId(userId: number): Promise<SportsBet[]>;
  createSportsBet(bet: InsertSportsBet): Promise<SportsBet>;
  updateSportsBetStatus(betId: number, status: string): Promise<SportsBet>;
  
  // Sports matches
  getAllSportsMatches(): Promise<SportsMatch[]>;
  getSportsMatchesBySport(sportType: string): Promise<SportsMatch[]>;
  createSportsMatch(match: InsertSportsMatch): Promise<SportsMatch>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userBalances: Map<number, UserBalance>;
  private transactions: Map<number, Transaction>;
  private sportsBets: Map<number, SportsBet>;
  private sportsMatches: Map<number, SportsMatch>;
  
  private userId: number = 1;
  private balanceId: number = 1;
  private transactionId: number = 1;
  private betId: number = 1;
  private matchId: number = 1;
  
  constructor() {
    this.users = new Map();
    this.userBalances = new Map();
    this.transactions = new Map();
    this.sportsBets = new Map();
    this.sportsMatches = new Map();
    
    // Add sample sports matches
    this.initSportsMatches();
  }
  
  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    
    // Create default balances for new users
    this.createUserBalance({ userId: id, currency: 'BTC', amount: 0.01 });
    this.createUserBalance({ userId: id, currency: 'ETH', amount: 0.1 });
    
    return user;
  }
  
  async updateUserWallet(userId: number, walletAddress: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const updatedUser = { ...user, walletAddress };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Balance management
  async getUserBalance(userId: number, currency: string): Promise<UserBalance | undefined> {
    return Array.from(this.userBalances.values()).find(
      (balance) => balance.userId === userId && balance.currency === currency
    );
  }
  
  async getAllUserBalances(userId: number): Promise<UserBalance[]> {
    return Array.from(this.userBalances.values()).filter(
      (balance) => balance.userId === userId
    );
  }
  
  async createUserBalance(insertBalance: InsertUserBalance): Promise<UserBalance> {
    const id = this.balanceId++;
    const updatedAt = new Date();
    const balance: UserBalance = { ...insertBalance, id, updatedAt };
    this.userBalances.set(id, balance);
    return balance;
  }
  
  async updateUserBalance(userId: number, currency: string, amount: number): Promise<UserBalance> {
    let balance = await this.getUserBalance(userId, currency);
    
    if (!balance) {
      balance = await this.createUserBalance({ userId, currency, amount });
      return balance;
    }
    
    const updatedBalance = { 
      ...balance, 
      amount: amount, 
      updatedAt: new Date() 
    };
    
    this.userBalances.set(balance.id, updatedBalance);
    return updatedBalance;
  }
  
  // Transaction history
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const createdAt = new Date();
    const transaction: Transaction = { ...insertTransaction, id, createdAt };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  // Sports betting
  async getSportsBetsByUserId(userId: number): Promise<SportsBet[]> {
    return Array.from(this.sportsBets.values())
      .filter(bet => bet.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createSportsBet(insertBet: InsertSportsBet): Promise<SportsBet> {
    const id = this.betId++;
    const createdAt = new Date();
    const bet: SportsBet = { ...insertBet, id, createdAt };
    this.sportsBets.set(id, bet);
    return bet;
  }
  
  async updateSportsBetStatus(betId: number, status: string): Promise<SportsBet> {
    const bet = this.sportsBets.get(betId);
    if (!bet) {
      throw new Error('Bet not found');
    }
    
    const updatedBet = { ...bet, status };
    this.sportsBets.set(betId, updatedBet);
    return updatedBet;
  }
  
  // Sports matches
  async getAllSportsMatches(): Promise<SportsMatch[]> {
    return Array.from(this.sportsMatches.values())
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  async getSportsMatchesBySport(sportType: string): Promise<SportsMatch[]> {
    return Array.from(this.sportsMatches.values())
      .filter(match => match.sportType === sportType)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  async createSportsMatch(insertMatch: InsertSportsMatch): Promise<SportsMatch> {
    const id = this.matchId++;
    const createdAt = new Date();
    const match: SportsMatch = { ...insertMatch, id, createdAt };
    this.sportsMatches.set(id, match);
    return match;
  }
  
  // Initialize sports matches
  private initSportsMatches() {
    const now = new Date();
    
    // Soccer matches
    this.createSportsMatch({
      externalId: 'soccer-1',
      sportType: 'Soccer',
      homeTeam: 'Arsenal FC',
      awayTeam: 'Chelsea FC',
      startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      isLive: true,
      status: 'in_progress'
    });
    
    this.createSportsMatch({
      externalId: 'soccer-2',
      sportType: 'Soccer',
      homeTeam: 'Manchester United',
      awayTeam: 'Liverpool',
      startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 1 day from now
      isLive: false,
      status: 'scheduled'
    });
    
    // Basketball matches
    this.createSportsMatch({
      externalId: 'bball-1',
      sportType: 'Basketball',
      homeTeam: 'LA Lakers',
      awayTeam: 'Golden State Warriors',
      startTime: new Date(now.getTime() + 28 * 60 * 60 * 1000), // 28 hours from now
      isLive: false,
      status: 'scheduled'
    });
    
    // eSports matches
    this.createSportsMatch({
      externalId: 'esports-1',
      sportType: 'eSports',
      homeTeam: 'Fnatic',
      awayTeam: 'G2 Esports',
      startTime: new Date(now.getTime() + 32 * 60 * 60 * 1000), // 32 hours from now
      isLive: false,
      status: 'scheduled'
    });
  }
}

export const storage = new MemStorage();
