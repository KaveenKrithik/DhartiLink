# DhartiLink Production Deployment Guide

## 🚀 **How It Works in Production**

### Current Setup (localStorage)
- ✅ Fast and simple
- ✅ No backend needed
- ❌ Data tied to browser, not wallet
- ❌ Lost when clearing browser data
- ❌ Can't sync across devices

### Production Setup (Database + Wallet Auth)
- ✅ Data tied to wallet address
- ✅ Works across all browsers/devices
- ✅ Secure with wallet signatures
- ✅ Real production app
- ✅ Can scale to thousands of users

---

## 📋 **Option 1: Simple Deployment (Vercel + Supabase) - RECOMMENDED**

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up (free tier available)
3. Create new project
4. Note your project URL and anon key

### Step 2: Create Database Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Users table (auto-created based on wallet)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP DEFAULT NOW()
);

-- Purchased lands table
CREATE TABLE purchased_lands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL,
  land_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  area TEXT,
  location TEXT,
  seller TEXT,
  seller_name TEXT,
  purchase_date TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_wallet) REFERENCES users(wallet_address),
  UNIQUE(user_wallet, land_id)
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL,
  type TEXT NOT NULL,
  land_id TEXT,
  land_title TEXT,
  amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL,
  etherscan_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_wallet) REFERENCES users(wallet_address)
);

-- ERS balance tracking
CREATE TABLE balances (
  user_wallet TEXT PRIMARY KEY,
  ers_balance DECIMAL(20, 2) DEFAULT 10000.00,
  spent_amount DECIMAL(20, 2) DEFAULT 0.00,
  last_updated TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_wallet) REFERENCES users(wallet_address)
);

-- Create indexes for faster queries
CREATE INDEX idx_purchased_lands_wallet ON purchased_lands(user_wallet);
CREATE INDEX idx_transactions_wallet ON transactions(user_wallet);
CREATE INDEX idx_transactions_land ON transactions(land_id);
```

### Step 3: Set Up Environment Variables

Create `.env.local` in your project:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Step 5: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# Settings → Environment Variables → Add:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 📋 **Option 2: Full Control (Vercel + PostgreSQL)**

### Database Options:
- **Vercel Postgres** (integrated, easy)
- **Railway** (free tier, easy setup)
- **Neon** (serverless PostgreSQL)

### Setup is similar but you control everything!

---

## 🔐 **How Wallet Authentication Works**

### User Flow:
```
1. User connects MetaMask
   ↓
2. App requests signature (proves ownership)
   ↓
3. Server verifies signature
   ↓
4. Server returns data for that wallet address
   ↓
5. All data tied to wallet, not browser!
```

### Security:
- ✅ No passwords needed
- ✅ Wallet signature proves identity
- ✅ Can't fake wallet ownership
- ✅ Data isolated per wallet

---

## 🌐 **What Happens After Deployment**

### User on Device 1 (Chrome):
```
Connect Wallet → 0x397C...
Database shows:
- 5 lands purchased
- Balance: 9,950 ERS
- 12 transactions
```

### Same User on Device 2 (Firefox):
```
Connect Wallet → 0x397C... (SAME WALLET)
Database shows:
- 5 lands purchased      ← SAME DATA!
- Balance: 9,950 ERS     ← SYNCED!
- 12 transactions        ← SYNCED!
```

**Same wallet = Same data everywhere!** ✅

---

## 📊 **Data Flow Example**

### Current (localStorage):
```javascript
// Saved in browser only
localStorage.setItem('purchasedLands', JSON.stringify(lands))
// Lost when switching browsers ❌
```

### Production (Database):
```javascript
// Saved to database with wallet address
await supabase
  .from('purchased_lands')
  .insert({ 
    user_wallet: account,
    land_id: 'LAND001',
    ...landData 
  })
// Accessible from any browser! ✅
```

---

## 🎯 **Quick Start for Production**

### 1. **Choose Your Stack:**
- **Easy**: Supabase (recommended for beginners)
- **Control**: Vercel Postgres + Prisma
- **Flexible**: Railway + PostgreSQL

### 2. **What You Get:**
- ✅ Real database storage
- ✅ Data tied to wallet address
- ✅ Cross-device sync
- ✅ Scalable to millions of users
- ✅ Secure with wallet signatures

### 3. **Deployment:**
```bash
# Build your app
npm run build

# Deploy to Vercel
vercel --prod

# Your app is live at:
# https://dharti-link.vercel.app
```

---

## 💡 **Why This Matters**

### LocalStorage (Current):
- Good for: Demos, testing, MVPs
- Bad for: Production, multiple devices

### Database + Wallet Auth (Production):
- Good for: Real apps, multiple users, production
- Essential for: Professional deployment

---

## 🚀 **Next Steps**

1. Create Supabase account
2. Run SQL to create tables
3. I'll update the code to use Supabase
4. Deploy to Vercel
5. Your app is production-ready!

**Want me to update the code to use Supabase?** Just say "yes" and I'll do it!

