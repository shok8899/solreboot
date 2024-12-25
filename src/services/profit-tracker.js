import { logger } from '../utils/logger.js';

export class ProfitTracker {
  constructor() {
    this.trades = [];
    this.totalProfit = 0;
  }

  recordTrade(trade) {
    this.trades.push({
      ...trade,
      timestamp: Date.now(),
    });
    this.updateTotalProfit(trade);
  }

  updateTotalProfit(trade) {
    // Calculate profit/loss for this trade
    const profitLoss = trade.exitAmount - trade.entryAmount;
    this.totalProfit += profitLoss;
    
    logger.info(`Trade P/L: ${profitLoss} SOL, Total P/L: ${this.totalProfit} SOL`);
  }

  getStats() {
    const stats = {
      totalTrades: this.trades.length,
      totalProfit: this.totalProfit,
      profitableTrades: this.trades.filter(t => t.exitAmount > t.entryAmount).length,
      avgProfitPerTrade: this.totalProfit / this.trades.length || 0,
      last24Hours: this.getLast24HoursStats(),
    };

    return stats;
  }

  getLast24HoursStats() {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recent = this.trades.filter(t => t.timestamp >= oneDayAgo);
    
    return {
      trades: recent.length,
      profit: recent.reduce((sum, t) => sum + (t.exitAmount - t.entryAmount), 0),
    };
  }
}