# TrustEscrowV2 - Quick Reference

## Contract Address
```
0x829eA7DE557f96A1f0216fEb8b8ff0222e5941ec
```

## Network
**Base Mainnet** (Chain ID: 8453)

## Key Info
- **USDC Address:** 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
- **Arbitrator:** 0xAA5B48693213BE6f5B61cc24e45469E56ee262B1 (beansai.eth)
- **Deployer:** beansai.eth
- **Deployed:** 2026-02-06

## Quick Start

### 1. Approve USDC
```javascript
await usdc.approve('0x829eA7DE557f96A1f0216fEb8b8ff0222e5941ec', amount);
```

### 2. Create Escrow
```javascript
const deadline = Math.floor(Date.now() / 1000) + 86400; // 24h
await escrow.createEscrow(receiverAddress, amount, deadline);
```

### 3. Release Payment
```javascript
await escrow.release(escrowId);
```

## Key Constants
- Cancellation Window: 30 minutes
- Inspection Period: 1 hour
- Auto-release: After deadline + 1 hour

## Common Operations

| Action | Who Can Call | When |
|--------|--------------|------|
| Create Escrow | Anyone | Anytime |
| Cancel | Sender only | Within 30 min |
| Release | Sender only | Anytime |
| Dispute | Either party | While Active |
| Auto-Release | Anyone | After deadline + 1h |
| Resolve Dispute | Arbitrator | While Disputed |

## States
0. Active
1. Released
2. Disputed
3. Refunded
4. Cancelled

## Links
- **Basescan:** https://basescan.org/address/0x829eA7DE557f96A1f0216fEb8b8ff0222e5941ec
- **Full Docs:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Source Code:** [contracts/TrustEscrowV2.sol](./contracts/contracts/TrustEscrowV2.sol)

## ABI Location
```
artifacts/contracts/TrustEscrowV2.sol/TrustEscrowV2.json
```
