import { Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { imageFor } from "@/lib/images";

export interface PlaceCardData {
  id: string;
  name: string;
  description: string;
  rating: number;
  price_level: number;
  image_key: string;
  category: string;
}

const categoryEmoji: Record<string, string> = {
  food: "🍽️",
  souvenirs: "🛍️",
  spots: "🏛️",
  activities: "🎯",
};

export default function PlaceCard({ place, onClick }: { place: PlaceCardData; onClick?: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group flex w-full flex-col overflow-hidden rounded-2xl bg-card text-left shadow-card ring-1 ring-border/60"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={imageFor(place.image_key)}
          alt={place.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium shadow-sm">
          {categoryEmoji[place.category] ?? "📍"} {place.category}
        </span>
      </div>
      <div className="flex flex-col gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-display text-base font-bold">{place.name}</h3>
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            {place.rating}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{place.description}</p>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{"€".repeat(place.price_level)}</span>
        </div>
      </div>
    </motion.button>
  );
}