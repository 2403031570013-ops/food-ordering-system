import { motion } from 'framer-motion';
import { MapPin, Clock, Phone } from 'lucide-react';
import { isHotelOpen, calculateDistance } from '../utils/helpers';

export default function HotelCard({ hotel, userLocation }) {
  const isOpen = isHotelOpen(hotel.openTime, hotel.closeTime);
  const distance =
    userLocation && hotel.location
      ? calculateDistance(
          userLocation.lat,
          userLocation.lng,
          hotel.location.lat,
          hotel.location.lng
        )
      : null;

  return (
    <motion.div whileHover={{ y: -10 }} className="glass-card overflow-hidden">
      <div className="relative h-40 overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-semibold text-white ${
            isOpen ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {isOpen ? 'Open Now' : 'Closed'}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{hotel.name}</h3>

        {/* Address */}
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
          <p className="text-sm text-slate-600">{hotel.address}</p>
        </div>

        {/* Timings */}
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-orange-600" />
          <p className="text-sm text-slate-600">
            {hotel.openTime} - {hotel.closeTime}
          </p>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2 mb-3">
          <Phone className="w-4 h-4 text-orange-600" />
          <p className="text-sm text-slate-600">{hotel.phone}</p>
        </div>

        {/* Distance */}
        {distance && (
          <div className="mb-3 p-2 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold text-blue-900">
              📍 {distance} km away
            </p>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full btn-primary"
        >
          View Menu
        </motion.button>
      </div>
    </motion.div>
  );
}
