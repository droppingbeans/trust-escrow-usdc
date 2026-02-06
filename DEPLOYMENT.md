# TrustEscrowV2 Deployment Documentation

## Deployment Information

**Contract:** TrustEscrowV2  
**Address:** `0x829eA7DE557f96A1f0216fEb8b8ff0222e5941ec`  
**Network:** Base Mainnet (Chain ID: 8453)  
**Deployer:** beansai.eth (`0xAA5B48693213BE6f5B61cc24e45469E56ee262B1`)  
**Transaction:** https://basescan.org/tx/0x90ceabc9e2e3b6147653a48bc598964696ba1a764b707639fc511b699b5bc010  
**Basescan:** https://basescan.org/address/0x829eA7DE557f96A1f0216fEb8b8ff0222e5941ec  
**Deployed:** 2026-02-06 18:45 UTC

## Constructor Parameters

- **USDC Address:** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (Base mainnet USDC)
- **Arbitrator:** `0xAA5B48693213BE6f5B61cc24e45469E56ee262B1` (beansai.eth)

## Contract Details

### Purpose
Secure escrow system for agent-to-agent USDC payments on Base, designed for:
- Service marketplaces
- Agent hiring/bounties
- Cross-agent collaboration
- Automated payment workflows

### Key Features

**Security & Safety:**
- ✅ ReentrancyGuard on all state-changing functions
- ✅ Custom errors for gas efficiency
- ✅ Input validation (receiver != 0, amount > 0, deadline valid)
- ✅ Solidity 0.8.20+ (built-in overflow protection)
- ✅ Reviewed by @clawdhash (security auditor)

**Functionality:**
- 30-minute cancellation window (sender can cancel early)
- 1-hour inspection period (before auto-release)
- Dispute resolution system (arbitrator-mediated)
- Batch operations (gas-efficient multi-escrow handling)
- Auto-release mechanism (trustless, anyone can trigger)

**Gas Optimization:**
- Tight struct packing (uint96 amount + uint40 timestamps)
- Batch functions return success arrays (partial success > revert)
- Optimized storage layout

### Contract Functions

#### Core Functions

**createEscrow(address receiver, uint96 amount, uint40 deadline)**
- Creates new escrow
- Sender must approve USDC first
- Returns escrowId
- Emits: EscrowCreated

**release(uint256 escrowId)**
- Sender releases payment to receiver
- Only sender can call
- Immediate payment
- Emits: EscrowReleased

**cancel(uint256 escrowId)**
- Sender cancels within 30-min window
- Refunds sender
- Can only cancel if Active state
- Emits: EscrowCancelled

**dispute(uint256 escrowId)**
- Either party can flag dispute
- Freezes escrow until arbitrator resolves
- Emits: EscrowDisputed

**autoRelease(uint256 escrowId)**
- Anyone can call after deadline + 1 hour
- Trustless release mechanism
- Enables passive keeper bots
- Emits: EscrowReleased

**resolveDispute(uint256 escrowId, bool refund)**
- Arbitrator only
- true = refund sender, false = pay receiver
- Emits: DisputeResolved

#### Batch Functions

**createEscrowBatch(address[] receivers, uint96[] amounts, uint40[] deadlines)**
- Creates multiple escrows in one transaction
- Returns (escrowIds[], success[])
- Continues on individual failures

**releaseBatch(uint256[] escrowIds)**
- Releases multiple escrows
- Returns success[]
- Reverts failed transfers safely

**autoReleaseBatch(uint256[] escrowIds)**
- Auto-releases multiple escrows
- Returns success[]
- Gas-efficient for keeper bots

#### View Functions

**getEscrow(uint256 escrowId)**
- Returns full escrow details
- Gas-optimized view

**canAutoRelease(uint256 escrowId)**
- Checks if auto-release is ready
- Helper for bots/UIs

**getEscrowBatch(uint256[] escrowIds)**
- Batch view for multiple escrows
- Returns (states[], amounts[])

### Constants

- `INSPECTION_PERIOD`: 1 hour (3600 seconds)
- `CANCELLATION_WINDOW`: 30 minutes (1800 seconds)

### Events

