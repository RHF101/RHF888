import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { profiles } from "@shared/schema";

const GAMES_SEED = [
  {
    title: "Mythical Guardians",
    provider: "PGSoft",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/MythicalGuardians.webp",
    demoUrl: "https://nagaimam.xyz/pgsoft/mythicalguardians",
    slug: "mythical-guardians"
  },
  {
    title: "Alibaba's Cave Of Fortune",
    provider: "PGSoft",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/AlibabasCaveofFortune.webp",
    demoUrl: "https://nagaimam.xyz/pgsoft/alibabascaveoffortune",
    slug: "alibabas-cave-of-fortune"
  },
  {
    title: "Forbidden Alchemy",
    provider: "PGSoft",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/ForbiddenAlchemy.webp",
    demoUrl: "https://nagaimam.xyz/pgsoft/forbiddenalchemy",
    slug: "forbidden-alchemy"
  },
  {
    title: "Pharaoh Royals",
    provider: "PGSoft",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/PharaohRoyals.webp",
    demoUrl: "https://nagaimam.xyz/pgsoft/pharaohroyals",
    slug: "pharaoh-royals"
  },
  {
    title: "Chocolate Deluxe",
    provider: "PGSoft",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/ChocolateDeluxe.jpg",
    demoUrl: "https://nagaimam.xyz/pgsoft/chocolatedeluxe",
    slug: "chocolate-deluxe"
  },
  {
    title: "Mahjong Ways",
    provider: "PGSoft",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/MahjongWays.jpg",
    demoUrl: "https://nagaimam.xyz/pgsoft/mahjongways",
    slug: "mahjong-ways"
  },
  {
    title: "Mahjong Ways 2",
    provider: "PGSoft",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/MahjongWays2.jpg",
    demoUrl: "https://nagaimam.xyz/pgsoft/mahjongways2",
    slug: "mahjong-ways-2"
  },
  {
    title: "Mafia Mayhem",
    provider: "PGSoft",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/MafiaMayhem.jpg",
    demoUrl: "https://nagaimam.xyz/pgsoft/mafiamayhem",
    slug: "mafia-mayhem"
  },
  {
    title: "Wild Bounty Showdown",
    provider: "PGSoft",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/WildBountyShowdown.jpg",
    demoUrl: "https://nagaimam.xyz/pgsoft/wildbountyshowdown",
    slug: "wild-bounty-showdown"
  },
  {
    title: "Lucky Neko",
    provider: "PGSoft",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pgsoft/LuckyNeko.jpg",
    demoUrl: "https://nagaimam.xyz/pgsoft/luckyneko",
    slug: "lucky-neko"
  },
  {
    title: "Gates Of Gatot Kaca Super Scatter",
    provider: "PragmaticPlay",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pragmaticplay/GatesofGatotKacaSuperScatter.webp",
    demoUrl: "https://nagaimam.xyz/pragmaticplay/gatesofgatotkacasuperscatter",
    slug: "gates-of-gatot-kaca-super-scatter"
  },
  {
    title: "Sugar Rush Super Scatter",
    provider: "PragmaticPlay",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pragmaticplay/SugarRushSuperScatter.webp",
    demoUrl: "https://nagaimam.xyz/pragmaticplay/sugarrushsuperscatter",
    slug: "sugar-rush-super-scatter"
  },
  {
    title: "Fortune Of Olympus",
    provider: "PragmaticPlay",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pragmaticplay/FortuneofOlympus.webp",
    demoUrl: "https://nagaimam.xyz/pragmaticplay/fortuneofolympus",
    slug: "fortune-of-olympus"
  },
  {
    title: "King Of Spear",
    provider: "PragmaticPlay",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pragmaticplay/KingofSpear.webp",
    demoUrl: "https://nagaimam.xyz/pragmaticplay/kingofspear",
    slug: "king-of-spear"
  },
  {
    title: "Gates Of Pyroth",
    provider: "PragmaticPlay",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pragmaticplay/GatesofPyroth.webp",
    demoUrl: "https://nagaimam.xyz/pragmaticplay/gatesofpyroth",
    slug: "gates-of-pyroth"
  },
  {
    title: "Anaconda Gold",
    provider: "PragmaticPlay",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pragmaticplay/AnacondaGold.webp",
    demoUrl: "https://nagaimam.xyz/pragmaticplay/anacondagold",
    slug: "anaconda-gold"
  },
  {
    title: "Starlight Archer 1000",
    provider: "PragmaticPlay",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pragmaticplay/StarlightArcher1000.webp",
    demoUrl: "https://nagaimam.xyz/pragmaticplay/starlightarcher1000",
    slug: "starlight-archer-1000"
  },
  {
    title: "Wisdom Of Athena 1000 Xmas",
    provider: "PragmaticPlay",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pragmaticplay/WisdomofAthena1000Xmas.webp",
    demoUrl: "https://nagaimam.xyz/pragmaticplay/wisdomofathena1000xmas",
    slug: "wisdom-of-athena-1000-xmas"
  },
  {
    title: "Sweet Craze",
    provider: "PragmaticPlay",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pragmaticplay/SweetCraze.webp",
    demoUrl: "https://nagaimam.xyz/pragmaticplay/sweetcraze",
    slug: "sweet-craze"
  },
  {
    title: "Zeus vs Typhon",
    provider: "PragmaticPlay",
    imageUrl: "https://pixel.gambar-lp.com/game-demo/pragmaticplay/ZeusvsTyphon.webp",
    demoUrl: "https://nagaimam.xyz/pragmaticplay/zeusvstyphon",
    slug: "zeus-vs-typhon"
  }
];

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Seed Games
  const existingGames = await storage.getGames();
  if (existingGames.length === 0) {
    console.log("Seeding games...");
    for (const game of GAMES_SEED) {
      await storage.createGame(game);
    }
  }

  // --- API Routes ---

  // Get Current User (Full Profile)
  app.get(api.user.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    // Ensure profile exists
    let profile = await storage.getProfile(userId);
    if (!profile) {
      profile = await storage.createProfile(userId);
      // Give initial 100k balance for first login test
      await storage.updateProfile(userId, { balance: "100000" });
    }
    
    // Auto-admin the first user for convenience
    const allUsers = await storage.getAllUsers();
    if (allUsers.length === 1 && !profile.isAdmin) {
       await storage.updateProfile(userId, { isAdmin: true });
    }

    const userFull = await storage.getUserFull(userId);
    res.json(userFull);
  });
  
  // Update Bank Details
  app.put(api.user.updateBank.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const input = api.user.updateBank.input.parse(req.body);
    await storage.updateProfile(userId, input);
    res.json({ success: true });
  });

  // Wallet: Deposit
  app.post(api.wallet.deposit.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.wallet.deposit.input.parse(req.body);
      const txn = await storage.createTransaction(userId, 'deposit', input);
      res.status(201).json(txn);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Wallet: Withdraw
  app.post(api.wallet.withdraw.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.wallet.withdraw.input.parse(req.body);
      const profile = await storage.getProfile(userId);
      
      if (!profile || Number(profile.balance) < input.amount) {
         return res.status(400).json({ message: "Insufficient balance" });
      }

      // Deduct immediately for withdrawal? Or wait for approval?
      // Usually deduct pending withdrawal.
      const newBalance = Number(profile.balance) - input.amount;
      await storage.updateProfile(userId, { balance: newBalance.toString() });

      const txn = await storage.createTransaction(userId, 'withdraw', input);
      res.status(201).json(txn);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Wallet: History
  app.get(api.wallet.history.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const txns = await storage.getTransactions(userId);
    res.json(txns);
  });

  // Games: List
  app.get(api.games.list.path, async (req, res) => {
    const games = await storage.getGames();
    res.json(games);
  });

  // Games: Play
  app.post(api.games.play.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const gameId = Number(req.params.id);

    const profile = await storage.getProfile(userId);
    if (!profile) return res.sendStatus(401);

    if (profile.isFrozen) {
      return res.status(403).json({ message: "Account is frozen. Contact support." });
    }

    if (Number(profile.balance) < 500) { // Min balance to open game?
       return res.status(403).json({ message: "Insufficient balance to play. Please deposit." });
    }

    const game = await storage.getGame(gameId);
    if (!game) return res.status(404).json({ message: "Game not found" });

    // Log session
    await storage.createGameSession(userId, gameId);

    res.json({ url: game.demoUrl });
  });

  // --- ADMIN ROUTES ---

  const adminMiddleware = async (req: any, res: any, next: any) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getProfile(userId);
    if (!profile || !profile.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Admin: List Users
  app.get(api.admin.users.list.path, isAuthenticated, adminMiddleware, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // Admin: Update User
  app.patch(api.admin.users.update.path, isAuthenticated, adminMiddleware, async (req, res) => {
    const userId = req.params.userId;
    const input = api.admin.users.update.input.parse(req.body);
    
    // If updating balance, we should handle it carefully. 
    // Here we just override it as per "admin can set balance" requirement.
    const updates: any = { ...input };
    if (input.balance !== undefined) {
      updates.balance = input.balance.toString();
    }

    const updated = await storage.updateProfile(userId, updates);
    res.json(updated);
  });

  // Admin: List Transactions
  app.get(api.admin.transactions.list.path, isAuthenticated, adminMiddleware, async (req, res) => {
    // Basic filter by status if query param exists
    const status = req.query.status as string;
    let txns = await storage.getTransactions(); // Gets all
    if (status) {
      txns = txns.filter(t => t.status === status);
    }
    res.json(txns);
  });

  // Admin: Process Transaction
  app.post(api.admin.transactions.process.path, isAuthenticated, adminMiddleware, async (req, res) => {
    const txnId = Number(req.params.id);
    const input = api.admin.transactions.process.input.parse(req.body);
    const txn = await storage.getTransaction(txnId);

    if (!txn) return res.status(404).json({ message: "Transaction not found" });
    if (txn.status !== 'pending') return res.status(400).json({ message: "Transaction already processed" });

    // Logic
    if (input.status === 'approved') {
      if (txn.type === 'deposit') {
        const profile = await storage.getProfile(txn.userId);
        if (profile) {
          const newBalance = Number(profile.balance) + Number(txn.amount);
          await storage.updateProfile(txn.userId, { balance: newBalance.toString() });
        }
      } 
      // Withdraws already deducted balance on request, so if approved, just mark approved.
    } else if (input.status === 'rejected') {
      if (txn.type === 'withdraw') {
        // Refund the balance if rejected
         const profile = await storage.getProfile(txn.userId);
        if (profile) {
          const newBalance = Number(profile.balance) + Number(txn.amount);
          await storage.updateProfile(txn.userId, { balance: newBalance.toString() });
        }
      }
    }

    const updatedTxn = await storage.updateTransaction(txnId, {
      status: input.status,
      adminNote: input.adminNote
    });

    res.json(updatedTxn);
  });

  return httpServer;
}
