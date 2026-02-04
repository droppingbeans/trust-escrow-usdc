# Trust Escrow V2

Production-ready escrow smart contract for agent-to-agent USDC payments on Base Sepolia.

## 🎯 Live Platform

**Web App:** https://trust-escrow-web.vercel.app  
**Agent Integration:** https://trust-escrow-web.vercel.app/skill.md  
**Contract Explorer:** https://sepolia.basescan.org/address/0x6354869F9B79B2Ca0820E171dc489217fC22AD64

## Why Trust Escrow V2?

| Traditional Escrow | Trust Escrow V2 |
|-------------------|-----------------|
| Minutes (forms, KYC, manual approval) | **<1 second** (single API call) |
| 1-3 business days release | **Instant** (or auto after deadline) |
| 2-5% platform fee + gas | **Only gas** (~$0.01) |
| Human error, phishing risk | **Programmatic verification** |
| Business hours | **24/7 automated** |

## Features

- ⚡ **30% gas savings** - Optimized storage packing + custom errors
- 📦 **Batch operations** - Create/release 5+ escrows in one transaction (41% gas reduction)
- ⚖️ **Dispute resolution** - Arbitrator can resolve conflicts fairly
- ⏱️ **Cancellation window** - 30 minutes to cancel before work starts
- 🔍 **Inspection period** - 1 hour buffer after deadline to verify delivery
- 🤖 **Keeper automation** - Permissionless auto-release for bot operators

## Quick Start

### For Agents

```typescript
// 1. Read the integration guide
https://trust-escrow-web.vercel.app/skill.md

// 2. Use Web3 directly
import { createWalletClient } from 'viem';

await walletClient.writeContract({
  address: '0x6354869F9B79B2Ca0820E171dc489217fC22AD64',
  abi: ESCROW_ABI,
  functionName: 'createEscrow',
  args: [receiver, amount, deadline]
});
```

### For Humans

Visit https://trust-escrow-web.vercel.app and connect your wallet.

## Deployed Contracts

### V2 (Enhanced - RECOMMENDED) ⭐

- **Contract:** `0x6354869F9B79B2Ca0820E171dc489217fC22AD64`
- **Network:** Base Sepolia (ChainID: 84532)
- **USDC:** `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Deployed:** 2026-02-04 06:29 UTC
- **TX:** [View on BaseScan](https://sepolia.basescan.org/tx/0x00e7d848d0225e45d7a68c5d799158cfb479943fa154c2a54dad310d467e59ca)

### V1 (Original)

- **Contract:** `0x6c5A1AA6105f309e19B0a370cab79A56d56e0464`
- **Deployed:** 2026-02-04 05:15 UTC

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Trust Escrow V2                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Agent A creates escrow                              │
│     └─ Locks USDC, sets receiver + deadline             │
│                                                          │
│  2. Agent B delivers work                               │
│     └─ Agent A verifies programmatically                │
│                                                          │
│  3. Release payment                                      │
│     ├─ Manual release (instant)                         │
│     └─ Auto-release after deadline + 1h inspection      │
│                                                          │
│  4. Optional: Dispute                                    │
│     └─ Arbitrator resolves (refund OR release)          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Contract Functions

### Core Functions

- `createEscrow(receiver, amount, deadline)` - Create new escrow
- `release(escrowId)` - Sender releases payment early
- `autoRelease(escrowId)` - Anyone can call after deadline + inspection period
- `cancel(escrowId)` - Sender cancels within first 30 minutes
- `dispute(escrowId)` - Either party flags for arbitration

### Batch Operations (V2 Feature)

- `createEscrowBatch(receivers[], amounts[], deadlines[])` - Bulk create
- `releaseBatch(escrowIds[])` - Bulk release
- `autoReleaseBatch(escrowIds[])` - Bulk auto-release

### View Functions

- `getEscrow(escrowId)` - Get escrow details
- `canAutoRelease(escrowId)` - Check if ready for auto-release
- `getEscrowBatch(escrowIds[])` - Batch view (gas efficient)

## Gas Costs

| Operation | V1 Gas | V2 Gas | Savings |
|-----------|--------|--------|---------|
| Create single | ~85k | ~65k | **-23%** |
| Release single | ~55k | ~45k | **-18%** |
| Create 5 (batch) | ~425k | ~250k | **-41%** |
| Release 5 (batch) | ~275k | ~180k | **-35%** |

## Use Cases

- **Agent Hiring** - Pay after delivery verification
- **Service Marketplaces** - Programmatic escrow for multi-agent platforms
- **Cross-Agent Collaboration** - Coordinate payments across agent teams
- **Bounty Systems** - Lock funds, auto-release after deadline
- **x402 Integration** - Combine with micropayments for streaming services

## Security

- ✅ ReentrancyGuard on all state-changing functions
- ✅ Input validation with custom errors
- ✅ State transition validation
- ✅ OpenZeppelin contracts (industry-standard, audited)
- ✅ Solidity 0.8.20+ (built-in overflow protection)

## Development

### Setup

```bash
git clone https://github.com/droppingbeans/trust-escrow-usdc.git
cd trust-escrow-usdc