```solidity
event EscrowCreated(uint256 indexed escrowId, address indexed sender, address indexed receiver, uint256 amount, uint256 deadline);
event EscrowReleased(uint256 indexed escrowId, address indexed releaser, uint256 amount);
event EscrowDisputed(uint256 indexed escrowId, address indexed disputer);
event DisputeResolved(uint256 indexed escrowId, address indexed resolver, bool refunded);
event EscrowCancelled(uint256 indexed escrowId, address indexed canceller);
event ArbitratorChanged(address indexed oldArbitrator, address indexed newArbitrator);
```

### States

```solidity
enum EscrowState { Active, Released, Disputed, Refunded, Cancelled }
```

## Integration Guide

### For Agents (JavaScript/TypeScript)

```javascript
const { ethers } = require('ethers');

const ESCROW_ADDRESS = '0x829eA7DE557f96A1f0216fEb8b8ff0222e5941ec';
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// ABI (minimal)
const escrowABI = [
  'function createEscrow(address receiver, uint96 amount, uint40 deadline) external returns (uint256)',
  'function release(uint256 escrowId) external',
  'function getEscrow(uint256 escrowId) external view returns (address sender, address receiver, uint256 amount, uint256 createdAt, uint256 deadline, uint8 state)'
];

const usdcABI = [
  'function approve(address spender, uint256 amount) external returns (bool)'
];

// Create escrow
const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
const wallet = new ethers.Wallet(privateKey, provider);
const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowABI, wallet);
const usdc = new ethers.Contract(USDC_ADDRESS, usdcABI, wallet);

// Step 1: Approve USDC
const amount = ethers.utils.parseUnits('10', 6); // 10 USDC
await usdc.approve(ESCROW_ADDRESS, amount);

// Step 2: Create escrow
const receiver = '0x...';
const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours
const tx = await escrow.createEscrow(receiver, amount, deadline);
const receipt = await tx.wait();

// Extract escrow ID from logs
const escrowId = receipt.events[0].args.escrowId;
console.log('Escrow created:', escrowId.toString());
```

### For Service Listings

Add to agent service metadata:
```json
{
  "payment": {
    "method": "Trust-Escrow on Base",
    "contract": "0x829eA7DE557f96A1f0216fEb8b8ff0222e5941ec",
    "token": "USDC",
    "network": "base-mainnet"
  }
}
```

## Verification Status

**Status:** ⏳ Pending  
**Next Steps:**
1. Obtain Basescan API key
2. Run verification: `npx hardhat verify --network base 0x829eA7DE557f96A1f0216fEb8b8ff0222e5941ec "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" "0xAA5B48693213BE6f5B61cc24e45469E56ee262B1"`
3. Source code will be publicly visible on Basescan

## Security Review

**Reviewed by:** @clawdhash (2026-02-06)

**Review Summary:**
- ✅ All security best practices followed
- ✅ No reentrancy vulnerabilities
- ✅ Proper state machine transitions
- ✅ Gas optimizations implemented
- ✅ Events for all state changes
- ✅ Input validation on all functions

**Implemented Suggestions:**
- Added note about indexed event parameter limits
- Modified batch functions to return success arrays (early return vs revert)

## Use Cases

1. **Contract Deployment Service**
   - Client creates escrow for 0.01 ETH worth of USDC
   - Developer deploys contract
   - Client verifies and releases payment

2. **GitHub PR Automation**
   - Per-merge payment via escrow
   - Release on successful PR merge
   - Auto-release if no disputes after deadline

3. **Reputation Building**
   - Escrow for review services
   - Release triggers ERC-8004 reputation feedback
   - Builds trust through successful transactions

## Related Contracts

- **USDC on Base:** 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
- **ERC-8004 Identity Registry:** 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
- **ERC-8004 Reputation Registry:** 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63

## License

MIT License

## Contact

- **Deployer:** beansai.eth
- **GitHub:** @droppingbeans
- **Twitter:** @DroppingBeans_
- **Telegram:** @Goya_bean
- **ERC-8004 Profile:** https://agentscan.info/agents/396927d2-dcaa-46cb-b420-334787fe0598
