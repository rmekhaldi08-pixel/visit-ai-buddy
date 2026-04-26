import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { imageFor } from "@/lib/images";
import PlaceCard, { PlaceCardData } from "@/components/PlaceCard";
import { usePrefs } from "@/lib/prefs";

const cats = [
  { id: "food", label: "Food 🍽️" },
  { id: "souvenirs", label: "Souvenirs 🛍️" },
  { id: "spots", label: "Sights 🏛️" },
  { id: "activities", label: "Activities 🎯" },
] as const;

export default function DestinationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setPrefs] = usePrefs();
  const [dest, setDest] = useState<{ id: string; name: string; country: string; description: string; image_key: string } | null>(null);
  const [places, setPlaces] = useState<PlaceCardData[]>([]);
  const [cat, setCat] = useState<(typeof cats)[number]["id"]>("food");

  useEffect(() => {
    if (!slug) return;
    setPrefs({ destinationSlug: slug });
    supabase.from("destinations").select("*").eq("slug", slug).single().then(({ data }) => {
      if (data) {
        setDest(data);
        supabase.from("places").select("*").eq("destination_id", data.id).then(({ data: p }) => setPlaces((p as PlaceCardData[]) ?? []));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!dest) return <div className="p-6 text-muted-foreground">Loading…</div>;

  const filtered = places.filter((p) => p.category === cat);

  return (
    <div className="flex flex-col">
      <div className="relative h-72 overflow-hidden">
        <img src={imageFor(dest.image_key)} alt={dest.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-black/30" />
        <Link to="/" className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow-card">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="absolute bottom-4 left-5 right-5 text-primary-foreground">
          <p className="flex items-center gap-1 text-xs uppercase tracking-widest opacity-90">
            <MapPin className="h-3 w-3" /> {dest.country}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight">{dest.name}</h1>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 pt-4">
        <p className="text-[15px] leading-relaxed text-muted-foreground">{dest.description}</p>

        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                cat === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p) => <PlaceCard key={p.id} place={p} />)}
        </div>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">Nothing here yet — try another category.</p>
        )}
      </div>
    </div>
  );
}