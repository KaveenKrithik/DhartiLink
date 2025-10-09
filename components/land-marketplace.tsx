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
    {
      id: 'LAND004',
      title: 'Beachfront Parcel - Coastal Zone',
      description: 'Scenic beachfront land suitable for eco-resorts with clear access roads and utilities nearby.',
      price: '6.7',
      area: '3.1 acres',
      location: 'Goa, India',
      seller: '0xa1b2c3d4e5f678901234567890abcdefABCDEF01',
      sellerName: 'Sanjay Mehta',
      listedDate: '2024-02-01',
    },
    {
      id: 'LAND005',
      title: 'Industrial Plot - Logistics Hub',
      description: 'Flat industrial plot with wide road access, ideal for warehousing and logistics operations.',
      price: '3.9',
      area: '2.0 acres',
      location: 'Nagpur, India',
      seller: '0xb2c3d4e5f6a778901234567890abcdefABCDEF02',
      sellerName: 'Anita Desai',
      listedDate: '2024-02-05',
    },
    {
      id: 'LAND006',
      title: 'Hillside Residential Plot',
      description: 'Gently sloped plot with panoramic views, suitable for premium villas and low-density housing.',
      price: '2.2',
      area: '0.9 acres',
      location: 'Pune, India',
      seller: '0xc3d4e5f6a7b88901234567890abcdefABCDEF03',
      sellerName: 'Neha Verma',
      listedDate: '2024-02-10',
    },
    {
      id: 'LAND007',
      title: 'Farmland with Borewell',
      description: 'Cultivated farmland with functioning borewell and fencing, ready for immediate use.',
      price: '1.4',
      area: '1.8 acres',
      location: 'Nashik, India',
      seller: '0xd4e5f6a7b8c9901234567890abcdefABCDEF040',
      sellerName: 'Vikas Singh',
      listedDate: '2024-02-12',
    },
    {
      id: 'LAND008',
      title: 'City Center Commercial Corner',
      description: 'Corner plot with high footfall, perfect for retail or mixed-use development.',
      price: '8.3',
      area: '0.6 acres',
      location: 'Ahmedabad, India',
      seller: '0xe5f6a7b8c9d001234567890abcdefABCDEF0412',
      sellerName: 'Dhruv Shah',
      listedDate: '2024-02-14',
    },
    {
      id: 'LAND009',
      title: 'Riverside Agricultural Parcel',
      description: 'Fertile riverside land with seasonal irrigation benefits, suitable for horticulture.',
      price: '2.9',
      area: '3.4 acres',
      location: 'Patna, India',
      seller: '0xf6a7b8c9d0e101234567890abcdefABCDEF0413',
      sellerName: 'Rohit Kumar',
      listedDate: '2024-02-18',
    },
    {
      id: 'LAND010',
      title: 'IT Park Adjacent Plot',
      description: 'Plot located adjacent to a major IT park, suitable for co-working or residential rentals.',
      price: '4.6',
      area: '0.95 acres',
      location: 'Hyderabad, India',
      seller: '0x07b8c9d0e1f201234567890abcdefABCDEF0414',
      sellerName: 'Kiran Reddy',
      listedDate: '2024-02-20',
    },
    {
      id: 'LAND011',
      title: 'Educational Zone Plot',
      description: 'Rectangular plot earmarked for institutional use, surrounded by schools and colleges.',
      price: '3.1',
      area: '1.5 acres',
      location: 'Chandigarh, India',
      seller: '0x18c9d0e1f2a301234567890abcdefABCDEF0415',
      sellerName: 'Harpreet Singh',
      listedDate: '2024-02-22',
    },
    {
      id: 'LAND012',
      title: 'Lakeview Residential Parcel',
      description: 'Premium residential plot with serene lake views and paved internal roads.',
      price: '5.0',
      area: '1.1 acres',
      location: 'Udaipur, India',
      seller: '0x29d0e1f2a3b401234567890abcdefABCDEF0416',
      sellerName: 'Pooja Jain',
      listedDate: '2024-02-25',
    },
    {
      id: 'LAND013',
      title: 'Airport Logistics Plot',
      description: 'Strategically located near airport cargo terminals; ideal for logistics and cold chain.',
      price: '7.4',
      area: '2.3 acres',
      location: 'Kolkata, India',
      seller: '0x3ad1e2f3a4b501234567890abcdefABCDEF0417',
      sellerName: 'Arjun Das',
      listedDate: '2024-03-01',
    },
    {
      id: 'LAND014',
      title: 'Vineyard-ready Farmland',
      description: 'South-facing gentle slope with rich soil composition, suitable for vineyards.',
      price: '3.6',
      area: '2.7 acres',
      location: 'Bengaluru Rural, India',
      seller: '0x4be2f3a4b5c601234567890abcdefABCDEF0418',
      sellerName: 'Meera Nair',
      listedDate: '2024-03-03',
    },
    {
      id: 'LAND015',
      title: 'SEZ Adjacent Commercial Plot',
      description: 'Near a Special Economic Zone with excellent access to highways and utilities.',
      price: '6.1',
      area: '1.9 acres',
      location: 'Surat, India',
      seller: '0x5cf3a4b5c6d701234567890abcdefABCDEF0419',
      sellerName: 'Nilesh Patel',
      listedDate: '2024-03-05',
    },
    {
      id: 'LAND016',
      title: 'Urban Infill Residential Plot',
      description: 'Vacant infill site within established neighborhood; all municipal services available.',
      price: '2.0',
      area: '0.5 acres',
      location: 'Jaipur, India',
      seller: '0x6d04b5c6d7e801234567890abcdefABCDEF0420',
      sellerName: 'Rakesh Gupta',
      listedDate: '2024-03-08',
    },
    {
      id: 'LAND017',
      title: 'Tourism Zone Coastal Plot',
      description: 'Coastal belt plot approved for tourism-related development and homestays.',
      price: '4.9',
      area: '1.4 acres',
      location: 'Puducherry, India',
      seller: '0x7e15c6d7e8f901234567890abcdefABCDEF0421',
      sellerName: 'Anand Iyer',
      listedDate: '2024-03-10',
    },
    {
      id: 'LAND018',
      title: 'Organic Farm Parcel',
      description: 'Previously certified organic fields with drip irrigation and boundary trees.',
      price: '2.7',
      area: '3.0 acres',
      location: 'Coimbatore, India',
      seller: '0x8f26d7e8f901a1234567890abcdefABCDEF0422',
      sellerName: 'Suresh Babu',
      listedDate: '2024-03-12',
    },
    {
      id: 'LAND019',
      title: 'High Street Retail Plot',
      description: 'Prime high-street location with strong retail demand and parking access.',
      price: '9.0',
      area: '0.4 acres',
      location: 'Lucknow, India',
      seller: '0x9a37e8f901a2b134567890abcdefABCDEF0423',
      sellerName: 'Tanya Malik',
      listedDate: '2024-03-15',
    },
    {
      id: 'LAND020',
      title: 'Wind Corridor Farmland',
      description: 'Open, elevated farmland in a wind corridor; potential for agri-energy pilots.',
      price: '1.9',
      area: '4.1 acres',
      location: 'Kurnool, India',
      seller: '0xab48f901a2b3c24567890abcdefABCDEF0424',
      sellerName: 'Prakash Rao',
      listedDate: '2024-03-18',
    },
    {
      id: 'LAND021',
      title: 'Ring Road Commercial Plot',
      description: 'Excellent frontage on ring road, suitable for fuel station or QSR cluster.',
      price: '5.8',
      area: '0.8 acres',
      location: 'Bhopal, India',
      seller: '0xbc5901a2b3c4d3567890abcdefABCDEF0425',
      sellerName: 'Shalini Joshi',
      listedDate: '2024-03-20',
    },
    {
      id: 'LAND022',
      title: 'Beach Access Residential Plot',
      description: 'Residential plot with shared private beach access and club amenities.',
      price: '7.1',
      area: '0.7 acres',
      location: 'Alibaug, India',
      seller: '0xcd6a12b3c4d5e467890abcdefABCDEF0426',
      sellerName: 'Ritika Kapoor',
      listedDate: '2024-03-23',
    },
    {
      id: 'LAND023',
      title: 'Temple Town Mixed-use Plot',
      description: 'Walking distance to major temple complex; suitable for hotels and retail.',
      price: '4.2',
      area: '1.0 acres',
      location: 'Madurai, India',
      seller: '0xde7b23c4d5e6f57890abcdefABCDEF0427',
      sellerName: 'Harini Subramanian',
      listedDate: '2024-03-25',
    },
    {
      id: 'LAND024',
      title: 'Greenfield Residential Township Plot',
      description: 'Part of a planned township with parks, schools, and transit links.',
      price: '3.3',
      area: '1.3 acres',
      location: 'Noida, India',
      seller: '0xef8c34d5e6f607890abcdefABCDEF0428',
      sellerName: 'Aakash Yadav',
      listedDate: '2024-03-28',
    },
    {
      id: 'LAND025',
      title: 'Forest Edge Eco-Plot',
      description: 'Forest-adjacent plot ideal for eco-lodges; low-density development preferred.',
      price: '2.4',
      area: '2.2 acres',
      location: 'Dehradun, India',
      seller: '0xf09d45e6f6071890abcdefABCDEF0429',
      sellerName: 'Kabir Thakur',
      listedDate: '2024-04-02',
    },
    {
      id: 'LAND026',
      title: 'Harbor Adjacent Commercial Land',
      description: 'Located near a busy harbor; suitable for marine trade support services.',
      price: '6.9',
      area: '1.6 acres',
      location: 'Visakhapatnam, India',
      seller: '0x01ae56f6071890abCDEF0429abcdefABCDEF0430',
      sellerName: 'Naveen Kumar',
      listedDate: '2024-04-05',
    },
    {
      id: 'LAND027',
      title: 'Agri-Processing Cluster Plot',
      description: 'Zoned for food processing units with proximity to produce markets.',
      price: '3.7',
      area: '2.8 acres',
      location: 'Indore, India',
      seller: '0x12bf67f71890abCDEF0429abcdefABCDEF0431',
      sellerName: 'Swati Choudhary',
      listedDate: '2024-04-07',
    },
    {
      id: 'LAND028',
      title: 'Desert-Edge Solar Ready Plot',
      description: 'High irradiance zone with grid connectivity nearby; solar pilot potential.',
      price: '4.4',
      area: '5.0 acres',
      location: 'Jaisalmer, India',
      seller: '0x23c078190abCDEF0429abcdefABCDEF0432abcd',
      sellerName: 'Imran Khan',
      listedDate: '2024-04-10',
    },
    {
      id: 'LAND029',
      title: 'Riverfront Mixed-use Parcel',
      description: 'Prime riverfront with promenade access; hospitality and retail potential.',
      price: '8.8',
      area: '1.1 acres',
      location: 'Varanasi, India',
      seller: '0x34d1890abCDEF0429abcdefABCDEF0432abcd12',
      sellerName: 'Shivam Pandey',
      listedDate: '2024-04-12',
    },
    {
      id: 'LAND030',
      title: 'Metro Station Adjacent Plot',
      description: 'Corner plot immediately adjacent to metro station; ideal for high-density mixed use.',
      price: '9.5',
      area: '0.9 acres',
      location: 'Gurugram, India',
      seller: '0x45e290abCDEF0429abcdefABCDEF0432abcd1234',
      sellerName: 'Ananya Sharma',
      listedDate: '2024-04-15',
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
