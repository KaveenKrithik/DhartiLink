'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, ArrowRight, User, CheckCircle2 } from 'lucide-react'
import { usePurchasedLands } from '@/contexts/purchased-lands-context'
import { useWalletContext } from '@/contexts/wallet-context'
import { useTransactionHistory } from '@/contexts/transaction-history-context'
import { useSoundManager } from '@/components/sound-manager'

export default function PortfolioMapSection() {
  const { purchasedLands } = usePurchasedLands()
  const { account } = useWalletContext()
  const { getTransactionsByLand } = useTransactionHistory()
  const { playButtonClick, playCardHover } = useSoundManager()

  const handleLandClick = (landId: string) => {
    playButtonClick()
    // Simple click handler without map functionality
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass holo-border" onMouseEnter={playCardHover}>
          <CardHeader>
            <CardTitle className="text-blue-50">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-50">{purchasedLands.length}</div>
            <p className="text-sm text-gray-400">Land parcels owned</p>
          </CardContent>
        </Card>
        
        <Card className="glass holo-border" onMouseEnter={playCardHover}>
          <CardHeader>
            <CardTitle className="text-blue-50">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-50">₹{purchasedLands.length * 100000}</div>
            <p className="text-sm text-gray-400">Current market value</p>
          </CardContent>
        </Card>
        
        <Card className="glass holo-border" onMouseEnter={playCardHover}>
          <CardHeader>
            <CardTitle className="text-blue-50">Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+₹{purchasedLands.length * 100000}</div>
            <p className="text-sm text-gray-400">100% profit (Free acquisition!)</p>
          </CardContent>
        </Card>
      </div>

      {/* Your Properties List */}
      <Card className="glass holo-border">
        <CardHeader>
          <CardTitle className="text-blue-50">Your Properties</CardTitle>
        </CardHeader>
        <CardContent>
          {purchasedLands.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No properties in your portfolio yet</p>
              <p className="text-sm text-gray-500">Start by purchasing land from the marketplace</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {purchasedLands.map((land, index) => {
                const landTransactions = getTransactionsByLand(land.id)
                const purchaseTransaction = landTransactions.find(tx => tx.type === 'purchase')
                
                return (
                  <div 
                    key={land.id} 
                    className="p-4 bg-gray-900/30 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer"
                    onClick={() => handleLandClick(land.id)}
                    onMouseEnter={playCardHover}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-blue-50 font-semibold text-sm">{land.title}</h4>
                      <Badge className="bg-green-600 text-xs flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Owned
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{land.description}</p>
                    
                    <p className="text-xs text-gray-500 mb-2">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {land.area} • {land.location}
                    </p>
                    
                    <p className="text-xs text-gray-500 mb-3">
                      Land ID: {land.id}
                    </p>
                    
                    {/* Ownership Transfer Display */}
                    <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-400 font-medium">Ownership Transfer</span>
                        <span className="text-green-400 text-[10px]">✓ Verified</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {/* Previous Owner (Seller) */}
                        <div className="flex-1 bg-gray-800/50 rounded px-2 py-1.5 border border-gray-700/50">
                          <div className="flex items-center gap-1 mb-0.5">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-[10px] text-gray-500 uppercase">Previous Owner</span>
                          </div>
                          <div className="font-mono text-[11px] text-gray-300">
                            {land.seller ? `${land.seller.slice(0, 6)}...${land.seller.slice(-4)}` : land.sellerName}
                          </div>
                        </div>
                        
                        {/* Arrow */}
                        <ArrowRight className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        
                        {/* Current Owner (You) */}
                        <div className="flex-1 bg-green-900/30 rounded px-2 py-1.5 border border-green-700/50">
                          <div className="flex items-center gap-1 mb-0.5">
                            <User className="h-3 w-3 text-green-400" />
                            <span className="text-[10px] text-green-500 uppercase">Current Owner</span>
                          </div>
                          <div className="font-mono text-[11px] text-green-300 font-semibold">
                            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'You'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Purchase Details */}
                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-gray-800">
                        <span>Purchased: {land.purchaseDate}</span>
                        <span className="text-blue-400">{land.price} ERS</span>
                      </div>
                      
                      {/* Transaction Hash if available */}
                      {purchaseTransaction?.txHash && (
                        <div className="mt-2 pt-2 border-t border-gray-800">
                          <a 
                            href={purchaseTransaction.etherscanUrl || `https://sepolia.etherscan.io/tx/${purchaseTransaction.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Transaction on Etherscan
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLandClick(land.id)
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
