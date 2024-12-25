import { logger } from './logger.js';

export class SlippageCalculator {
  constructor(config) {
    this.config = config;
    this.marketVolatility = new Map(); // Store recent price movements
  }

  // Calculate dynamic slippage based on market conditions
  calculateAutoSlippage(tokenAddress, tradeAmount) {
    const volatility = this.marketVolatility.get(tokenAddress) || 0.5;
    const baseSlippage = 0.1; // 0.1% base slippage
    
    // Adjust slippage based on trade size and volatility
    let dynamicSlippage = baseSlippage;
    
    // Increase slippage for larger trades
    if (tradeAmount > 10) {
      dynamicSlippage *= 1.5;
    }
    
    // Adjust for volatility
    dynamicSlippage *= (1 + volatility);
    
    // Cap maximum auto slippage at 5%
    return Math.min(dynamicSlippage, 5.0);
  }

  getSlippageTolerance(tokenAddress, tradeAmount) {
    // If custom slippage is set, use it
    if (this.config.customSlippage !== undefined) {
      return this.config.customSlippage;
    }
    
    // Otherwise calculate automatic slippage
    return this.calculateAutoSlippage(tokenAddress, tradeAmount);
  }

  // Update market volatility data
  updateMarketVolatility(tokenAddress, priceChange) {
    this.marketVolatility.set(tokenAddress, Math.abs(priceChange));
  }
}