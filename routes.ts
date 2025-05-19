import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { 
  loginSchema, 
  signupSchema, 
  walletConnectSchema, 
  betSchema, 
  depositSchema, 
  withdrawSchema
} from "@shared/schema";
import MemoryStore from "memorystore";

// Validate input function to reuse with Zod schemas
function validateInput(schema: any, data: any) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorMessage = result.error.format();
    return { success: false, error: errorMessage };
  }
  return { success: true, data: result.data };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup session middleware
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "crypto-casino-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 },
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );
  
  // Authentication routes
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    const validation = validateInput(signupSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: "Invalid input", errors: validation.error });
    }
    
    const { username, email, password } = validation.data;
    
    try {
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Create user
      const user = await storage.createUser({ username, email, password });
      
      // Set session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      return res.status(201).json({ 
        message: "User created successfully",
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ message: "Error creating user" });
    }
  });
  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const validation = validateInput(loginSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: "Invalid input", errors: validation.error });
    }
    
    const { username, password } = validation.data;
    
    try {
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      return res.status(200).json({ 
        message: "Login successful",
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Error during login" });
    }
  });
  
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }
      
      return res.status(200).json({ 
        user: { id: user.id, username: user.username, email: user.email, walletAddress: user.walletAddress }
      });
    } catch (error) {
      console.error("Auth check error:", error);
      return res.status(500).json({ message: "Error checking authentication" });
    }
  });
  
  // Wallet routes
  app.post("/api/wallet/connect", async (req: Request, res: Response) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const validation = validateInput(walletConnectSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: "Invalid input", errors: validation.error });
    }
    
    const { walletAddress } = validation.data;
    
    try {
      // Update user's wallet address
      const user = await storage.updateUserWallet(req.session.userId, walletAddress);
      
      return res.status(200).json({ 
        message: "Wallet connected successfully",
        walletAddress: user.walletAddress
      });
    } catch (error) {
      console.error("Wallet connect error:", error);
      return res.status(500).json({ message: "Error connecting wallet" });
    }
  });
  
  app.get("/api/wallet/balances", async (req: Request, res: Response) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const balances = await storage.getAllUserBalances(req.session.userId);
      return res.status(200).json({ balances });
    } catch (error) {
      console.error("Get balances error:", error);
      return res.status(500).json({ message: "Error fetching balances" });
    }
  });
  
  app.post("/api/wallet/deposit", async (req: Request, res: Response) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const { amount, currency, depositAddress } = req.body;
    if (!amount || !currency || !depositAddress) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Store the deposit address for monitoring
    await storage.createDepositAddress({
      userId: req.session.userId,
      address: depositAddress,
      currency,
      amount,
      status: 'pending'
    });
    
    // Process the deposit
    
    try {
      // Get current balance
      const currentBalance = await storage.getUserBalance(req.session.userId, currency);
      const newAmount = (currentBalance?.amount || 0) + amount;
      
      // Update balance
      const balance = await storage.updateUserBalance(req.session.userId, currency, newAmount);
      
      // Create transaction record
      const transaction = await storage.createTransaction({
        userId: req.session.userId,
        type: "deposit",
        amount,
        currency,
        status: "completed",
        txHash: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      });
      
      return res.status(200).json({ 
        message: "Deposit successful",
        balance,
        transaction
      });
    } catch (error) {
      console.error("Deposit error:", error);
      return res.status(500).json({ message: "Error processing deposit" });
    }
  });
  
  app.post("/api/wallet/withdraw", async (req: Request, res: Response) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const validation = validateInput(withdrawSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: "Invalid input", errors: validation.error });
    }
    
    const { amount, currency, walletAddress } = validation.data;
    
    try {
      // Check if user has enough balance
      const currentBalance = await storage.getUserBalance(req.session.userId, currency);
      
      if (!currentBalance || currentBalance.amount < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Update balance
      const newAmount = currentBalance.amount - amount;
      const balance = await storage.updateUserBalance(req.session.userId, currency, newAmount);
      
      // Create transaction record
      const transaction = await storage.createTransaction({
        userId: req.session.userId,
        type: "withdrawal",
        amount: -amount, // Negative amount for withdrawal
        currency,
        status: "completed",
        txHash: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      });
      
      return res.status(200).json({ 
        message: "Withdrawal successful",
        balance,
        transaction
      });
    } catch (error) {
      console.error("Withdrawal error:", error);
      return res.status(500).json({ message: "Error processing withdrawal" });
    }
  });
  
  app.get("/api/transactions", async (req: Request, res: Response) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const transactions = await storage.getTransactionsByUserId(req.session.userId);
      return res.status(200).json({ transactions });
    } catch (error) {
      console.error("Get transactions error:", error);
      return res.status(500).json({ message: "Error fetching transactions" });
    }
  });
  
  // Game routes
  app.post("/api/games/bet", async (req: Request, res: Response) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const validation = validateInput(betSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: "Invalid input", errors: validation.error });
    }
    
    const { amount, currency, gameType } = validation.data;
    const result = req.body.result || Math.random() > 0.5; // Default to random win/loss if no result provided
    
    try {
      // Check if user has enough balance
      const currentBalance = await storage.getUserBalance(req.session.userId, currency);
      
      if (!currentBalance || currentBalance.amount < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Process bet
      let newAmount;
      let transactionType;
      let transactionAmount;
      
      if (result) {
        // Win
        const winMultiplier = req.body.winMultiplier || 2.0; // Default 2x multiplier if not specified
        const winAmount = amount * winMultiplier;
        newAmount = currentBalance.amount + (winAmount - amount);
        transactionType = "win";
        transactionAmount = winAmount;
      } else {
        // Loss
        newAmount = currentBalance.amount - amount;
        transactionType = "bet";
        transactionAmount = -amount;
      }
      
      // Update balance
      const balance = await storage.updateUserBalance(req.session.userId, currency, newAmount);
      
      // Create transaction record
      const transaction = await storage.createTransaction({
        userId: req.session.userId,
        type: transactionType,
        amount: transactionAmount,
        currency,
        gameType,
        status: "completed",
      });
      
      return res.status(200).json({ 
        message: result ? "Win!" : "Better luck next time!",
        result,
        balance,
        transaction
      });
    } catch (error) {
      console.error("Game bet error:", error);
      return res.status(500).json({ message: "Error processing bet" });
    }
  });
  
  // Sports betting routes
  app.get("/api/sports/matches", async (req: Request, res: Response) => {
    try {
      const sportType = req.query.sport as string;
      
      let matches;
      if (sportType) {
        matches = await storage.getSportsMatchesBySport(sportType);
      } else {
        matches = await storage.getAllSportsMatches();
      }
      
      return res.status(200).json({ matches });
    } catch (error) {
      console.error("Get sports matches error:", error);
      return res.status(500).json({ message: "Error fetching sports matches" });
    }
  });
  
  app.post("/api/sports/bet", async (req: Request, res: Response) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const { matchId, selectionId, odds, stake, currency } = req.body;
    
    if (!matchId || !selectionId || !odds || !stake || !currency) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    try {
      // Check if user has enough balance
      const currentBalance = await storage.getUserBalance(req.session.userId, currency);
      
      if (!currentBalance || currentBalance.amount < stake) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Update balance
      const newAmount = currentBalance.amount - stake;
      const balance = await storage.updateUserBalance(req.session.userId, currency, newAmount);
      
      // Create sports bet
      const potentialWin = stake * odds;
      const bet = await storage.createSportsBet({
        userId: req.session.userId,
        matchId,
        selectionId,
        odds,
        stake,
        currency,
        potentialWin,
        status: "pending"
      });
      
      // Create transaction record
      const transaction = await storage.createTransaction({
        userId: req.session.userId,
        type: "bet",
        amount: -stake,
        currency,
        gameType: "sports",
        status: "completed",
      });
      
      return res.status(200).json({ 
        message: "Bet placed successfully",
        balance,
        bet,
        transaction
      });
    } catch (error) {
      console.error("Sports bet error:", error);
      return res.status(500).json({ message: "Error placing sports bet" });
    }
  });
  
  app.get("/api/sports/bets", async (req: Request, res: Response) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const bets = await storage.getSportsBetsByUserId(req.session.userId);
      return res.status(200).json({ bets });
    } catch (error) {
      console.error("Get sports bets error:", error);
      return res.status(500).json({ message: "Error fetching sports bets" });
    }
  });

  return httpServer;
}
