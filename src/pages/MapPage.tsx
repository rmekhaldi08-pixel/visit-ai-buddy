import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { usePrefs } from "@/lib/prefs";
import { Link } from "react-router-dom";

interface Destination { id: string; slug: string; name: string; lat: number; lng: number; }
interface Zone { id: string; name: string; description: string; lat: number; lng: number; color: string; }

export default function MapPage() {
  const [prefs, setPrefs] = usePrefs();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [active, setActive] = useState<Destination | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);

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

  if (!active) return <div className="p-6 text-muted-foreground">Loading map…</div>;

  return (
    <div className="flex h-[100dvh] flex-col">
      <div className="flex items-center gap-2 px-5 pb-3 pt-6">
        <h1 className="font-display text-2xl font-bold">Explore</h1>
        <select
          value={active.slug}
          onChange={(e) => {
            const d = destinations.find((x) => x.slug === e.target.value)!;
            setActive(d);
            setPrefs({ destinationSlug: d.slug });
          }}
          className="ml-auto rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium"
        >
          {destinations.map((d) => (
            <option key={d.id} value={d.slug}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="relative mx-5 mb-28 flex-1 overflow-hidden rounded-2xl shadow-card ring-1 ring-border">
        <MapContainer
          key={active.id}
          center={[active.lat, active.lng]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {zones.map((z) => (
            <CircleMarker
              key={z.id}
              center={[z.lat, z.lng]}
              radius={22}
              pathOptions={{ color: z.color, fillColor: z.color, fillOpacity: 0.35, weight: 2 }}
            >
              <Popup>
                <div className="flex flex-col gap-2">
                  <p className="font-display text-base font-bold">{z.name}</p>
                  <p className="text-xs text-muted-foreground">{z.description}</p>
                  <Link to={`/zone/${z.id}`} className="text-xs font-semibold text-primary underline">
                    Open 3D simulator →
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}