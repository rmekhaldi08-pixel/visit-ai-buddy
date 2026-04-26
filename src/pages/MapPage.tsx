import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { usePrefs } from "@/lib/prefs";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, Layers, Navigation } from "lucide-react";

interface Destination { id: string; slug: string; name: string; lat: number; lng: number; }
interface Zone { id: string; name: string; description: string; lat: number; lng: number; color: string; }

export default function MapPage() {
  const [prefs, setPrefs] = usePrefs();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [active, setActive] = useState<Destination | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    supabase.from("destinations").select("*").then(({ data }) => {
      const list = (data as Destination[]) ?? [];
      setDestinations(list);
      const sel = list.find((d) => d.slug === prefs.destinationSlug) ?? list[0];
      if (sel) setActive(sel);
    });
  }, [prefs.destinationSlug]);

  useEffect(() => {
    if (!active) return;
    supabase.from("zones").select("*").eq("destination_id", active.id).then(({ data }) => setZones((data as Zone[]) ?? []));
  }, [active]);

  if (!active) {
    return (
      <div className="flex h-[100dvh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading map…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[100dvh] flex-col">
      {/* Top Bar */}
      <div className="relative z-10 px-5 pb-3 pt-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-primary/80">Explore</p>
            <h1 className="font-display text-2xl font-bold">{active.name}</h1>
          </div>

          {/* Destination picker */}
          <div className="relative">
            <button
              onClick={() => setShowSelector(!showSelector)}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium shadow-[var(--shadow-card)] transition-all hover:border-primary/40"
            >
              <Navigation className="h-3.5 w-3.5 text-primary" />
              {active.name}
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${showSelector ? "rotate-180" : ""}`} />
            </button>

            {showSelector && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 top-full mt-1 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-pop)] z-20"
              >
                {destinations.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setActive(d);
                      setPrefs({ destinationSlug: d.slug });
                      setShowSelector(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-muted ${
                      active.id === d.id ? "text-primary font-medium" : "text-foreground"
                    }`}
                  >
                    {active.id === d.id && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    {d.name}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Zones count */}
        <div className="mt-2 flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{zones.length} zones to explore</span>
        </div>
      </div>

      {/* Map */}
      <div className="relative mx-4 mb-28 flex-1 overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]">
        <MapContainer
          key={active.id}
          center={[active.lat, active.lng]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
          className="rounded-2xl"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          />
          {zones.map((z) => (
            <CircleMarker
              key={z.id}
              center={[z.lat, z.lng]}
              radius={24}
              pathOptions={{
                color: "hsl(252, 87%, 68%)",
                fillColor: "hsl(252, 87%, 68%)",
                fillOpacity: 0.25,
                weight: 2,
              }}
            >
              <Popup className="dark-popup">
                <div className="min-w-[160px] rounded-xl bg-card p-3">
                  <div
                    className="mb-1.5 h-1 w-8 rounded-full"
                    style={{ backgroundColor: z.color }}
                  />
                  <p className="font-display text-base font-bold text-foreground">{z.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{z.description}</p>
                  <Link
                    to={`/zone/${z.id}`}
                    className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Open 3D view →
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      {zones.length > 0 && (
        <div className="absolute bottom-32 left-4 z-10">
          <div className="glass rounded-xl border border-border px-3 py-2 shadow-[var(--shadow-card)]">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Zones</p>
            {zones.slice(0, 3).map((z) => (
              <div key={z.id} className="flex items-center gap-2 py-0.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: z.color }} />
                <span className="text-xs text-foreground">{z.name}</span>
              </div>
            ))}
            {zones.length > 3 && (
              <p className="mt-0.5 text-[10px] text-muted-foreground">+{zones.length - 3} more</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
