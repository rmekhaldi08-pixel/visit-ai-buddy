import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, TrendingUp, MapPin, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { imageFor } from "@/lib/images";
import { motion } from "framer-motion";
import Mascot from "@/components/Mascot";
import PlaceCard, { PlaceCardData } from "@/components/PlaceCard";
import { usePrefs } from "@/lib/prefs";

interface Destination {
  id: string;
  slug: string;
  name: string;
  country: string;
  description: string;
  image_key: string;
}

const filterTags = ["All", "Popular", "Hidden Gems", "Romantic", "Adventure"];

export default function Home() {
  const [q, setQ] = useState("");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [picks, setPicks] = useState<PlaceCardData[]>([]);
  const [activeTag, setActiveTag] = useState("All");
  const [prefs] = usePrefs();

  useEffect(() => {
    supabase.from("destinations").select("*").order("name").then(({ data }) => setDestinations(data ?? []));
  }, []);

  useEffect(() => {
    const slug = prefs.destinationSlug ?? "paris";
    supabase.from("destinations").select("id").eq("slug", slug).single().then(({ data }) => {
      if (!data) return;
      supabase.from("places").select("*").eq("destination_id", data.id).limit(6).then(({ data: p }) =>
        setPicks((p as PlaceCardData[]) ?? [])
      );
    });
  }, [prefs.destinationSlug]);

  const filtered = useMemo(
    () => destinations.filter((d) => `${d.name} ${d.country}`.toLowerCase().includes(q.toLowerCase())),
    [destinations, q]
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-7 pb-4">
      {/* Hero Header */}
      <div className="relative overflow-hidden px-5 pb-6 pt-8">
        {/* Aurora glow behind header */}
        <div className="pointer-events-none absolute -top-10 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/80">{greeting}</p>
          <h1 className="mt-1 font-display text-[2.4rem] font-bold leading-tight text-foreground">
            Where to next,{" "}
            <span className="italic text-primary glow-text">{prefs.name ?? "Explorer"}</span>?
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Discover places curated just for you.</p>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div
        className="px-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a city or destination…"
            className="h-13 w-full rounded-2xl border border-border bg-card/80 pl-11 pr-4 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary/40 focus:ring-2 focus:ring-primary/15 shadow-[var(--shadow-card)]"
          />
        </div>

        {/* Filter chips */}
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`chip shrink-0 transition-all duration-200 ${activeTag === tag ? "chip-active" : ""}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Ask Visi Banner */}
      <motion.div
        className="px-5"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <Link
          to="/guide"
          className="relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 shadow-[var(--shadow-pop)]"
          style={{ background: "var(--gradient-hero)" }}
        >
          {/* Decorative orb */}
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
          <div className="pointer-events-none absolute -bottom-4 right-16 h-16 w-16 rounded-full bg-black/10 blur-lg" />

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Mascot size={44} />
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">AI Travel Guide</p>
            <p className="font-display text-xl font-bold leading-tight text-white">Plan your day in 30s</p>
            <p className="mt-0.5 text-xs text-white/70">Ask Visi anything about your destination</p>
          </div>
          <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        </Link>
      </motion.div>

      {/* Destinations */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-5">
          <h2 className="font-display text-2xl font-bold">
            <TrendingUp className="mr-2 inline h-4 w-4 text-primary" />
            Destinations
          </h2>
          <span className="chip">{filtered.length} places</span>
        </div>

        <div className="-mx-0 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 no-scrollbar">
          {filtered.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="snap-start"
            >
              <Link
                to={`/destination/${d.slug}`}
                className="group relative block h-60 w-44 shrink-0 overflow-hidden rounded-2xl shadow-[var(--shadow-card)]"
              >
                <img
                  src={imageFor(d.image_key)}
                  alt={d.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Dark overlay with purple tint */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-60" />

                {/* Rating badge */}
                <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 backdrop-blur-sm">
                  <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-[10px] font-semibold text-white">4.8</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/70">
                    <MapPin className="h-2.5 w-2.5" /> {d.country}
                  </p>
                  <h3 className="font-display text-lg font-bold leading-tight text-white">{d.name}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Picks for you */}
      <section className="flex flex-col gap-3 px-5">
        <h2 className="font-display text-2xl font-bold">Picks for you</h2>
        <div className="grid grid-cols-2 gap-3">
          {picks.map((p) => (
            <PlaceCard key={p.id} place={p} />
          ))}
        </div>
        {picks.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/50 py-10">
            <p className="text-sm text-muted-foreground">Select a destination to see picks</p>
          </div>
        )}
      </section>
    </div>
  );
}