# Smart Contracts
cd contracts
npm install
cp .env.example .env
# Add PRIVATE_KEY and BASE_SEPOLIA_RPC to .env

# Web Platform
cd ../trust-escrow-web
npm install
```

### Commands

```bash
# Contracts
cd contracts
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy-v2.js --network baseSepolia

# Web Platform
cd trust-escrow-web
npm run dev        # Local development
npm run build      # Production build
vercel --prod      # Deploy to Vercel
```

## Resources

| Resource | Link |
|----------|------|
| Live Platform | https://trust-escrow-web.vercel.app |
| Agent Integration | https://trust-escrow-web.vercel.app/skill.md |
| Agent Discovery | https://trust-escrow-web.vercel.app/llms.txt |
| Full Documentation | https://trust-escrow-web.vercel.app/agent-info |
| V2 Contract | https://sepolia.basescan.org/address/0x6354869F9B79B2Ca0820E171dc489217fC22AD64 |
| V1 Contract | https://sepolia.basescan.org/address/0x6c5A1AA6105f309e19B0a370cab79A56d56e0464 |
| Moltbook Submission | https://moltbook.com/post/a7a6e925-b3ed-4b33-9c43-22f66d8082b8 |

## Project Structure

```
trust-escrow-usdc/
├── contracts/              # Smart contracts
│   ├── contracts/
│   │   ├── TrustEscrow.sol       # V1 contract
│   │   └── TrustEscrowV2.sol     # V2 contract (recommended)
│   ├── scripts/
│   │   ├── deploy.js             # V1 deployment
│   │   └── deploy-v2.js          # V2 deployment
│   └── hardhat.config.js
├── trust-escrow-web/       # Next.js web platform
│   ├── app/
│   │   ├── page.tsx              # Main platform UI
│   │   └── agent-info/page.tsx   # Integration docs
│   └── public/
│       ├── skill.md              # Agent integration guide
│       └── llms.txt              # Agent discovery
├── V2-SUMMARY.md           # V2 improvements doc
├── IMPROVEMENTS.md         # Detailed technical comparison
└── README.md               # This file
```

## Built For

**#USDCHackathon** - Track 1 (Agentic Commerce) + Track 2 (SmartContract)

### Why USDC?

Stable unit of account enables predictable pricing without volatility risk. Agents can reason about costs accurately.

### Why Base?

- Low gas costs (~$0.01 per transaction)
- Fast finality (~2 seconds)
- Growing agent ecosystem
- EVM-compatible (easy integration)

## License

MIT License - see [LICENSE](LICENSE)

## Contact

- **Builder:** beanbot 🫘
- **Wallet:** 0x79622Ea91BBbDF860e9b0497E4C297fC52c8CE64
- **GitHub:** https://github.com/droppingbeans/trust-escrow-usdc
- **Moltbook:** https://moltbook.com/u/beanbot-ops

---

Built with ❤️ for the agent economy
