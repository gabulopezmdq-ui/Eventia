'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    Autocomplete,
} from '@react-google-maps/api';
import { MapPin, Search, Loader2 } from 'lucide-react';

const containerStyle = {
    width: '100%',
    height: '350px',
    borderRadius: '1rem',
};

const defaultCenter = {
    lat: -34.6037, // Buenos Aires por defecto
    lng: -58.3816,
};

const libraries: any = ['places'];

interface MapPickerProps {
    onLocationSelect: (location: {
        address: string;
        lat: number;
        lng: number;
    }) => void;
    initialAddress?: string;
    initialLat?: number;
    initialLng?: number;
}

export default function MapPicker({
    onLocationSelect,
    initialAddress = '',
    initialLat,
    initialLng,
}: MapPickerProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
        initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
    );
    const [address, setAddress] = useState(initialAddress);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const onSelectLocation = useCallback((lat: number, lng: number, addr: string) => {
        setMarkerPosition({ lat, lng });
        setAddress(addr);
        onLocationSelect({ address: addr, lat, lng });
    }, [onLocationSelect]);

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            // Geocodificación inversa para obtener la dirección al hacer clic
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results?.[0]) {
                    onSelectLocation(lat, lng, results[0].formatted_address);
                }
            });
        }
    }, [onSelectLocation]);

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const addr = place.formatted_address || '';

                onSelectLocation(lat, lng, addr);

                if (map) {
                    map.panTo({ lat, lng });
                    map.setZoom(17);
                }
            }
        }
    };

    const onLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
    }, []);

    if (loadError) {
        return (
            <div className="w-full h-[400px] flex flex-col items-center justify-center bg-red-500/5 border border-red-500/20 rounded-2xl gap-3 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                    <MapPin className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-red-500 font-semibold">Error al cargar el mapa</h3>
                <p className="text-neutral-500 text-sm max-w-xs">
                    Hubo un problema con la API de Google Maps. Por favor, verifica tu API Key y configuraciones.
                </p>
                <div className="mt-2 p-2 bg-neutral-900 rounded-lg border border-neutral-800">
                    <code className="text-[10px] text-neutral-400">
                        {loadError.message}
                    </code>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-[400px] flex flex-col items-center justify-center bg-neutral-900/40 border border-neutral-800/50 rounded-2xl gap-3">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-neutral-500 text-sm animate-pulse">Cargando Google Maps...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 ml-1">
                    Buscar Dirección
                </label>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 transition-colors group-focus-within:text-purple-400" />
                    <Autocomplete
                        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                        onPlaceChanged={onPlaceChanged}
                    >
                        <input
                            type="text"
                            placeholder="Escribe la dirección del evento..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-white outline-none placeholder:text-neutral-600"
                        />
                    </Autocomplete>
                </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={markerPosition || defaultCenter}
                    zoom={markerPosition ? 17 : 12}
                    onLoad={onLoad}
                    onClick={onMapClick}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                        styles: [
                            {
                                elementType: 'geometry',
                                stylers: [{ color: '#212121' }],
                            },
                            {
                                elementType: 'labels.icon',
                                stylers: [{ visibility: 'off' }],
                            },
                            {
                                elementType: 'labels.text.fill',
                                stylers: [{ color: '#757575' }],
                            },
                            {
                                elementType: 'labels.text.stroke',
                                stylers: [{ color: '#212121' }],
                            },
                            {
                                featureType: 'administrative',
                                elementType: 'geometry',
                                stylers: [{ color: '#757575' }],
                            },
                            {
                                featureType: 'poi',
                                elementType: 'geometry',
                                stylers: [{ color: '#181818' }],
                            },
                            {
                                featureType: 'road',
                                elementType: 'geometry.fill',
                                stylers: [{ color: '#2c2c2c' }],
                            },
                            {
                                featureType: 'water',
                                elementType: 'geometry',
                                stylers: [{ color: '#000000' }],
                            },
                        ],
                    }}
                >
                    {markerPosition && (
                        <Marker
                            position={markerPosition}
                            draggable={true}
                            onDragEnd={(e) => {
                                if (e.latLng) {
                                    const lat = e.latLng.lat();
                                    const lng = e.latLng.lng();
                                    const geocoder = new google.maps.Geocoder();
                                    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                                        if (status === 'OK' && results?.[0]) {
                                            onSelectLocation(lat, lng, results[0].formatted_address);
                                        }
                                    });
                                }
                            }}
                        />
                    )}
                </GoogleMap>

                {/* Coordenadas Badge */}
                {markerPosition && (
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                        <div className="px-3 py-1.5 rounded-lg bg-neutral-900/90 border border-neutral-700/50 backdrop-blur-md flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-purple-400" />
                            <span className="text-[10px] font-mono text-neutral-400">
                                {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
