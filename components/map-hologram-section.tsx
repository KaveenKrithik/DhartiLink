"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import HologramPanel, { type Parcel } from "./hologram-panel"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const GOOGLE_MAPS_API_KEY = "AIzaSyCVzTgaYCdrtau2c8WkVQSJjaruwjqDu1k"

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

  const ownerRef = useRef<HTMLInputElement | null>(null)
  const addrRef = useRef<HTMLInputElement | null>(null)
  const parcelRef = useRef<HTMLInputElement | null>(null)
  const autocompleteRef = useRef<any>(null)

  const [selected, setSelected] = useState<Parcel | null>(null)
  const [visible, setVisible] = useState(false)
  const [hasQuery, setHasQuery] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)

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

  // Dummy parcel data
  const geojson = useMemo<FeatureRecord[]>(() => {
    const base = { lat: 12.9716, lng: 77.5946 }
    const square = (dx: number, dy: number, size = 0.002) => [
      { lat: base.lat + dy, lng: base.lng + dx },
      { lat: base.lat + dy, lng: base.lng + dx + size },
      { lat: base.lat + dy + size, lng: base.lng + dx + size },
      { lat: base.lat + dy + size, lng: base.lng + dx },
    ]
    const mk = (id: string, owner: string, dx: number, dy: number, areaSqM: number): FeatureRecord => ({
      path: square(dx, dy),
      properties: {
        id,
        owner,
        areaSqM,
        jurisdiction: "BBMP · Karnataka",
        encumbrances: id.endsWith("2") ? ["Bank Lien: KBL-2024-19"] : [],
        chainAssetId: `parcel:${id}:l2-rollup-01`,
        docDigest: `0x${btoa(id).slice(0, 6)}…${btoa(owner).slice(-6)}`,
      },
    })
    return [
      mk("KA-BLR-1001", "Anita Rao", 0.0, 0.0, 980),
      mk("KA-BLR-1002", "Rahul Singh", 0.004, 0.003, 1125),
      mk("KA-BLR-1003", "Lalita Mehta", -0.004, -0.0035, 870),
    ]
  }, [])

  // Initialize Places Autocomplete on the address input
  useEffect(() => {
    const init = async () => {
      try {
        await loadGoogleMaps()
        const inputEl = addrRef.current
        if (inputEl && inputEl !== attachedElRef.current && window.google?.maps?.places) {
          // Recreate Autocomplete on the current input element
          autocompleteRef.current = new window.google.maps.places.Autocomplete(inputEl, {
            fields: ["geometry", "formatted_address", "name"],
            types: ["geocode"],
          })
          attachedElRef.current = inputEl
        }
      } catch (e) {
        console.error("[v0] Autocomplete init error:", (e as Error).message)
      }
    }
    init()
  }, [hasQuery])

  // Initialize map immediately to show globe view; add parcels only after query
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let maps: any
    ;(async () => {
      try {
        maps = await loadGoogleMaps()
        const theme = getComputedStyle(document.documentElement)
        const primary = theme.getPropertyValue("--color-primary")?.trim() || "#00e5ff"
        const accent = theme.getPropertyValue("--color-chart-2")?.trim() || "#ff3fd8"

        const map = new maps.Map(containerRef.current!, {
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
      }
    })()
  }, [])

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

      if (searchResult?.parcelId) {
        const target = geojson.find((g) => g.properties.id === searchResult.parcelId)
        if (target) {
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
        }
      } else if (searchResult?.targetLatLng && window.google?.maps?.geometry?.poly) {
        const point = new maps.LatLng(searchResult.targetLatLng)
        const maybe = polygons.find((poly) => window.google.maps.geometry.poly.containsLocation(point, poly))
        if (maybe) {
          const id = (maybe as any).__parcelId as string
          const target = geojson.find((g) => g.properties.id === id)
          if (target) {
            const bounds = new maps.LatLngBounds()
            for (const p of target.path) bounds.extend(p)
            flyToBounds(bounds)
            setSelected(target.properties)
            setVisible(true)
          }
        } else {
          map.setCenter(searchResult.targetLatLng)
          map.setZoom(16)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, hasQuery])

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
    setSearchError(null)
    const owner = ownerRef.current?.value?.trim() || ""
    const addr = addrRef.current?.value?.trim() || ""
    const parcel = parcelRef.current?.value?.trim() || ""

    const findByParcel =
      parcel && geojson.find((g) => g.properties.id.toLowerCase().includes(parcel.toLowerCase()))?.properties.id

    const findByOwner =
      !findByParcel &&
      owner &&
      geojson.find((g) => g.properties.owner.toLowerCase().includes(owner.toLowerCase()))?.properties.id

    let targetLatLng: { lat: number; lng: number } | undefined
    const parcelId: string | undefined = findByParcel || findByOwner || undefined

    try {
      const maps = await loadGoogleMaps()

      // Prefer Autocomplete selection if any
      if (!parcelId) {
        const ac = autocompleteRef.current
        const place = ac?.getPlace?.()
        if (place?.geometry?.location) {
          const loc = place.geometry.location
          targetLatLng = { lat: loc.lat(), lng: loc.lng() }
        } else if (addr) {
          const geocoder = new maps.Geocoder()
          const resp = await geocoder.geocode({ address: addr })
          if (resp?.results?.[0]?.geometry?.location) {
            const loc = resp.results[0].geometry.location
            targetLatLng = { lat: loc.lat(), lng: loc.lng() }
          }
        }
      }

      if (!parcelId && !targetLatLng) {
        setSearchError("Enter at least Parcel ID, Owner name, or a valid Address.")
        return
      }

      // Set query and let effect initialize the map
      setSearchResult({ parcelId, targetLatLng })
      setHasQuery(true)
      setTimeout(() => setVisible(true), 50)
    } catch (err) {
      console.error("[v0] Search error:", (err as Error).message)
      setSearchError("Search failed. Please try again.")
    }
  }

  return (
    <section id="holo-section" ref={sectionRef} className="relative">
      <div className="holo-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />

      {/* Pre-map large search form (map shows globe until query) */}
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
                <Input ref={parcelRef} id="parcel" placeholder="KA-BLR-1002" className="holo-border" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="owner">Owner Name</Label>
                <Input ref={ownerRef} id="owner" placeholder="e.g., Rahul" className="holo-border" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-1">
                <Label htmlFor="address">Address / Area</Label>
                <Input
                  ref={addrRef}
                  id="address"
                  placeholder="Enter address or area"
                  className="holo-border"
                  aria-autocomplete="list"
                />
              </div>
              <div className="md:col-span-3 flex justify-end pt-2">
                <Button type="submit" className="holo-glow">
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

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[1fr_380px] md:py-10">
        <div className="relative">
          {/* map container always visible; shows globe initially */}
          <div
            ref={containerRef as any}
            className={cn(
              "w-full rounded-lg border holo-border glass transition-all",
              "h-[60vh] md:h-[70vh] opacity-100",
            )}
            aria-label="Interactive land parcels map"
            role="region"
          />
        </div>

        <div className="flex flex-col gap-4">
          <HologramPanel parcel={selected} visible={visible} />
          <div className="glass holo-border p-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Provide details to reveal the map. Hover parcels to preview details. Click to pin.
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" className="holo-glow" aria-label="Start mock verification">
                Verify Ownership (Demo)
              </Button>
              <Button variant="outline" className="holo-border bg-transparent" aria-label="Start mock bidding">
                Open Bidding (Demo)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
