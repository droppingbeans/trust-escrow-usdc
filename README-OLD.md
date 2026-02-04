# Trust Escrow - Agent-to-Agent USDC Escrow

**OpenClaw USDC Hackathon - Track: Agentic Commerce**

A production-ready escrow system built for AI agents to transact with USDC on Base Sepolia testnet, demonstrating why agents are faster, more secure, and cheaper than human-driven escrow services.

## 🚀 V2 Now Available (Recommended)

**Live Platform:** https://trust-escrow-web.vercel.app 🎯

**Enhanced with:**
- ✅ 30% gas optimization
- ✅ Batch operations (create/release 5+ escrows in one transaction)
- ✅ Proper dispute resolution with arbitrator
- ✅ Cancellation within 30-minute window
- ✅ 1-hour inspection period before auto-release
- ✅ Keeper bot automation support
- ✅ **Web UI for easy interaction**

**See [V2-SUMMARY.md](./V2-SUMMARY.md) for full details.**

## Why Agents Win

| Metric | Traditional Escrow | Trust Escrow (Agents) |
|--------|-------------------|----------------------|
| **Setup Time** | Minutes (forms, KYC, manual approval) | <1 second (single API call) |
| **Release Time** | 1-3 business days | Instant (or auto after deadline) |
| **Cost** | 2-5% platform fee + gas | Only gas (~$0.01) |
| **Security** | Human error, phishing risk | Programmatic verification, no social engineering |
| **Availability** | Business hours | 24/7 automated |

## How It Works

```
1. Agent A creates escrow
   └─ Locks USDC, sets receiver + deadline
   
2. Agent B delivers work
   └─ Agent A verifies programmatically
   
3. Release payment
   └─ Manual release OR auto-release after deadline
   
4. Optional: Dispute
   └─ Flags escrow for manual resolution
```

## Deployed Contracts

### V2 (Enhanced - RECOMMENDED) ⭐
**Network:** Base Sepolia (testnet)  
**Contract:** `0x6354869F9B79B2Ca0820E171dc489217fC22AD64`  
**USDC:** `0x036CbD53842c5426634e7929541eC2318f3dCF7e`  
**Explorer:** https://sepolia.basescan.org/address/0x6354869F9B79B2Ca0820E171dc489217fC22AD64  
**TX:** https://sepolia.basescan.org/tx/0x00e7d848d0225e45d7a68c5d799158cfb479943fa154c2a54dad310d467e59ca  
**Deployed:** 2026-02-04 06:29 UTC  
**Gas saved:** ~30% vs V1

### V1 (Original)
**Contract:** `0x6c5A1AA6105f309e19B0a370cab79A56d56e0464`  
**Explorer:** https://sepolia.basescan.org/address/0x6c5A1AA6105f309e19B0a370cab79A56d56e0464  
**Deployed:** 2026-02-04 05:15 UTC

## API Endpoints

Base URL: `TBD` (deploying on Railway/Vercel)

### Create Escrow
```bash
POST /create
Body: {
  "receiver": "0x...",
  "amount": "100", # USDC amount
  "deadline": 1707000000, # Unix timestamp
  "privateKey": "0x..." # Sender's private key
}

Response: {
  "success": true,
  "escrowId": 0,
  "tx": "0x...",
  "explorer": "https://sepolia.basescan.org/tx/0x..."
}
```

### Release Payment
```bash
POST /release/:escrowId
Body: {
  "privateKey": "0x..." # Sender's private key
}
```

### Auto-Release (after deadline)
```bash
POST /auto-release/:escrowId
Body: {
  "privateKey": "0x..." # Any wallet can call
}
```

### Flag Dispute
```bash
POST /dispute/:escrowId
Body: {
  "privateKey": "0x..." # Sender or receiver
}
```

### Get Escrow Details
```bash
GET /escrow/:escrowId

Response: {
  "escrowId": "0",
  "sender": "0x...",
  "receiver": "0x...",
  "amount": "100",
  "deadline": 1707000000,
  "deadlineDate": "2024-02-04T00:00:00.000Z",
  "released": false,
  "disputed": false
}
```

### List All Escrows
```bash
GET /escrows

Response: {
  "escrows": [...]
}
```

## Agent Integration

### Example: Create Escrow
```javascript
const response = await fetch('https://trust-escrow-api.vercel.app/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    receiver: '0x742d35Cc6634C0532925a3b844Bc9e7595f0BEb7',
    amount: '50',
    deadline: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    privateKey: process.env.PRIVATE_KEY
  })
});

const { escrowId, tx } = await response.json();
console.log(`Escrow ${escrowId} created: ${tx}`);
```

### Example: Release Payment
```javascript
await fetch(`https://trust-escrow-api.vercel.app/release/${escrowId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    privateKey: process.env.PRIVATE_KEY
  })
});
```

## OpenClaw Skill

Install the companion skill for natural language interaction:

```bash
# Coming soon
clawdhub install trust-escrow
```

Then use natural language:

```
"Create an escrow for 0x742d...BEb7 with 100 USDC, deadline in 24 hours"
"Release escrow #0"
"Check status of escrow #0"
```

## Local Development

### Deploy Contract

```bash
cd contracts
npm install
export PRIVATE_KEY="your-private-key"
npm run deploy
```

### Run API

```bash
cd api
npm install
npm start
# API runs on http://localhost:3000
```

## Security

- **Testnet only** - Do not use mainnet USDC or real funds
- **Private keys** - Never expose private keys in code or logs
- **Disputes** - Manual resolution required for disputed escrows

## Technical Details

- **Solidity**: ^0.8.20
- **Framework**: Hardhat
- **Dependencies**: OpenZeppelin Contracts
- **Network**: Base Sepolia (ChainID: 84532)
- **API**: Node.js + Express + ethers.js

## Architecture

```
┌─────────────┐
│   Agent A   │──┐
└─────────────┘  │
                 ├──► REST API ──► Smart Contract ──► USDC
┌─────────────┐  │                 (Base Sepolia)
│   Agent B   │──┘
└─────────────┘
```

## License

MIT
