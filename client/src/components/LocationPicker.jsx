import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const ACCRA_CENTER = [-0.1869, 5.6037]

export default function LocationPicker({ onPickupChange, onDropoffChange, onDistanceChange }) {
  const mapRef            = useRef(null)
  const mapInstance       = useRef(null)
  const pickupMarker      = useRef(null)
  const dropoffMarker     = useRef(null)
  const pickupGeocoderRef = useRef(null)
  const dropoffGeocoderRef= useRef(null)
  const activePinRef      = useRef('pickup') // ref, not state — avoids re-registering the click listener

  const [pickup, setPickup]     = useState(null)
  const [dropoff, setDropoff]   = useState(null)
  const [distance, setDistance] = useState(null)
  const [calculating, setCalculating] = useState(false)
  const [activePin, setActivePinState] = useState('pickup')
  const [searchError, setSearchError]   = useState('')
  const [routeError, setRouteError]     = useState('')

  const setActivePin = (mode) => {
    activePinRef.current = mode
    setActivePinState(mode)
  }

  // ---- Reverse geocoding (used for map clicks + marker drags) ----
  const reverseGeocode = async (lng, lat, isPickup) => {
    try {
      const res  = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
      )
      const data = await res.json()
      const placeName = data.features?.[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      applyLocation(lng, lat, placeName, isPickup)
    } catch (e) {
      console.error(e)
      setSearchError('Could not resolve that location. Please try again.')
    }
  }

  // ---- Shared logic to set marker + state + notify parent ----
  const applyLocation = (lng, lat, placeName, isPickup) => {
    setSearchError('')
    if (isPickup) {
      setPickup({ lng, lat, name: placeName })
      onPickupChange(placeName, { lng, lat })
      placeMarker(pickupMarker, lng, lat, '#f97316', '📍 Pickup', placeName, true)
    } else {
      setDropoff({ lng, lat, name: placeName })
      onDropoffChange(placeName, { lng, lat })
      placeMarker(dropoffMarker, lng, lat, '#22c55e', '🎯 Drop-off', placeName, false)
    }
  }

  // ---- Create/update a draggable marker ----
  const placeMarker = (markerRef, lng, lat, color, label, placeName, isPickup) => {
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat])
      markerRef.current.setPopup(
        new mapboxgl.Popup().setHTML(`<div style="font-size:12px;font-weight:600">${label}<br/>${placeName}</div>`)
      )
      return
    }

    const marker = new mapboxgl.Marker({ color, draggable: true })
      .setLngLat([lng, lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<div style="font-size:12px;font-weight:600">${label}<br/>${placeName}</div>`))
      .addTo(mapInstance.current)

    marker.on('dragend', () => {
      const { lng: newLng, lat: newLat } = marker.getLngLat()
      reverseGeocode(newLng, newLat, isPickup)
    })

    markerRef.current = marker
  }

  // ---- Map + geocoders setup (runs once) ----
  useEffect(() => {
    if (mapInstance.current) return

    mapInstance.current = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: ACCRA_CENTER,
      zoom: 11,
    })

    mapInstance.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapInstance.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
    }), 'top-right')

    // Single click listener for the lifetime of the map — reads activePinRef, never re-registers
    mapInstance.current.on('click', (e) => {
      const { lng, lat } = e.lngLat
      reverseGeocode(lng, lat, activePinRef.current === 'pickup')
    })

    // Pickup geocoder (autocomplete search box)
    const pickupGeocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      countries: 'gh',
      proximity: { longitude: ACCRA_CENTER[0], latitude: ACCRA_CENTER[1] },
      placeholder: 'Search pickup location...',
    })
    pickupGeocoder.on('result', (e) => {
      const [lng, lat] = e.result.center
      applyLocation(lng, lat, e.result.place_name, true)
      mapInstance.current.flyTo({ center: [lng, lat], zoom: 14 })
    })
    pickupGeocoder.on('error', () => setSearchError('Pickup search failed. Check your connection and try again.'))
    pickupGeocoderRef.current.appendChild(pickupGeocoder.onAdd(mapInstance.current))

    // Dropoff geocoder (autocomplete search box)
    const dropoffGeocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      countries: 'gh',
      proximity: { longitude: ACCRA_CENTER[0], latitude: ACCRA_CENTER[1] },
      placeholder: 'Search drop-off location...',
    })
    dropoffGeocoder.on('result', (e) => {
      const [lng, lat] = e.result.center
      applyLocation(lng, lat, e.result.place_name, false)
      mapInstance.current.flyTo({ center: [lng, lat], zoom: 14 })
    })
    dropoffGeocoder.on('error', () => setSearchError('Drop-off search failed. Check your connection and try again.'))
    dropoffGeocoderRef.current.appendChild(dropoffGeocoder.onAdd(mapInstance.current))

    return () => {
      pickupGeocoder.onRemove()
      dropoffGeocoder.onRemove()
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  // ---- Distance calculation once both points are set ----
  useEffect(() => {
    if (pickup && dropoff) calculateDistance()
  }, [pickup, dropoff])

  const calculateDistance = async () => {
    setCalculating(true)
    setRouteError('')
    try {
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
      )
      const data = await res.json()
      const distKm = data.routes?.[0]?.distance
        ? (data.routes[0].distance / 1000).toFixed(1)
        : null

      if (distKm) {
        setDistance(distKm)
        onDistanceChange(Number(distKm))

        const bounds = new mapboxgl.LngLatBounds()
        bounds.extend([pickup.lng, pickup.lat])
        bounds.extend([dropoff.lng, dropoff.lat])
        mapInstance.current.fitBounds(bounds, { padding: 60, maxZoom: 14 })
      } else {
        setDistance(null)
        onDistanceChange(0)
        setRouteError('No drivable route found between these two points. Please check the pins.')
      }
    } catch (e) {
      console.error(e)
      setDistance(null)
      onDistanceChange(0)
      setRouteError('Could not calculate distance. Please try again.')
    } finally {
      setCalculating(false)
    }
  }

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        .mapboxgl-ctrl-geocoder {
          width: 100% !important;
          max-width: none !important;
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.09) !important;
          box-shadow: none !important;
          border-radius: 8px !important;
        }
        .mapboxgl-ctrl-geocoder input {
          color: #fff !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
        }
        .mapboxgl-ctrl-geocoder--icon { fill: rgba(240,244,255,0.35) !important; }
        .mapboxgl-ctrl-geocoder .suggestions {
          background: #12172a !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
        }
        .mapboxgl-ctrl-geocoder .suggestions > li > a { color: #f0f4ff !important; }
        .mapboxgl-ctrl-geocoder .suggestions > .active > a,
        .mapboxgl-ctrl-geocoder .suggestions > li > a:hover {
          background: rgba(249,115,22,0.12) !important;
        }
        .pickup-geocoder .mapboxgl-ctrl-geocoder { border-color: rgba(249,115,22,0.3) !important; }
        .dropoff-geocoder .mapboxgl-ctrl-geocoder { border-color: rgba(34,197,94,0.3) !important; }
      `}</style>

      {/* Pin Mode Toggle — determines which pin a raw map click sets */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setActivePin('pickup')}
          style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${activePin === 'pickup' ? '#f97316' : 'rgba(255,255,255,0.1)'}`, background: activePin === 'pickup' ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.03)', color: activePin === 'pickup' ? '#f97316' : 'rgba(240,244,255,0.4)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          📍 Set Pickup
        </button>
        <button
          type="button"
          onClick={() => setActivePin('dropoff')}
          style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${activePin === 'dropoff' ? '#22c55e' : 'rgba(255,255,255,0.1)'}`, background: activePin === 'dropoff' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)', color: activePin === 'dropoff' ? '#22c55e' : 'rgba(240,244,255,0.4)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          🎯 Set Drop-off
        </button>
      </div>

      {/* Autocomplete search boxes — Mapbox Geocoder mounts here */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        <div className="pickup-geocoder" ref={pickupGeocoderRef} />
        <div className="dropoff-geocoder" ref={dropoffGeocoderRef} />
      </div>

      {searchError && (
        <div style={{ fontSize: 12, color: '#fca5a5', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
          ⚠️ {searchError}
        </div>
      )}

      <p style={{ fontSize: 11, color: 'rgba(240,244,255,0.3)', marginBottom: 10, textAlign: 'center' }}>
        Search above for the fastest result, or select <span style={{ color: '#f97316' }}>Set Pickup</span> / <span style={{ color: '#22c55e' }}>Set Drop-off</span> and tap the map. Drag a pin any time to fine-tune it.
      </p>

      {/* Map */}
      <div ref={mapRef} style={{ width: '100%', height: 320, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }} />

      {/* Selected locations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: pickup ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${pickup ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>📍</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: 'rgba(240,244,255,0.3)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pickup</div>
            <div style={{ fontSize: 12, color: pickup ? '#f97316' : 'rgba(240,244,255,0.25)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {pickup ? pickup.name : 'Not set — search above or tap the map'}
            </div>
          </div>
          {pickup && <span style={{ fontSize: 16 }}>✓</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: dropoff ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${dropoff ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🎯</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: 'rgba(240,244,255,0.3)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Drop-off</div>
            <div style={{ fontSize: 12, color: dropoff ? '#22c55e' : 'rgba(240,244,255,0.25)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {dropoff ? dropoff.name : 'Not set — search above or tap the map'}
            </div>
          </div>
          {dropoff && <span style={{ fontSize: 16 }}>✓</span>}
        </div>
      </div>

      {/* Distance / Route errors */}
      {calculating && (
        <div style={{ textAlign: 'center', padding: '12px', fontSize: 13, color: 'rgba(240,244,255,0.4)', marginTop: 10 }}>
          ⏳ Calculating distance...
        </div>
      )}
      {routeError && !calculating && (
        <div style={{ fontSize: 12, color: '#fca5a5', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginTop: 10 }}>
          ⚠️ {routeError}
        </div>
      )}
      {distance && !calculating && !routeError && (
        <div style={{ marginTop: 12, background: 'linear-gradient(135deg,rgba(249,115,22,0.12),rgba(249,115,22,0.06))', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.35)', marginBottom: 3 }}>Distance</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#f97316', fontFamily: "'Syne',sans-serif" }}>{distance} km</div>
          </div>
          <div style={{ fontSize: 20 }}>📏</div>
        </div>
      )}
    </div>
  )
}