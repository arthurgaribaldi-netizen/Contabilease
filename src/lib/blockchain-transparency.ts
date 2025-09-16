'use client';

// Interfaces para Blockchain e Transparência
export interface BlockchainTransaction {
  id: string;
  contractId: string;
  type: 'create' | 'update' | 'modify' | 'audit' | 'approve';
  timestamp: string;
  hash: string;
  previousHash: string;
  data: any;
  verified: boolean;
  blockNumber: number;
  gasUsed: number;
  transactionFee: number;
}

export interface AuditTrail {
  id: string;
  contractId: string;
  action: string;
  timestamp: string;
  userId: string;
  details: any;
  blockchainHash?: string;
  verified: boolean;
}

export interface BlockchainVerification {
  contractId: string;
  verificationStatus: 'verified' | 'pending' | 'failed';
  verificationDate: string;
  blockchainHash: string;
  auditTrail: AuditTrail[];
  integrityScore: number; // 0-100
  transparencyLevel: 'high' | 'medium' | 'low';
}

export interface ImmutableRecord {
  id: string;
  type: 'contract' | 'modification' | 'audit' | 'calculation';
  data: any;
  hash: string;
  timestamp: string;
  blockNumber: number;
  verified: boolean;
}

// Classe principal de Blockchain e Transparência
export class BlockchainTransparencyEngine {
  private transactions: BlockchainTransaction[] = [];
  private auditTrails: AuditTrail[] = [];
  private immutableRecords: ImmutableRecord[] = [];
  private currentBlockNumber = 1;

  constructor() {
    this.initializeGenesisBlock();
  }

  // Inicializar bloco gênese
  private initializeGenesisBlock(): void {
    const genesisTransaction: BlockchainTransaction = {
      id: 'genesis-0001',
      contractId: 'genesis',
      type: 'create',
      timestamp: new Date().toISOString(),
      hash: '0000000000000000000000000000000000000000000000000000000000000000',
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      data: { message: 'Genesis block for Contabilease blockchain' },
      verified: true,
      blockNumber: 0,
      gasUsed: 0,
      transactionFee: 0,
    };

    this.transactions.push(genesisTransaction);
  }

