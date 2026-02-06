import { useState } from 'react';
import { ImageOff, ImageIcon } from 'lucide-react';

// Production-ready data URI fallback (tiny, fast, no network required)
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='none'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%2394a3b8'%3EImage Not Found%3C/text%3E%3C/svg%3E";

export default function SafeImage({ src, alt, className, ...props }) {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const handleError = () => {
        setError(true);
        setLoading(false);
    };

    const handleLoad = () => {
        setLoading(false);
    };

    // If no src provided or error occurred, show robust fallback
    if (error || !src) {
        return (
            <div className={`overflow-hidden flex items-center justify-center bg-slate-100 border border-slate-200 ${className}`}>
                <div className="flex flex-col items-center text-slate-400 p-4 text-center">
                    <ImageOff className="w-6 h-6 mb-2 opacity-50" />
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">No Image</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {loading && (
                <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center z-10">
                    <ImageIcon className="w-8 h-8 text-slate-300 animate-bounce" />
                </div>
            )}
            <img
                src={src}
                alt={alt || "Image"}
                className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
                onError={handleError}
                onLoad={handleLoad}
                loading="lazy" // Native lazy loading
                {...props}
            />
        </div>
    );
}
