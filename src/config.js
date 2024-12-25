export const config = {
  // Default RPC endpoint - can be overridden by .env
  rpcEndpoint: "https://api.mainnet-beta.solana.com",
  
  // Wallet configurations
  wallets: [
    // Add monitored wallet addresses here
  ],
  
  // Trading parameters
  tradingConfig: {
    tradeAmount: 1.0, // Amount in SOL per trade
    slippageMode: 'auto', // 'auto' or 'custom'
    customSlippage: undefined, // Set a fixed percentage when using custom mode
    autoSlippageConfig: {
      baseSlippage: 0.1,
      maxSlippage: 5.0,
      volatilityMultiplier: 1.5
    },
    gasMultiplier: 1.5, // Multiply estimated gas by this factor
  },
  
  // Monitoring interval in milliseconds
  monitoringInterval: 100, // 100ms monitoring interval
};