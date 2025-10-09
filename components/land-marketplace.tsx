'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaymentModal } from '@/components/payment-modal'
import { MapPin, DollarSign, Calendar, User } from 'lucide-react'

interface LandListing {
  id: string
  title: string
  description: string
  price: string
  area: string
  location: string
  seller: string
  sellerName: string
  listedDate: string
  imageUrl?: string
}

export function LandMarketplace() {
  const [listings] = useState<LandListing[]>([
    {
      id: 'LAND001',
      title: 'Agricultural Plot - Sector 12',
      description: 'Prime agricultural land with excellent soil quality and irrigation facilities. Perfect for farming or development.',
      price: '2.5',
      area: '2.5 acres',
      location: 'Delhi, India',
      seller: '0x742d35Cc6634C0532925a3b8D0C4C4C4C4C4C4C4',
      sellerName: 'Rajesh Kumar',
      listedDate: '2024-01-15',
    },
    {
      id: 'LAND002',
      title: 'Residential Plot - Block A',
      description: 'Well-located residential plot in a developing area with good connectivity and amenities nearby.',
      price: '1.8',
      area: '0.75 acres',
      location: 'Mumbai, India',
      seller: '0x8ba1f109551bD432803012645Hac136c4c4c4c4c4',
      sellerName: 'Priya Sharma',
      listedDate: '2024-01-20',
    },
    {
      id: 'LAND003',
      title: 'Commercial Land - Business District',
      description: 'Strategic commercial land in the heart of the business district. Ideal for office buildings or retail.',
      price: '5.2',
      area: '1.2 acres',
      location: 'Bangalore, India',
      seller: '0x3f5CE1FBfC3A751A537B9D4B3B7C4C4C4C4C4C4C4',
      sellerName: 'Amit Patel',
      listedDate: '2024-01-25',
    },
  ])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Land Marketplace</h2>
        <p className="text-muted-foreground">
          Discover and purchase verified land properties on the blockchain
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Card key={listing.id} className="glass holo-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{listing.title}</CardTitle>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  For Sale
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {listing.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">{listing.price} ETH</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{listing.sellerName}</span>
                  <span className="text-xs font-mono">({formatAddress(listing.seller)})</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Listed: {formatDate(listing.listedDate)}</span>
                </div>
              </div>

              <div className="pt-2">
                <PaymentModal
                  landId={listing.id}
                  landTitle={listing.title}
                  price={listing.price}
                  sellerAddress={listing.seller}
                >
                  <Button className="w-full">
                    Purchase Land
                  </Button>
                </PaymentModal>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {listings.length === 0 && (
        <Card className="glass holo-border">
          <CardContent className="py-12 text-center">
            <div className="space-y-2">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">No Land Listings Available</h3>
              <p className="text-muted-foreground">
                Check back later for new land properties
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
