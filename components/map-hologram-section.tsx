"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import HologramPanel, { type Parcel } from "./hologram-panel"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Gavel } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import dynamic from "next/dynamic"
import { useSoundManager } from "@/components/sound-manager"
import { supabase } from "@/lib/supabase-client"

const GOOGLE_MAPS_API_KEY = "AIzaSyCL2LQdzss5ZsXPCpaJVRT8QurIr7q_EgE"

// Debug: Log the API key status
if (typeof window !== 'undefined') {
  console.log('Google Maps API Key:', GOOGLE_MAPS_API_KEY ? 'Configured' : 'Not configured')
}

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
    const id = "google-maps-js"
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

type FeatureRecord = {
  path: { lat: number; lng: number }[]
  properties: Parcel
}

export default function MapHologramSection() {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)
  const attachedElRef = useRef<HTMLInputElement | null>(null)
  
  const {
    playMapSearch,
    playMapZoom,
    playParcelSelect,
    playHover,
    playButtonClick,
    playInputFocus,
  } = useSoundManager()

  const ownerRef = useRef<HTMLInputElement | null>(null)
  const addrRef = useRef<HTMLInputElement | null>(null)
  const parcelRef = useRef<HTMLInputElement | null>(null)
  const autocompleteRef = useRef<any>(null)
  const placeResultRef = useRef<any>(null)

  const [selected, setSelected] = useState<Parcel | null>(null)
  const [visible, setVisible] = useState(false)
  const [hasQuery, setHasQuery] = useState(false)
  const [query, setQuery] = useState<string>("")
  const [searchError, setSearchError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapsError, setMapsError] = useState<string | null>(null)
  const FancyGlobe = useMemo(() => dynamic(() => import("./fancy-globe"), { ssr: false }), [])
  const globeApiRef = useRef<{ flyTo: (lat: number, lng: number, durationMs?: number, done?: () => void) => void } | null>(null)

  // Will be used by effects to act after map init
  const [searchResult, setSearchResult] = useState<{
    targetLatLng?: { lat: number; lng: number }
    parcelId?: string
  } | null>(null)

  const mapStyles = useMemo(
    () => [
      { elementType: "geometry", stylers: [{ color: "#0b0f14" }] },
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#8ea2ad" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f14" }] },
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "transit", stylers: [{ visibility: "off" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#141a22" }] },
      { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1621" }] },
      { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1a2330" }] },
    ],
    [],
  )

  // Parcels derived from Supabase coordinates (no dummy data)
  const [geojson, setGeojson] = useState<FeatureRecord[]>([])

  useEffect(() => {
    const loadParcels = async () => {
      try {
        if (!supabase) return
        const { data, error } = await supabase
          .from('property_listings')
          .select('id, seller_name, coordinates')
        if (error) {
          console.warn('[Map] Failed to load parcels from Supabase:', error)
          return
        }
        const features: FeatureRecord[] = []
        const size = 0.0008 // ~small square around the point
        for (const row of (data || [])) {
          const c = (row as any).coordinates
          
          // Try different coordinate formats
          let coords: number[] | null = null
          
          if (c && typeof c === 'object') {
            // PostGIS GeoJSON format: { coordinates: [lng, lat] }
            if (Array.isArray((c as any).coordinates)) {
              coords = (c as any).coordinates
            }
            // Direct array format: [lng, lat]
            else if (Array.isArray(c)) {
              coords = c
            }
            // Object with lat/lng properties: { lat: number, lng: number }
            else if (typeof (c as any).lat === 'number' && typeof (c as any).lng === 'number') {
              coords = [(c as any).lng, (c as any).lat]
            }
            // Object with lon/lat properties: { lat: number, lon: number }
            else if (typeof (c as any).lat === 'number' && typeof (c as any).lon === 'number') {
              coords = [(c as any).lon, (c as any).lat]
            }
          }
          // PostGIS Geography WKB format (hex string)
          else if (typeof c === 'string' && c.startsWith('0101000020E6100000')) {
            try {
              // Parse WKB hex string to get coordinates
              const hexCoords = c.slice(18) // Remove the WKB header
              const lngHex = hexCoords.slice(0, 16)
              const latHex = hexCoords.slice(16, 32)
              
              // Convert hex to float (little-endian) - browser compatible
              const lngBytes = new Uint8Array(8)
              const latBytes = new Uint8Array(8)
              
              for (let i = 0; i < 8; i++) {
                lngBytes[i] = parseInt(lngHex.slice(i * 2, i * 2 + 2), 16)
                latBytes[i] = parseInt(latHex.slice(i * 2, i * 2 + 2), 16)
              }
              
              const lngView = new DataView(lngBytes.buffer)
              const latView = new DataView(latBytes.buffer)
              
              const lng = lngView.getFloat64(0, true) // little-endian
              const lat = latView.getFloat64(0, true) // little-endian
              
              coords = [lng, lat]
            } catch (wkbErr) {
              console.warn(`[Map] Failed to parse WKB coordinates for ${(row as any).id}:`, (wkbErr as Error).message)
            }
          }
          
          if (coords && coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
            const lng = coords[0]
            const lat = coords[1]
            const square = [
              { lat: lat, lng: lng },
              { lat: lat, lng: lng + size },
              { lat: lat + size, lng: lng + size },
              { lat: lat + size, lng: lng },
            ]
            features.push({
              path: square,
              properties: {
                id: (row as any).id,
                owner: (row as any).seller_name || 'Unknown',
                areaSqM: 0,
                jurisdiction: '',
                encumbrances: [],
                chainAssetId: `parcel:${(row as any).id}`,
                docDigest: '',
              }
            })
          } else {
            console.warn(`[Map] Skipping parcel ${(row as any).id} - invalid coordinates:`, c)
          }
        }
        setGeojson(features)
      } catch (e) {
        console.warn('[Map] Parcels load error:', (e as Error).message)
      }
    }
    loadParcels()
  }, [])

  // Initialize Places Autocomplete on the address input
  useEffect(() => {
    const init = async () => {
      try {
        await loadGoogleMaps()
        const inputEl = addrRef.current
        if (inputEl && inputEl !== attachedElRef.current && window.google?.maps?.places) {
          // Recreate Autocomplete on the current input element
          const ac = new window.google.maps.places.Autocomplete(inputEl, {
            fields: ["geometry", "formatted_address", "name"],
            types: ["geocode"],
          })
          autocompleteRef.current = ac
          placeResultRef.current = null
          ac.addListener("place_changed", () => {
            try {
              const place = ac.getPlace?.()
              placeResultRef.current = place || null
            } catch {
              placeResultRef.current = null
            }
          })
          attachedElRef.current = inputEl
        }
      } catch (e) {
        console.error("[v0] Autocomplete init error:", (e as Error).message)
      }
    }
    init()
  }, [hasQuery])

  // Listen for portfolio land search events
  useEffect(() => {
    const handlePortfolioLandSearch = async (event: CustomEvent) => {
      const { location, title } = event.detail
      setQuery(location)
      setHasQuery(true)
      playMapSearch()
      
      // Set the address input value and trigger search
      if (addrRef.current) {
        addrRef.current.value = location
      }
      
      // Trigger the search programmatically
      try {
        const maps = await loadGoogleMaps()
        const geocoder = new maps.Geocoder()
        const resp = await geocoder.geocode({ address: location })
        const best = resp?.results?.[0]
        if (best?.geometry?.location) {
          const loc = best.geometry.location
          setSearchResult({
            targetLatLng: { lat: loc.lat(), lng: loc.lng() }
          })
        }
      } catch (geoErr) {
        console.warn("[v0] Portfolio geocoding failed:", (geoErr as Error).message)
        // Don't set hasQuery to true if geocoding fails
        setHasQuery(false)
        setQuery("")
      }
    }

    window.addEventListener('portfolioLandSearch', handlePortfolioLandSearch as unknown as EventListener)
    
    return () => {
      window.removeEventListener('portfolioLandSearch', handlePortfolioLandSearch as unknown as EventListener)
    }
  }, [playMapSearch])

  // Initialize Google Map once the user has searched (container exists then)
  useEffect(() => {
    if (!hasQuery || !containerRef.current || mapRef.current) return
    
    // Ensure the container is properly mounted
    if (!containerRef.current || !containerRef.current.offsetParent) {
      console.warn("[v0] Map container not properly mounted")
      return
    }
    
    // Add a small delay to ensure the container is fully rendered
    const initMap = async () => {
      // Double-check the container is still available
      if (!containerRef.current) {
        console.warn("[v0] Map container disappeared during initialization")
        return
      }
      
      let maps: any
      try {
        maps = await loadGoogleMaps()
        setMapsError(null)
        const theme = getComputedStyle(document.documentElement)
        const primary = theme.getPropertyValue("--color-primary")?.trim() || "#00e5ff"
        const accent = theme.getPropertyValue("--color-chart-2")?.trim() || "#ff3fd8"

        if (!containerRef.current) {
          console.warn("[v0] Map container not ready")
          return
        }
        
        const map = new maps.Map(containerRef.current, {
          center: { lat: 20, lng: 0 },
          zoom: 2,
          disableDefaultUI: true,
          clickableIcons: false,
          styles: mapStyles as any,
          gestureHandling: "greedy",
          mapTypeControl: false,
          tilt: 0,
          heading: 0,
        })
        mapRef.current = map
        containerRef.current!.style.boxShadow =
          "0 0 24px -8px rgba(0, 229, 255, 0.35), inset 0 0 0 1px rgba(0, 229, 255, 0.25)"

        // Subtle animated glow on idle
        try {
          const overlay = new maps.Circle({
            center: { lat: 20, lng: 0 },
            radius: 2_000_000,
            strokeColor: accent,
            strokeOpacity: 0.15,
            strokeWeight: 1,
            fillColor: primary,
            fillOpacity: 0.05,
            map,
          })
          setTimeout(() => overlay.setMap(null), 2500)
        } catch {}

        setMapReady(true)
      } catch (err) {
        console.error("[v0] Google Maps globe init error:", (err as Error).message)
        const errorMessage = (err as Error).message
        
        if (errorMessage.includes('BillingNotEnabledMapError')) {
          setMapsError("Google Maps billing is not enabled. Please enable billing in your Google Cloud Console to use the Maps API. Check GOOGLE_MAPS_BILLING_SETUP.md for detailed instructions.")
        } else if (errorMessage.includes('RefererNotAllowedMapError')) {
          setMapsError("This domain is not authorized to use the Google Maps API. Please add localhost:3000 to your allowed referrers.")
        } else if (errorMessage.includes('API key not configured')) {
          setMapsError("Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.")
        } else {
          setMapsError("Google Maps is not available. Please check your API key configuration and billing settings.")
        }
      }
    }
    
    // Add a small delay to ensure the container is fully rendered
    setTimeout(initMap, 100)
  }, [hasQuery])

  useEffect(() => {
    if (!mapReady || !hasQuery || !mapRef.current) return
    let polygons: any[] = []
    let maps = window.google?.maps
    try {
      const theme = getComputedStyle(document.documentElement)
      const primary = theme.getPropertyValue("--color-primary")?.trim() || "#00e5ff"
      const accent = theme.getPropertyValue("--color-chart-2")?.trim() || "#ff3fd8"
      const map = mapRef.current

      const setCursor = (v: string) => {
        if (containerRef.current) containerRef.current.style.cursor = v
      }

      polygons = geojson.map((feature) => {
        const poly = new maps.Polygon({
          paths: feature.path,
          strokeColor: accent,
          strokeOpacity: 0.85,
          strokeWeight: 2,
          fillColor: primary,
          fillOpacity: 0.18,
          map,
        })

        poly.addListener("mouseover", () => {
          setCursor("pointer")
          setSelected({ ...feature.properties })
          poly.setOptions({ fillOpacity: 0.26, strokeWeight: 3 })
        })
        poly.addListener("mouseout", () => {
          setCursor("")
          poly.setOptions({ fillOpacity: 0.18, strokeWeight: 2 })
        })
        poly.addListener("click", () => setVisible(true))
        ;(poly as any).__parcelId = feature.properties.id
        return poly
      })

      const flyToBounds = (bounds: any) => {
        map.fitBounds(bounds, 48)
        setTimeout(() => {
          // Add cinematic tilt/heading
          try {
            map.setTilt(67.5)
            map.setHeading(35)
          } catch {}
        }, 450)
      }

      const pulseAt = (lat: number, lng: number) => {
        try {
          const marker = new maps.Marker({ position: { lat, lng }, map, animation: maps.Animation.DROP })
          const circle = new maps.Circle({
            center: { lat, lng },
            radius: 30,
            strokeColor: accent,
            strokeOpacity: 0.6,
            strokeWeight: 1,
            fillColor: accent,
            fillOpacity: 0.15,
            map,
          })
          setTimeout(() => circle.setOptions({ radius: 120, fillOpacity: 0.05, strokeOpacity: 0.25 }), 400)
          setTimeout(() => {
            circle.setMap(null)
            marker.setMap(null)
          }, 2000)
        } catch {}
      }

      // Handle parcel search highlighting
      if (searchResult?.parcelId) {
        const target = geojson.find((g) => g.properties.id === searchResult.parcelId)
        if (target) {
          // Find and highlight the polygon for this parcel
          const targetPolygon = polygons.find((poly) => (poly as any).__parcelId === searchResult.parcelId)
          if (targetPolygon) {
            // Enhanced highlighting for searched parcel
            targetPolygon.setOptions({
              strokeWeight: 4,
              strokeOpacity: 1.0,
              fillOpacity: 0.35,
              strokeColor: "#ff6b35", // Orange highlight
            })
          }
          
          const bounds = new maps.LatLngBounds()
          for (const p of target.path) bounds.extend(p)
          flyToBounds(bounds)
          setSelected(target.properties)
          setVisible(true)
          const centroid = target.path.reduce(
            (acc, p) => ({ lat: acc.lat + p.lat / target.path.length, lng: acc.lng + p.lng / target.path.length }),
            { lat: 0, lng: 0 },
          )
          pulseAt(centroid.lat, centroid.lng)
        } else {
          // Fallback: create temporary highlight polygon if coordinates exist but parcel not in geojson
          if (searchResult?.targetLatLng) {
            const size = 0.0008
            const { lat, lng } = searchResult.targetLatLng
            const tempPolygon = new maps.Polygon({
              paths: [
                { lat: lat, lng: lng },
                { lat: lat, lng: lng + size },
                { lat: lat + size, lng: lng + size },
                { lat: lat + size, lng: lng },
              ],
              strokeColor: "#ff6b35",
              strokeOpacity: 1.0,
              strokeWeight: 4,
              fillColor: "#ff6b35",
              fillOpacity: 0.25,
              map,
            })
            polygons.push(tempPolygon)
            
            map.setCenter(searchResult.targetLatLng)
            map.setZoom(16)
            pulseAt(lat, lng)
            
            // Create a temporary parcel object for display
            setSelected({
              id: searchResult.parcelId,
              owner: 'Unknown',
              areaSqM: 0,
              jurisdiction: '',
              encumbrances: [],
              chainAssetId: `parcel:${searchResult.parcelId}`,
              docDigest: '',
            })
            setVisible(true)
          }
        }
      } else if (searchResult?.targetLatLng && window.google?.maps?.geometry?.poly) {
        const point = new maps.LatLng(searchResult.targetLatLng)
        const maybe = polygons.find((poly) => window.google.maps.geometry.poly.containsLocation(point, poly))
        if (maybe) {
          const id = (maybe as any).__parcelId as string
          const target = geojson.find((g) => g.properties.id === id)
          if (target) {
            // Highlight the polygon
            maybe.setOptions({
              strokeWeight: 4,
              strokeOpacity: 1.0,
              fillOpacity: 0.35,
              strokeColor: "#ff6b35",
            })
            
            const bounds = new maps.LatLngBounds()
            for (const p of target.path) bounds.extend(p)
            flyToBounds(bounds)
            setSelected(target.properties)
            setVisible(true)
          }
        } else {
          map.setCenter(searchResult.targetLatLng)
          map.setZoom(16)
          pulseAt(searchResult.targetLatLng.lat, searchResult.targetLatLng.lng)
        }
      }

      return () => {
        try {
          ;(polygons || []).forEach((p) => p.setMap && p.setMap(null))
        } catch {}
      }
    } catch (err) {
      console.error("[v0] parcel overlay error:", (err as Error).message)
    }
  }, [mapReady, hasQuery, searchResult, geojson])

  // IntersectionObserver still controls the hologram reveal effect
  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return
    const el = sectionRef.current
    if (!el || !(el instanceof Element)) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setVisible(e.isIntersecting)
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault?.()
    playMapSearch()
    setSearchError(null)
    const owner = ownerRef.current?.value?.trim() || ""
    const addr = addrRef.current?.value?.trim() || ""
    const parcel = parcelRef.current?.value?.trim() || ""

    let targetLatLng: { lat: number; lng: number } | undefined
    let parcelId: string | undefined

    // Try Supabase-backed search first
    try {
      if (supabase) {
        let query = supabase.from('property_listings').select('id, seller_name, location, coordinates').limit(1)
        if (parcel) {
          query = query.eq('id', parcel)
        } else if (owner) {
          query = query.ilike('seller_name', `%${owner}%`)
        } else if (addr) {
          query = query.ilike('location', `%${addr}%`)
        }

        const { data, error } = await query
        if (error) {
          console.warn('[Map] Supabase search error:', error)
          setSearchError(`Database error: ${error.message}`)
          return
        } else if (data && data.length > 0) {
          const row: any = data[0]
          parcelId = row.id
          const c = row.coordinates
          console.log(`[Map] Debug coordinates for parcel ${row.id}:`, c)
          
          // Try different coordinate formats
          let coords: number[] | null = null
          
          if (c && typeof c === 'object') {
            // PostGIS GeoJSON format: { coordinates: [lng, lat] }
            if (Array.isArray((c as any).coordinates)) {
              coords = (c as any).coordinates
            }
            // Direct array format: [lng, lat]
            else if (Array.isArray(c)) {
              coords = c
            }
            // Object with lat/lng properties: { lat: number, lng: number }
            else if (typeof (c as any).lat === 'number' && typeof (c as any).lng === 'number') {
              coords = [(c as any).lng, (c as any).lat]
            }
            // Object with lon/lat properties: { lat: number, lon: number }
            else if (typeof (c as any).lat === 'number' && typeof (c as any).lon === 'number') {
              coords = [(c as any).lon, (c as any).lat]
            }
          }
          // PostGIS Geography WKB format (hex string)
          else if (typeof c === 'string' && c.startsWith('0101000020E6100000')) {
            try {
              // Parse WKB hex string to get coordinates
              // WKB format: 0101000020E6100000 + 16 hex chars for lng + 16 hex chars for lat
              const hexCoords = c.slice(18) // Remove the WKB header
              const lngHex = hexCoords.slice(0, 16)
              const latHex = hexCoords.slice(16, 32)
              
              // Convert hex to float (little-endian) - browser compatible
              const lngBytes = new Uint8Array(8)
              const latBytes = new Uint8Array(8)
              
              for (let i = 0; i < 8; i++) {
                lngBytes[i] = parseInt(lngHex.slice(i * 2, i * 2 + 2), 16)
                latBytes[i] = parseInt(latHex.slice(i * 2, i * 2 + 2), 16)
              }
              
              const lngView = new DataView(lngBytes.buffer)
              const latView = new DataView(latBytes.buffer)
              
              const lng = lngView.getFloat64(0, true) // little-endian
              const lat = latView.getFloat64(0, true) // little-endian
              
              coords = [lng, lat]
              console.log(`[Map] Parsed WKB coordinates for ${parcelId}: lat=${lat}, lng=${lng}`)
            } catch (wkbErr) {
              console.warn(`[Map] Failed to parse WKB coordinates for ${parcelId}:`, (wkbErr as Error).message)
            }
          }
          
          if (coords && coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
            const lng = coords[0]
            const lat = coords[1]
            targetLatLng = { lat, lng }
            console.log(`[Map] Extracted coordinates for ${parcelId}: lat=${lat}, lng=${lng}`)
          } else {
            console.warn(`[Map] Invalid coordinates format for parcel ${parcelId}:`, c)
          }
          // Only use coordinates from database - no geocoding
          
          // Check if we have valid coordinates
          if (!targetLatLng) {
            setSearchError(`Parcel "${parcelId}" found but coordinates are missing or invalid.`)
            return
          }
        } else {
          // No results found
          if (parcel) {
            setSearchError(`Parcel ID "${parcel}" not found in database.`)
          } else if (owner) {
            setSearchError(`No parcels found for owner "${owner}".`)
          } else if (addr) {
            setSearchError(`No parcels found for location "${addr}".`)
          }
          return
        }
      }
    } catch (sbErr) {
      console.warn('[Map] Supabase lookup failed:', (sbErr as Error).message)
      setSearchError(`Database connection failed: ${(sbErr as Error).message}`)
      return
    }

    // Fallback to existing dummy-geojson matching if still unresolved
    if (!parcelId && parcel) {
      const match = geojson.find((g) => g.properties.id.toLowerCase().includes(parcel.toLowerCase()))?.properties.id
      if (match) parcelId = match
    }
    if (!parcelId && owner) {
      const match = geojson.find((g) => g.properties.owner.toLowerCase().includes(owner.toLowerCase()))?.properties.id
      if (match) parcelId = match
    }

    try {
      const maps = await loadGoogleMaps()

      // Only use coordinates from database - no geocoding or autocomplete

      if (!parcelId && !targetLatLng) {
        setSearchError("Enter Parcel ID or Owner name to search.")
        return
      }

      // If we have a target position, animate globe first, then switch to map
      const endLatLng = targetLatLng || (() => {
        const byId = (parcelId && geojson.find((g) => g.properties.id === parcelId)) || null
        if (!byId) return undefined
        const c = byId.path.reduce(
          (acc, p) => ({ lat: acc.lat + p.lat / byId.path.length, lng: acc.lng + p.lng / byId.path.length }),
          { lat: 0, lng: 0 },
        )
        return c
      })()

      if (!hasQuery && endLatLng && globeApiRef.current) {
        globeApiRef.current.flyTo(endLatLng.lat, endLatLng.lng, 1400, () => {
          setSearchResult({ parcelId, targetLatLng })
          setHasQuery(true)
          setTimeout(() => setVisible(true), 50)
        })
      } else {
        setSearchResult({ parcelId, targetLatLng })
        setHasQuery(true)
        setTimeout(() => setVisible(true), 50)
      }
    } catch (err) {
      console.error("[v0] Search error:", (err as Error).message)
      setSearchError("Search failed. Please try again.")
    }
  }

  return (
    <section id="holo-section" ref={sectionRef} className="relative">
      <div className="holo-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />

      {/* Pre-map large search form (globe showing behind) */}
      {!hasQuery && (
        <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
          <div className="glass holo-border scanlines rounded-lg p-6">
            <h2 className="text-balance text-2xl font-semibold holo-glow">DhartiLink Parcel Search</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Provide any one: Parcel ID, Owner name, or Address/Area. We’ll locate the parcel and reveal its hologram.
            </p>
            <form onSubmit={handleSearch} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="parcel">Parcel ID</Label>
                <Input 
                  ref={parcelRef} 
                  id="parcel" 
                  placeholder="KA-BLR-1002" 
                  className="holo-border" 
                  onFocus={playInputFocus}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="owner">Owner Name</Label>
                <Input 
                  ref={ownerRef} 
                  id="owner" 
                  placeholder="e.g., Rahul" 
                  className="holo-border" 
                  onFocus={playInputFocus}
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-1">
                <Label htmlFor="address">Address / Area</Label>
                <Input
                  ref={addrRef}
                  id="address"
                  placeholder="Enter address or area"
                  className="holo-border"
                  aria-autocomplete="list"
                  onFocus={playInputFocus}
                />
              </div>
              <div className="md:col-span-3 flex justify-end pt-2">
                <Button 
                  type="submit" 
                  className="holo-glow"
                  onMouseEnter={playHover}
                  onClick={playButtonClick}
                >
                  Search
                </Button>
              </div>
              {searchError && <div className="md:col-span-3 text-sm text-destructive-foreground/90">{searchError}</div>}
            </form>
          </div>
        </div>
      )}

      {/* After search: compact sticky searchbar over the map */}
      {hasQuery && (
        <div className="sticky top-0 z-10 mx-auto w-full max-w-7xl px-4 pt-4">
          <form
            onSubmit={handleSearch}
            className="glass holo-border scanlines rounded-lg p-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"
            role="search"
            aria-label="Search for land parcel"
          >
            <Input ref={parcelRef} placeholder="Parcel ID" className="holo-border" />
            <Input ref={ownerRef} placeholder="Owner Name" className="holo-border" />
            <Input ref={addrRef} placeholder="Address / Area" className="holo-border" aria-autocomplete="list" />
            <Button type="submit" className="holo-glow">
              Search
            </Button>
            {searchError && <div className="md:col-span-4 text-xs text-destructive-foreground/90">{searchError}</div>}
          </form>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[minmax(0,1fr)_380px] md:py-10">
        <div className="relative">
          {/* Left: render either globe or map for consistent layout */}
          {!hasQuery ? (
            <div className="h-[52vh] sm:h-[56vh] md:h-[70vh] w-full overflow-hidden rounded-lg border holo-border glass">
              <FancyGlobe onApi={(api) => (globeApiRef.current = api)} />
            </div>
          ) : mapsError ? (
            <div className="h-[56vh] md:h-[70vh] w-full overflow-hidden rounded-lg border holo-border glass flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="text-6xl">🗺️</div>
                <h3 className="text-xl font-semibold text-blue-50">Google Maps Not Available</h3>
                <p className="text-gray-400 max-w-md">
                  {mapsError}
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>To fix this issue:</p>
                  <ol className="list-decimal list-inside space-y-1 text-left">
                    <li>Go to <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Google Cloud Console Billing</a></li>
                    <li>Enable billing for your project</li>
                    <li>Add a payment method (Google provides $200 free credits)</li>
                    <li>Return to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">API Credentials</a></li>
                    <li>Add localhost:3000 to allowed referrers</li>
                  </ol>
                  <p className="text-xs text-gray-600 mt-2">
                    💡 <strong>Note:</strong> Google Maps API requires billing to be enabled, even for development use.
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setHasQuery(false)
                    setMapsError(null)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Back to Globe
                </Button>
              </div>
            </div>
          ) : (
            <div
              ref={containerRef as any}
              className="h-[56vh] md:h-[70vh] w-full overflow-hidden rounded-lg border holo-border glass"
              aria-label="Interactive land parcels map"
              role="region"
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <HologramPanel parcel={selected} visible={visible} />
          <div className="glass holo-border p-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {hasQuery ? 'Hover parcels to preview details. Click to pin.' : 'Provide details to reveal parcels over the map.'}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                className="holo-glow w-full justify-center whitespace-nowrap"
                aria-label="Start mock verification"
              >
                Verify Ownership (Demo)
              </Button>
              <Button
                variant="secondary"
                className="holo-glow w-full justify-center whitespace-nowrap"
                aria-label="Start mock bidding"
              >
                <Gavel className="mr-2 h-4 w-4 shrink-0" />
                Open Bidding (Demo)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
