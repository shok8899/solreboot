import { Connection, PublicKey } from '@solana/web3.js';
import { logger } from '../utils/logger.js';

export class WalletMonitor {
  constructor(connection, walletAddresses) {
    this.connection = connection;
    this.walletAddresses = walletAddresses.map(addr => new PublicKey(addr));
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  async startMonitoring() {
    this.subscription = this.connection.onLogs(
      'all',
      (logs) => {
        this.handleTransaction(logs);
      },
      'processed'
    );

    logger.info('Started monitoring wallet addresses');
  }

  async handleTransaction(logs) {
    try {
      const signature = logs.signature;
      const tx = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0
      });

      if (!tx) return;

      const isRelevantTransaction = this.walletAddresses.some(
        addr => tx.transaction.message.accountKeys.some(
          key => key.equals(addr)
        )
      );

      if (isRelevantTransaction) {
        this.subscribers.forEach(callback => callback(tx));
      }
    } catch (error) {
      logger.error('Error handling transaction:', error);
    }
  }

  stop() {
    if (this.subscription) {
      this.connection.removeOnLogsListener(this.subscription);
      logger.info('Stopped monitoring wallet addresses');
    }
  }
}