const hre = require("hardhat");

async function main() {
  // USDC on Base Sepolia testnet
  const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  
  console.log("Deploying TrustEscrow...");
  
  const TrustEscrow = await hre.ethers.getContractFactory("TrustEscrow");
  const escrow = await TrustEscrow.deploy(USDC_BASE_SEPOLIA);
  
  await escrow.waitForDeployment();
  const address = await escrow.getAddress();
  
  console.log(`TrustEscrow deployed to: ${address}`);
  console.log(`View on BaseScan: https://sepolia.basescan.org/address/${address}`);
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    address,
    network: "baseSepolia",
    usdc: USDC_BASE_SEPOLIA,
    deployedAt: new Date().toISOString(),
    tx: escrow.deploymentTransaction().hash
  };
  
  fs.writeFileSync(
    '../deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
