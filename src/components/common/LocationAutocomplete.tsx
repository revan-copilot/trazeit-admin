import React, { useEffect, useRef, useState } from 'react';

interface LocationAutocompleteProps {
    onLocationSelect: (address: {
        address1: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
        lat: number;
        lng: number;
    }) => void;
    placeholder?: string;
    className?: string;
    initialValue?: string;
}

declare global {
    interface Window {
        google: any;
        initAutocomplete: () => void;
    }
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ 
    onLocationSelect, 
    placeholder = "Search for a location...",
    className = "",
    initialValue = ""
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);
    const [inputValue, setInputValue] = useState(initialValue);

    useEffect(() => {
        setInputValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const loadGoogleMapsScript = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                initAutocomplete();
                return;
            }

            // Check if script is already being loaded
            if (document.getElementById('google-maps-script')) {
                return;
            }

            const script = document.createElement('script');
            script.id = 'google-maps-script';
            // Note: The user will need to provide a valid API key here or via env
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                if (window.google) initAutocomplete();
            };
            document.head.appendChild(script);
        };

        const initAutocomplete = () => {
            if (!inputRef.current || !window.google) return;

            autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                fields: ["address_components", "geometry", "formatted_address"],
                types: ["address"],
            });

            autocompleteRef.current.addListener("place_changed", () => {
                const place = autocompleteRef.current.getPlace();
                if (!place.geometry) return;

                const addressComponents = place.address_components;
                let address1 = "";
                let city = "";
                let state = "";
                let country = "";
                let postalCode = "";

                for (const component of addressComponents) {
                    const componentType = component.types[0];
                    switch (componentType) {
                        case "street_number":
                            address1 = component.long_name + " " + address1;
                            break;
                        case "route":
                            address1 += component.long_name;
                            break;
                        case "locality":
                            city = component.long_name;
                            break;
                        case "administrative_area_level_1":
                            state = component.long_name;
                            break;
                        case "country":
                            country = component.long_name;
                            break;
                        case "postal_code":
                            postalCode = component.long_name;
                            break;
                    }
                }

                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();

                setInputValue(place.formatted_address);
                onLocationSelect({
                    address1: address1.trim(),
                    city,
                    state,
                    country,
                    postalCode,
                    lat,
                    lng
                });
            });
        };

        loadGoogleMapsScript();

        return () => {
            // Cleanup listeners if needed
            if (window.google && window.google.maps && window.google.maps.event && autocompleteRef.current) {
                window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, []);

    return (
        <div className="relative w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${className}`}
            />
        </div>
    );
};

export default LocationAutocomplete;
