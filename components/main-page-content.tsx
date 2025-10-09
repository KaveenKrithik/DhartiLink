'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MapHologramSection from "@/components/map-hologram-section"
import { WalletConnect } from "@/components/wallet-connect"
import { LandVerification } from "@/components/land-verification"
import { LandMarketplace } from "@/components/land-marketplace"
import { ClientOnly } from "@/components/client-only"
import TitleTransition from "@/components/title-transition"
import { Wallet, Shield, ShoppingCart, Map } from "lucide-react"
import { useSoundManager } from "@/components/sound-manager"

export default function MainPageContent() {
  const { playTabSwitch, playCardHover } = useSoundManager()

  return (
    <main className="min-h-screen bg-black">
      <header className="relative overflow-hidden">
        <div className="holo-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="flex flex-col items-start gap-6">
            <p className="text-xs tracking-[0.35em] text-accent-foreground/80">INTRODUCING</p>
            <div className="relative">
              <TitleTransition />
            </div>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              Instant ownership verification, transparent transfers, and open digital bidding—powered by blockchain,
              geospatial mapping, and digitized records for India's land economy.
            </p>
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="glass holo-border" onMouseEnter={playCardHover}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary">On-chain Proofs</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Document digests and ownership events anchored on-chain.
                </CardContent>
              </Card>
              <Card className="glass holo-border" onMouseEnter={playCardHover}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary">Geo-Linked Records</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Parcels, lineage, and encumbrances mapped to authoritative geometry.
                </CardContent>
              </Card>
              <Card className="glass holo-border" onMouseEnter={playCardHover}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary">Open Bidding</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Transparent auctions with settlement finality.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger 
              value="wallet" 
              className="flex items-center gap-2"
              onMouseEnter={playTabSwitch}
            >
              <Wallet className="h-4 w-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger 
              value="verification" 
              className="flex items-center gap-2"
              onMouseEnter={playTabSwitch}
            >
              <Shield className="h-4 w-4" />
              Verification
            </TabsTrigger>
            <TabsTrigger 
              value="marketplace" 
              className="flex items-center gap-2"
              onMouseEnter={playTabSwitch}
            >
              <ShoppingCart className="h-4 w-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger 
              value="map" 
              className="flex items-center gap-2"
              onMouseEnter={playTabSwitch}
            >
              <Map className="h-4 w-4" />
              Map
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="wallet" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <ClientOnly fallback={
                <Card className="glass holo-border">
                  <CardHeader>
                    <CardTitle>Loading Wallet...</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Initializing wallet connection...</p>
                  </CardContent>
                </Card>
              }>
                <WalletConnect />
              </ClientOnly>
              <Card className="glass holo-border" onMouseEnter={playCardHover}>
                <CardHeader>
                  <CardTitle>Wallet Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p>• Connect MetaMask wallet</p>
                    <p>• View account balance and details</p>
                    <p>• Send ETH transactions</p>
                    <p>• Sign messages for verification</p>
                    <p>• Switch between networks</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="verification" className="mt-6">
            <ClientOnly fallback={
              <Card className="glass holo-border">
                <CardHeader>
                  <CardTitle>Loading Verification...</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Initializing land verification...</p>
                </CardContent>
              </Card>
            }>
              <LandVerification />
            </ClientOnly>
          </TabsContent>
          
          <TabsContent value="marketplace" className="mt-6">
            <ClientOnly fallback={
              <Card className="glass holo-border">
                <CardHeader>
                  <CardTitle>Loading Marketplace...</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Initializing marketplace...</p>
                </CardContent>
              </Card>
            }>
              <LandMarketplace />
            </ClientOnly>
          </TabsContent>
          
          <TabsContent value="map" className="mt-6">
            <MapHologramSection />
          </TabsContent>
        </Tabs>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-xs text-muted-foreground">
        Prototype UI preview. Data shown is dummy and for demonstration only.
      </footer>
    </main>
  )
}
