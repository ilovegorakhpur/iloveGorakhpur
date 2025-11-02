
import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { MapPinIcon, ShoppingCartIcon, ServicesIcon, TicketIcon, XIcon } from './icons';
import type { LocalEvent, Product, ServiceListing } from '../types';

type MapItem = (LocalEvent | Product | ServiceListing) & { type: 'event' | 'product' | 'service' };

const MapView: React.FC = () => {
    const { events, products, services } = useContent();
    const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);

    const mapItems: MapItem[] = [
        ...events.map(e => ({ ...e, type: 'event' as const })),
        ...products.map(p => ({ ...p, type: 'product' as const })),
        ...services.map(s => ({ ...s, type: 'service' as const })),
    ];

    const getPinIcon = (type: MapItem['type']) => {
        switch (type) {
            case 'event': return <TicketIcon />;
            case 'product': return <ShoppingCartIcon className="h-5 w-5" />;
            case 'service': return <ServicesIcon />;
            default: return <MapPinIcon className="h-5 w-5" />;
        }
    };

    return (
        <section id="map-view" className="py-16 sm:py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center">
                        <MapPinIcon />
                        <span className="ml-3">Explore Gorakhpur</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">Discover points of interest on our interactive city map.</p>
                </div>
                
                <div className="max-w-5xl mx-auto aspect-video bg-gray-200 rounded-2xl shadow-lg overflow-hidden relative" style={{ backgroundImage: "url('https://api.maptiler.com/maps/streets/256/14/8953/6122.png?key=get_a_key_from_maptiler_website')", backgroundSize: 'cover' }}>
                    {mapItems.map(item => (
                        <button
                            key={`${item.type}-${item.id}`}
                            onClick={() => setSelectedItem(item)}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2"
                            style={{ top: `${item.coordinates.lat}%`, left: `${item.coordinates.lng}%` }}
                            aria-label={`View ${'title' in item ? item.title : item.name}`}
                        >
                            <div className="relative">
                                <MapPinIcon className="h-10 w-10 text-red-500 drop-shadow-lg" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-white">
                                    {getPinIcon(item.type)}
                                </div>
                            </div>
                        </button>
                    ))}

                    {selectedItem && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl w-full max-w-sm animate-fade-in-up">
                             <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-orange-600">{selectedItem.type}</p>
                                        <h3 className="font-bold text-gray-800">{'title' in selectedItem ? selectedItem.title : selectedItem.name}</h3>
                                    </div>
                                    <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600"><XIcon /></button>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    {'description' in selectedItem ? selectedItem.description?.substring(0, 100) + '...' : ''}
                                    {'location' in selectedItem ? `Location: ${selectedItem.location}` : ''}
                                </p>
                                <div className="mt-3">
                                     <button className="text-sm font-semibold text-orange-600 hover:underline">View Details</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default MapView;