  // Gerar hash SHA-256
  private generateHash(data: any): string {
    // Em produção, isso seria uma implementação real de SHA-256
    const dataString = JSON.stringify(data);
    let hash = 0;

    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16).padStart(8, '0').repeat(8);
  }

  // Criar transação blockchain
  createTransaction(
    contractId: string,
    type: 'create' | 'update' | 'modify' | 'audit' | 'approve',
    data: any,
    userId: string
  ): BlockchainTransaction {
    const previousTransaction = this.transactions[this.transactions.length - 1];
    const previousHash = previousTransaction
      ? previousTransaction.hash
      : '0000000000000000000000000000000000000000000000000000000000000000';

    const transactionData = {
      contractId,
      type,
      data,
      userId,
      timestamp: new Date().toISOString(),
      previousHash,
    };

    const hash = this.generateHash(transactionData);

    const transaction: BlockchainTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      contractId,
      type,
      timestamp: transactionData.timestamp,
      hash,
      previousHash,
      data: transactionData,
      verified: true,
      blockNumber: this.currentBlockNumber,
      gasUsed: this.calculateGasUsed(type),
      transactionFee: this.calculateTransactionFee(type),
    };

    this.transactions.push(transaction);
    this.currentBlockNumber++;

    return transaction;
  }

  // Calcular gas usado
  private calculateGasUsed(type: string): number {
    const gasMap = {
      create: 21000,
      update: 15000,
      modify: 18000,
      audit: 12000,
      approve: 10000,
    };

    return gasMap[type as keyof typeof gasMap] || 10000;
  }

  // Calcular taxa de transação
  private calculateTransactionFee(type: string): number {
    const gasUsed = this.calculateGasUsed(type);
    const gasPrice = 20; // Gwei
    return (gasUsed * gasPrice) / 1000000000; // Convert to ETH
  }

  // Registrar auditoria
  recordAudit(contractId: string, action: string, userId: string, details: any): AuditTrail {
    const auditTrail: AuditTrail = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      contractId,
      action,
      timestamp: new Date().toISOString(),
      userId,
      details,
      verified: false,
    };

    // Criar transação blockchain para auditoria
    const transaction = this.createTransaction(
      contractId,
      'audit',
      {
        action,
        userId,
        details,
      },
      userId
    );

    auditTrail.blockchainHash = transaction.hash;
    auditTrail.verified = true;

    this.auditTrails.push(auditTrail);
    return auditTrail;
  }

  // Criar registro imutável
  createImmutableRecord(
    type: 'contract' | 'modification' | 'audit' | 'calculation',
    data: any
  ): ImmutableRecord {
    const recordData = {
      type,
      data,
      timestamp: new Date().toISOString(),
      blockNumber: this.currentBlockNumber,
    };

    const hash = this.generateHash(recordData);

    const record: ImmutableRecord = {
      id: `record-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type,
      data: recordData,
      hash,
      timestamp: recordData.timestamp,
      blockNumber: this.currentBlockNumber,
      verified: true,
    };

    this.immutableRecords.push(record);
    return record;
  }

  // Verificar integridade de contrato
  verifyContractIntegrity(contractId: string): BlockchainVerification {
    const contractTransactions = this.transactions.filter(tx => tx.contractId === contractId);
    const contractAuditTrails = this.auditTrails.filter(audit => audit.contractId === contractId);

    let integrityScore = 100;
    let verificationStatus: 'verified' | 'pending' | 'failed' = 'verified';

    // Verificar se todas as transações estão verificadas
    const unverifiedTransactions = contractTransactions.filter(tx => !tx.verified);
    if (unverifiedTransactions.length > 0) {
      integrityScore -= unverifiedTransactions.length * 10;
      verificationStatus = 'pending';
    }

    // Verificar integridade da cadeia
    for (let i = 1; i < contractTransactions.length; i++) {
      const current = contractTransactions[i];
      const previous = contractTransactions[i - 1];

      if (current.previousHash !== previous.hash) {
        integrityScore -= 20;
        verificationStatus = 'failed';
      }
    }

    // Calcular nível de transparência
    let transparencyLevel: 'high' | 'medium' | 'low' = 'low';
    if (contractAuditTrails.length >= 5 && integrityScore >= 90) {
      transparencyLevel = 'high';
    } else if (contractAuditTrails.length >= 3 && integrityScore >= 70) {
      transparencyLevel = 'medium';
    }

    const latestTransaction = contractTransactions[contractTransactions.length - 1];

    return {
      contractId,
      verificationStatus,
      verificationDate: latestTransaction ? latestTransaction.timestamp : new Date().toISOString(),
      blockchainHash: latestTransaction ? latestTransaction.hash : '',
      auditTrail: contractAuditTrails,
      integrityScore: Math.max(0, integrityScore),
      transparencyLevel,
    };
  }

  // Obter histórico completo de um contrato
  getContractHistory(contractId: string): {
    transactions: BlockchainTransaction[];
    auditTrails: AuditTrail[];
    immutableRecords: ImmutableRecord[];
  } {
    return {
      transactions: this.transactions.filter(tx => tx.contractId === contractId),
      auditTrails: this.auditTrails.filter(audit => audit.contractId === contractId),
      immutableRecords: this.immutableRecords.filter(
        record => record.data.contractId === contractId
      ),
    };
  }

  // Verificar autenticidade de dados
  verifyDataAuthenticity(data: any, hash: string): boolean {
    const calculatedHash = this.generateHash(data);
    return calculatedHash === hash;
  }

  // Obter estatísticas da blockchain
  getBlockchainStats(): {
    totalTransactions: number;
    totalBlocks: number;
    totalAuditTrails: number;
    totalImmutableRecords: number;
    averageGasUsed: number;
    totalTransactionFees: number;
    verificationRate: number;
  } {
    const totalTransactions = this.transactions.length;
    const verifiedTransactions = this.transactions.filter(tx => tx.verified).length;
    const totalGasUsed = this.transactions.reduce((sum, tx) => sum + tx.gasUsed, 0);
    const totalFees = this.transactions.reduce((sum, tx) => sum + tx.transactionFee, 0);

    return {
      totalTransactions,
      totalBlocks: this.currentBlockNumber,
      totalAuditTrails: this.auditTrails.length,
      totalImmutableRecords: this.immutableRecords.length,
      averageGasUsed: totalTransactions > 0 ? totalGasUsed / totalTransactions : 0,
      totalTransactionFees: totalFees,
      verificationRate:
        totalTransactions > 0 ? (verifiedTransactions / totalTransactions) * 100 : 0,
    };
  }

  // Criar snapshot da blockchain
  createBlockchainSnapshot(): {
    transactions: BlockchainTransaction[];
    auditTrails: AuditTrail[];
    immutableRecords: ImmutableRecord[];
    timestamp: string;
    blockNumber: number;
  } {
    return {
      transactions: [...this.transactions],
      auditTrails: [...this.auditTrails],
      immutableRecords: [...this.immutableRecords],
      timestamp: new Date().toISOString(),
      blockNumber: this.currentBlockNumber,
    };
  }

  // Restaurar snapshot da blockchain
  restoreBlockchainSnapshot(snapshot: any): void {
    this.transactions = snapshot.transactions || [];
    this.auditTrails = snapshot.auditTrails || [];
    this.immutableRecords = snapshot.immutableRecords || [];
    this.currentBlockNumber = snapshot.blockNumber || 1;
  }

  // Obter transações por tipo
  getTransactionsByType(type: string): BlockchainTransaction[] {
    return this.transactions.filter(tx => tx.type === type);
  }

  // Obter transações por período
  getTransactionsByPeriod(startDate: string, endDate: string): BlockchainTransaction[] {
    return this.transactions.filter(tx => tx.timestamp >= startDate && tx.timestamp <= endDate);
  }

  // Verificar se contrato está na blockchain
  isContractOnBlockchain(contractId: string): boolean {
    return this.transactions.some(tx => tx.contractId === contractId);
  }

  // Obter último hash de um contrato
  getLastContractHash(contractId: string): string | null {
    const contractTransactions = this.transactions
      .filter(tx => tx.contractId === contractId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return contractTransactions.length > 0 ? contractTransactions[0].hash : null;
  }
}

// Instância global do engine blockchain
export const blockchainTransparencyEngine = new BlockchainTransparencyEngine();

// Hook para usar blockchain e transparência
export function useBlockchainTransparency() {
  const engine = blockchainTransparencyEngine;

  const createTransaction = (
    contractId: string,
    type: 'create' | 'update' | 'modify' | 'audit' | 'approve',
    data: any,
    userId: string
  ) => {
    return engine.createTransaction(contractId, type, data, userId);
  };

  const recordAudit = (contractId: string, action: string, userId: string, details: any) => {
    return engine.recordAudit(contractId, action, userId, details);
  };

  const createImmutableRecord = (
    type: 'contract' | 'modification' | 'audit' | 'calculation',
    data: any
  ) => {
    return engine.createImmutableRecord(type, data);
  };

  const verifyContractIntegrity = (contractId: string) => {
    return engine.verifyContractIntegrity(contractId);
  };

  const getContractHistory = (contractId: string) => {
    return engine.getContractHistory(contractId);
  };

  const getBlockchainStats = () => {
    return engine.getBlockchainStats();
  };

  const verifyDataAuthenticity = (data: any, hash: string) => {
    return engine.verifyDataAuthenticity(data, hash);
  };

  return {
    createTransaction,
    recordAudit,
    createImmutableRecord,
    verifyContractIntegrity,
    getContractHistory,
    getBlockchainStats,
    verifyDataAuthenticity,
    engine,
  };
}
