'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Transaction {
  id: string
  type: 'purchase' | 'transfer' | 'receive'
  landId?: string
  landTitle?: string
  amount: string
  currency: 'ERS' | 'ETH'
  from: string
  to: string
  timestamp: number
  txHash?: string
  status: 'pending' | 'completed' | 'failed'
  etherscanUrl?: string
}

interface TransactionHistoryContextType {
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void
  updateTransactionStatus: (txId: string, status: Transaction['status'], txHash?: string) => void
  getTransactionsByLand: (landId: string) => Transaction[]
  clearHistory: () => void
}

const TransactionHistoryContext = createContext<TransactionHistoryContextType | undefined>(undefined)

export function TransactionHistoryProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('transactionHistory')
      if (stored) {
        try {
          setTransactions(JSON.parse(stored))
        } catch (error) {
          console.error('Error loading transaction history:', error)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage whenever transactions change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('transactionHistory', JSON.stringify(transactions))
    }
  }, [transactions, isLoaded])

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }
    setTransactions(prev => [newTransaction, ...prev]) // Most recent first
  }

  const updateTransactionStatus = (txId: string, status: Transaction['status'], txHash?: string) => {
    setTransactions(prev =>
      prev.map(tx =>
        tx.id === txId
          ? {
              ...tx,
              status,
              ...(txHash && { txHash, etherscanUrl: `https://sepolia.etherscan.io/tx/${txHash}` }),
            }
          : tx
      )
    )
  }

  const getTransactionsByLand = (landId: string) => {
    return transactions.filter(tx => tx.landId === landId)
  }

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all transaction history?')) {
      setTransactions([])
      localStorage.removeItem('transactionHistory')
    }
  }

  return (
    <TransactionHistoryContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransactionStatus,
        getTransactionsByLand,
        clearHistory,
      }}
    >
      {children}
    </TransactionHistoryContext.Provider>
  )
}

export function useTransactionHistory() {
  const context = useContext(TransactionHistoryContext)
  if (context === undefined) {
    throw new Error('useTransactionHistory must be used within a TransactionHistoryProvider')
  }
  return context
}

