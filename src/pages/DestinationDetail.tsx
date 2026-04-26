import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Clock, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { imageFor } from "@/lib/images";
import PlaceCard, { PlaceCardData } from "@/components/PlaceCard";
import { usePrefs } from "@/lib/prefs";
import { motion } from "framer-motion";

const cats = [
  { id: "food", label: "Food", emoji: "🍽️" },
  { id: "souvenirs", label: "Souvenirs", emoji: "🛍️" },
  { id: "spots", label: "Sights", emoji: "🏛️" },
  { id: "activities", label: "Activities", emoji: "🎯" },
] as const;

export default function DestinationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setPrefs] = usePrefs();
  const [dest, setDest] = useState<{
    id: string; name: string; country: string; description: string; image_key: string;
  } | null>(null);
  const [places, setPlaces] = useState<PlaceCardData[]>([]);
  const [cat, setCat] = useState<(typeof cats)[number]["id"]>("food");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setPrefs({ destinationSlug: slug });
    supabase.from("destinations").select("*").eq("slug", slug).single().then(({ data }) => {
      if (data) {
        setDest(data);
        supabase.from("places").select("*").eq("destination_id", data.id).then(({ data: p }) =>
          setPlaces((p as PlaceCardData[]) ?? [])
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!dest) {
    return (
      <div className="flex h-[50dvh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading destination…</p>
        </div>
      </div>
    );
  }

  const filtered = places.filter((p) => p.category === cat);

  return (
    <div className="flex flex-col">
      {/* Hero Image */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={imageFor(dest.image_key)}
          alt={dest.name}
          className="h-full w-full object-cover"
        />
        {/* Multi-layer overlay for dark luxury */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-60" />

        {/* Top controls */}
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white transition-all hover:bg-black/60"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>

          <button
            onClick={() => setSaved(!saved)}
            className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm border transition-all ${
              saved
                ? "bg-accent/80 border-accent/50 text-white"
                : "bg-black/40 border-white/10 text-white hover:bg-black/60"
            }`}
          >
            <Heart className={`h-4 w-4 ${saved ? "fill-white" : ""}`} />
          </button>
        </div>

        {/* Hero info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="h-3 w-3 text-primary/80" />
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">{dest.country}</p>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight text-white">{dest.name}</h1>

          {/* Meta badges */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-white">4.9</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur-sm">
              <Clock className="h-3 w-3 text-white/80" />
              <span className="text-xs font-semibold text-white">2–5 days</span>
            </div>
            <div className="rounded-full bg-primary/80 px-2.5 py-1 backdrop-blur-sm">
              <span className="text-xs font-semibold text-white">Top Pick</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5 px-5 pt-5 pb-4">
        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[15px] leading-relaxed text-muted-foreground"
        >
          {dest.description}
        </motion.p>

        {/* Category tabs */}
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`chip shrink-0 text-sm transition-all duration-200 ${
                cat === c.id ? "chip-active" : ""
              }`}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Count */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold capitalize">{cat}</h2>
          <span className="chip">{filtered.length} places</span>
        </div>

        {/* Places grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <PlaceCard place={p} />
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/50 py-12">
            <span className="text-3xl">{cats.find(c => c.id === cat)?.emoji}</span>
            <p className="text-sm text-muted-foreground">Nothing here yet — try another category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
