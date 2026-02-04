const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Load contract deployment info
const deployment = require('../deployment.json');
const ESCROW_ABI = require('../contracts/artifacts/contracts/TrustEscrow.sol/TrustEscrow.json').abi;

// Base Sepolia provider
const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
const escrowContract = new ethers.Contract(deployment.address, ESCROW_ABI, provider);

/**
 * GET / - API info
 */
app.get('/', (req, res) => {
  res.json({
    service: 'Trust Escrow API',
    description: 'Agent-to-agent escrow for USDC on Base Sepolia testnet',
    contract: deployment.address,
    network: 'Base Sepolia (testnet)',
    endpoints: {
      '/create': 'POST - Create new escrow',
      '/release/:id': 'POST - Release escrow payment',
      '/auto-release/:id': 'POST - Auto-release after deadline',
      '/dispute/:id': 'POST - Flag escrow dispute',
      '/escrow/:id': 'GET - Get escrow details',
      '/escrows': 'GET - List all escrows'
    },
    why_agents_win: {
      speed: 'Instant escrow creation (<1s vs minutes)',
      cost: 'No platform fees, only gas (~$0.01)',
      security: 'Programmatic verification, no phishing',
      automation: 'Auto-release after deadline, no human approval'
    }
  });
});

/**
 * POST /create - Create escrow
 * Body: { receiver, amount, deadline, privateKey }
 */
app.post('/create', async (req, res) => {
  try {
    const { receiver, amount, deadline, privateKey } = req.body;
    
    if (!receiver || !amount || !deadline || !privateKey) {
      return res.status(400).json({ error: 'Missing required fields: receiver, amount, deadline, privateKey' });
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    const escrow = new ethers.Contract(deployment.address, ESCROW_ABI, wallet);
    
    // Convert amount to USDC decimals (6)
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    
    // Approve USDC first
    const USDC_ABI = ['function approve(address spender, uint256 amount) returns (bool)'];
    const usdc = new ethers.Contract(deployment.usdc, USDC_ABI, wallet);
    
    const approveTx = await usdc.approve(deployment.address, amountWei);
    await approveTx.wait();
    
    // Create escrow
    const tx = await escrow.createEscrow(receiver, amountWei, deadline);
    const receipt = await tx.wait();
    
    // Get escrow ID from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = escrow.interface.parseLog(log);
        return parsed.name === 'EscrowCreated';
      } catch {
        return false;
      }
    });
    
    const escrowId = event ? Number(escrow.interface.parseLog(event).args[0]) : null;
    
    res.json({
      success: true,
      escrowId,
      tx: receipt.hash,
      explorer: `https://sepolia.basescan.org/tx/${receipt.hash}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /release/:id - Release escrow
 * Body: { privateKey }
 */
app.post('/release/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { privateKey } = req.body;
    
    if (!privateKey) {
      return res.status(400).json({ error: 'Missing privateKey' });
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    const escrow = new ethers.Contract(deployment.address, ESCROW_ABI, wallet);
    
    const tx = await escrow.release(id);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      tx: receipt.hash,
      explorer: `https://sepolia.basescan.org/tx/${receipt.hash}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /auto-release/:id - Auto-release after deadline
 * Body: { privateKey } (any wallet can call)
 */
app.post('/auto-release/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { privateKey } = req.body;
    
    if (!privateKey) {
      return res.status(400).json({ error: 'Missing privateKey' });
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    const escrow = new ethers.Contract(deployment.address, ESCROW_ABI, wallet);
    
    const tx = await escrow.autoRelease(id);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      tx: receipt.hash,
      explorer: `https://sepolia.basescan.org/tx/${receipt.hash}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /dispute/:id - Flag dispute
 * Body: { privateKey }
 */
app.post('/dispute/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { privateKey } = req.body;
    
    if (!privateKey) {
      return res.status(400).json({ error: 'Missing privateKey' });
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    const escrow = new ethers.Contract(deployment.address, ESCROW_ABI, wallet);
    
    const tx = await escrow.dispute(id);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      tx: receipt.hash,
      explorer: `https://sepolia.basescan.org/tx/${receipt.hash}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /escrow/:id - Get escrow details
 */
app.get('/escrow/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const escrow = await escrowContract.getEscrow(id);
    
    res.json({
      escrowId: id,
      sender: escrow[0],
      receiver: escrow[1],
      amount: ethers.formatUnits(escrow[2], 6), // USDC decimals
      deadline: Number(escrow[3]),
      deadlineDate: new Date(Number(escrow[3]) * 1000).toISOString(),
      released: escrow[4],
      disputed: escrow[5]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /escrows - List all escrows
 */
app.get('/escrows', async (req, res) => {
  try {
    const nextId = await escrowContract.nextEscrowId();
    const escrows = [];
    
    for (let i = 0; i < Number(nextId); i++) {
      try {
        const escrow = await escrowContract.getEscrow(i);
        escrows.push({
          escrowId: i,
          sender: escrow[0],
          receiver: escrow[1],
          amount: ethers.formatUnits(escrow[2], 6),
          deadline: Number(escrow[3]),
          deadlineDate: new Date(Number(escrow[3]) * 1000).toISOString(),
          released: escrow[4],
          disputed: escrow[5]
        });
      } catch {
        // Skip invalid IDs
      }
    }
    
    res.json({ escrows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Trust Escrow API running on port ${PORT}`);
  console.log(`Contract: ${deployment.address}`);
  console.log(`Network: Base Sepolia`);
});
