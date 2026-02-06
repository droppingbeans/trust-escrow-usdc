#!/bin/bash
# Verify TrustEscrowV2 on Basescan
# Usage: BASESCAN_API_KEY=your_key ./verify.sh

CONTRACT_ADDRESS="0x829eA7DE557f96A1f0216fEb8b8ff0222e5941ec"
USDC_ADDRESS="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
ARBITRATOR="0xAA5B48693213BE6f5B61cc24e45469E56ee262B1"

if [ -z "$BASESCAN_API_KEY" ]; then
  echo "Error: BASESCAN_API_KEY not set"
  echo "Get your API key from: https://basescan.org/myapikey"
  echo ""
  echo "Usage: BASESCAN_API_KEY=your_key ./verify.sh"
  exit 1
fi

echo "Verifying TrustEscrowV2 on Base mainnet..."
echo "Contract: $CONTRACT_ADDRESS"
echo "Constructor params:"
echo "  - USDC: $USDC_ADDRESS"
echo "  - Arbitrator: $ARBITRATOR"
echo ""

npx hardhat verify --network base \
  "$CONTRACT_ADDRESS" \
  "$USDC_ADDRESS" \
  "$ARBITRATOR"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Verification successful!"
  echo "View at: https://basescan.org/address/$CONTRACT_ADDRESS#code"
else
  echo ""
  echo "❌ Verification failed"
  exit 1
fi
