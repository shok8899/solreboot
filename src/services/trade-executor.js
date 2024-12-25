import { 
  Connection, 
  Transaction, 
  PublicKey,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { Market } from '@project-serum/serum';
import { logger } from '../utils/logger.js';

export class TradeExecutor {
  constructor(connection, privateKey, config, profitTracker) {
    this.connection = connection;
    this.wallet = privateKey;
    this.config = config;
    this.profitTracker = profitTracker;
    this.openTrades = new Map(); // Track open trades
  }

  async executeTradeBasedOnTarget(targetTx, market) {
    try {
      const tradeInfo = await this.analyzeTrade(targetTx);
      
      if (!tradeInfo) {
        logger.info('Not a relevant trade transaction');
        return;
      }

      const amount = this.calculateTradeAmount(
        tradeInfo.amount,
        tradeInfo.percentage
      );

      // Execute the trade and track entry
      if (tradeInfo.type === 'buy') {
        const entryPrice = await this.executeBuy(market, amount);
        this.openTrades.set(targetTx.signature, {
          type: 'buy',
          entryAmount: amount * entryPrice,
          entryPrice,
          timestamp: Date.now()
        });
      } else {
        const exitPrice = await this.executeSell(market, amount);
        // Find matching buy trade to calculate P/L
        const openTrade = this.findMatchingOpenTrade(amount);
        if (openTrade) {
          this.profitTracker.recordTrade({
            entryAmount: openTrade.entryAmount,
            exitAmount: amount * exitPrice,
            entryPrice: openTrade.entryPrice,
            exitPrice,
            holdingTime: Date.now() - openTrade.timestamp
          });
          this.openTrades.delete(openTrade.signature);
        }
      }

      logger.info(`Trade executed: ${tradeInfo.type} ${amount}`);
    } catch (error) {
      logger.error('Trade execution failed:', error);
    }
  }

  findMatchingOpenTrade(amount) {
    // Find the oldest matching open trade with similar amount
    for (const [signature, trade] of this.openTrades) {
      if (Math.abs(trade.amount - amount) / amount < 0.01) { // 1% tolerance
        return { ...trade, signature };
      }
    }
    return null;
  }

  // ... rest of the class implementation remains the same
}