import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { imageFor } from "@/lib/images";
import { motion } from "framer-motion";
import Mascot from "@/components/Mascot";
import PlaceCard, { PlaceCardData } from "@/components/PlaceCard";
import { usePrefs } from "@/lib/prefs";

interface Destination { id: string; slug: string; name: string; country: string; description: string; image_key: string; }

export default function Home() {
  const [q, setQ] = useState("");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [picks, setPicks] = useState<PlaceCardData[]>([]);
  const [prefs] = usePrefs();

  useEffect(() => {
    supabase.from("destinations").select("*").order("name").then(({ data }) => setDestinations(data ?? []));
  }, []);

  useEffect(() => {
    const slug = prefs.destinationSlug ?? "paris";
    supabase.from("destinations").select("id").eq("slug", slug).single().then(({ data }) => {
      if (!data) return;
      supabase.from("places").select("*").eq("destination_id", data.id).limit(6).then(({ data: p }) => setPicks((p as PlaceCardData[]) ?? []));
    });
  }, [prefs.destinationSlug]);

  const filtered = useMemo(
    () => destinations.filter((d) => `${d.name} ${d.country}`.toLowerCase().includes(q.toLowerCase())),
    [destinations, q]
  );

  return (
    <div className="flex flex-col gap-6 px-5 pt-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">VisitAI</p>
        <h1 className="mt-1 font-display text-[2.1rem] font-bold leading-tight">
          Where to next, <span className="italic text-primary">{prefs.name}</span>?
        </h1>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a city or region…"
          className="h-14 w-full rounded-full border border-border bg-card pl-11 pr-4 text-[15px] shadow-card outline-none ring-primary/0 transition focus:ring-2"
        />
      </div>

      <Link
        to="/guide"
        className="relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-warm p-4 text-primary-foreground shadow-pop"
      >
        <Mascot size={64} />
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest opacity-90">Ask Visi</p>
          <p className="font-display text-lg font-bold leading-tight">Plan today in 30 seconds</p>
        </div>
        <Sparkles className="h-5 w-5 opacity-90" />
      </Link>

      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-xl font-bold">Destinations</h2>
          <span className="text-xs text-muted-foreground">{filtered.length} places</span>
        </div>
        <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
          {filtered.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="snap-start"
            >
              <Link
                to={`/destination/${d.slug}`}
                className="relative block h-56 w-44 shrink-0 overflow-hidden rounded-2xl shadow-card"
              >
                <img src={imageFor(d.image_key)} alt={d.name} loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-primary-foreground">
                  <p className="text-[11px] uppercase tracking-widest opacity-90">{d.country}</p>
                  <h3 className="font-display text-lg font-bold leading-tight">{d.name}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold">Picks for you</h2>
        <div className="grid grid-cols-2 gap-3">
          {picks.map((p) => (
            <PlaceCard key={p.id} place={p} />
          ))}
        </div>
      </section>
    </div>
  );
}