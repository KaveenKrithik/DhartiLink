'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Search } from 'lucide-react'
import { useSoundManager } from '@/components/sound-manager'
import dynamic from 'next/dynamic'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyCVzTgaYCdrtau2c8WkVQSJjaruwjqDu1k"

declare global {
  interface Window {
    __gmapsPromise?: Promise<any>
    google?: any
    __gmapsInit?: () => void
  }
}

function loadGoogleMaps(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("Not in browser"))
  if (window.google?.maps) return Promise.resolve(window.google.maps)
  if (window.__gmapsPromise) return window.__gmapsPromise

  // Check if API key is available
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error("Google Maps API key not configured"))
  }

  window.__gmapsPromise = new Promise((resolve, reject) => {
    const id = "google-maps-js-portfolio"
    if (document.getElementById(id)) {
      const check = () => (window.google?.maps ? resolve(window.google.maps) : setTimeout(check, 50))
      return check()
    }
    const script = document.createElement("script")
    script.id = id
    script.async = true
    script.defer = true
    script.crossOrigin = "anonymous"
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly&libraries=places,geometry&callback=__gmapsInit`
    window.__gmapsInit = () => resolve(window.google.maps)
    script.onerror = () => reject(new Error("Failed to load Google Maps JS API"))
    document.head.appendChild(script)
  })

  return window.__gmapsPromise
}

export default function PortfolioMap() {
  const { playMapSearch, playButtonClick } = useSoundManager()
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [hasQuery, setHasQuery] = useState(false)
  const [query, setQuery] = useState<string>("")
  const [searchError, setSearchError] = useState<string | null>(null)
  const [mapsError, setMapsError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  
  const FancyGlobe = dynamic(() => import('./fancy-globe'), { ssr: false })

  // Listen for portfolio land search events
  useEffect(() => {
    const handlePortfolioLandSearch = async (event: CustomEvent) => {
      const { location, title } = event.detail
      setQuery(location)
      setHasQuery(true)
      playMapSearch()
      
      // Trigger the search programmatically
      try {
        const maps = await loadGoogleMaps()
        const geocoder = new maps.Geocoder()
        const resp = await geocoder.geocode({ address: location })
        const best = resp?.results?.[0]
        if (best?.geometry?.location) {
          const loc = best.geometry.location
          // Initialize map if not already done
          if (!mapRef.current && containerRef.current) {
            const map = new maps.Map(containerRef.current, {
              center: { lat: loc.lat(), lng: loc.lng() },
              zoom: 15,
              mapTypeId: maps.MapTypeId.SATELLITE,
              styles: [
                { elementType: "geometry", stylers: [{ color: "#0b0f14" }] },
                { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#8ea2ad" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f14" }] },
                { featureType: "poi", stylers: [{ visibility: "off" }] },
                { featureType: "transit", stylers: [{ visibility: "off" }] },
                { featureType: "road", elementType: "geometry", stylers: [{ color: "#141a22" }] },
                { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
                { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1621" }] },
              ],
            })
            mapRef.current = map
            setMapReady(true)
          }
        }
      } catch (geoErr) {
        console.warn("[v0] Portfolio geocoding failed:", (geoErr as Error).message)
        setHasQuery(false)
        setQuery("")
      }
    }

    window.addEventListener('portfolioLandSearch', handlePortfolioLandSearch as EventListener)
    
    return () => {
      window.removeEventListener('portfolioLandSearch', handlePortfolioLandSearch as EventListener)
    }
  }, [playMapSearch])

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault?.()
    playMapSearch()
    setSearchError(null)
    
    if (!query.trim()) {
      setSearchError("Please enter a location to search")
      return
    }

    try {
      const maps = await loadGoogleMaps()
      const geocoder = new maps.Geocoder()
      const resp = await geocoder.geocode({ address: query })
      const best = resp?.results?.[0]
      
      if (best?.geometry?.location) {
        const loc = best.geometry.location
        setHasQuery(true)
        
        // Initialize map if not already done
        if (!mapRef.current && containerRef.current) {
          const map = new maps.Map(containerRef.current, {
            center: { lat: loc.lat(), lng: loc.lng() },
            zoom: 15,
            mapTypeId: maps.MapTypeId.SATELLITE,
            styles: [
              { elementType: "geometry", stylers: [{ color: "#0b0f14" }] },
              { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#8ea2ad" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f14" }] },
              { featureType: "poi", stylers: [{ visibility: "off" }] },
              { featureType: "transit", stylers: [{ visibility: "off" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ color: "#141a22" }] },
              { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1621" }] },
            ],
          })
          mapRef.current = map
          setMapReady(true)
        }
      } else {
        setSearchError("Location not found. Please try a different search term.")
      }
    } catch (err) {
      console.error("[v0] Search error:", (err as Error).message)
      setSearchError("Search failed. Please try again.")
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card className="glass holo-border">
        <CardHeader>
          <CardTitle className="text-blue-50 flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <Label htmlFor="portfolio-search">Address / Area</Label>
              <Input
                id="portfolio-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter address or area"
                className="holo-border"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={playButtonClick}
            >
              Search Location
            </Button>
            {searchError && <div className="text-sm text-red-400">{searchError}</div>}
          </form>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card className="glass holo-border">
        <CardHeader>
          <CardTitle className="text-blue-50 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mapsError ? (
            <div className="h-96 rounded-lg overflow-hidden bg-gray-900/30 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🗺️</div>
                <h3 className="text-xl font-semibold text-blue-50">Google Maps Not Available</h3>
                <p className="text-gray-400 max-w-md">{mapsError}</p>
              </div>
            </div>
          ) : !hasQuery ? (
            <div className="h-96 rounded-lg overflow-hidden bg-gray-900/30 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🌍</div>
                <h3 className="text-xl font-semibold text-blue-50">3D Globe View</h3>
                <p className="text-gray-400 max-w-md">
                  Search for a location or click on your properties above to view them on the map
                </p>
              </div>
            </div>
          ) : (
            <div className="h-96 rounded-lg overflow-hidden">
              <div
                ref={containerRef as any}
                className="h-full w-full"
                aria-label="Interactive land parcels map"
                role="region"
              />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {hasQuery ? 'Viewing location on satellite map' : 'Search for a location to view on the map'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
