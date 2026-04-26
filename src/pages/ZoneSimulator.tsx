import { Suspense, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Html } from "@react-three/drei";
import { supabase } from "@/integrations/supabase/client";

interface Zone { id: string; name: string; description: string; color: string; destination_id: string; }
interface Place { id: string; name: string; description: string; lat: number; lng: number; category: string; }

function Building({ position, color, height }: { position: [number, number, number]; color: string; height: number }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[1, height, 1]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

function Hotspot({ position, place, onSelect, selected }: { position: [number, number, number]; place: Place; onSelect: () => void; selected: boolean }) {
  return (
    <group position={position}>
      <mesh onClick={onSelect}>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial color={selected ? "#FF5A5F" : "#00A699"} emissive={selected ? "#FF5A5F" : "#00A699"} emissiveIntensity={0.5} />
      </mesh>
      {selected && (
        <Html distanceFactor={10} position={[0, 0.8, 0]} center>
          <div className="pointer-events-none w-44 rounded-xl bg-background/95 p-2 text-xs shadow-pop ring-1 ring-border">
            <p className="font-display text-sm font-bold">{place.name}</p>
            <p className="text-muted-foreground">{place.description}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function Scene({ zone, places }: { zone: Zone; places: Place[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const buildings = Array.from({ length: 24 }).map((_, i) => {
    const x = (i % 6) - 2.5;
    const z = Math.floor(i / 6) - 1.5;
    const h = 0.6 + ((i * 37) % 10) / 4;
    return { pos: [x * 1.6, h / 2, z * 1.6] as [number, number, number], h, color: i % 3 === 0 ? "#E8DDD0" : i % 3 === 1 ? "#D9CDB8" : "#C9B89A" };
  });

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 12, 8]} intensity={1.2} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#F4EFE6" />
      </mesh>
      {buildings.map((b, i) => <Building key={i} position={b.pos} color={b.color} height={b.h} />)}
      {places.slice(0, 4).map((p, i) => (
        <Hotspot
          key={p.id}
          place={p}
          selected={selected === p.id}
          onSelect={() => setSelected(selected === p.id ? null : p.id)}
          position={[(i - 1.5) * 2.2, 1.1, 0]}
        />
      ))}
      <OrbitControls enablePan enableZoom enableRotate maxPolarAngle={Math.PI / 2.2} minDistance={6} maxDistance={22} />
    </>
  );
}

export default function ZoneSimulator() {
  const { zoneId } = useParams<{ zoneId: string }>();
  const [zone, setZone] = useState<Zone | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    if (!zoneId) return;
    supabase.from("zones").select("*").eq("id", zoneId).single().then(({ data }) => {
      if (data) {
        setZone(data as Zone);
        supabase.from("places").select("*").eq("zone_id", data.id).then(({ data: p }) => setPlaces((p as Place[]) ?? []));
      }
    });
  }, [zoneId]);

  return (
    <div className="relative h-[100dvh]">
      <Link to="/map" className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow-card">
        <ArrowLeft className="h-5 w-5" />
      </Link>
      {zone && (
        <div className="glass absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border border-border px-4 py-1.5 shadow-card">
          <p className="font-display text-sm font-bold">{zone.name}</p>
        </div>
      )}
      <div className="absolute bottom-32 left-4 z-10 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-card">
        <Info className="h-3.5 w-3.5" /> Drag to rotate · pinch to zoom · tap dots
      </div>
      <Canvas shadows camera={{ position: [10, 7, 10], fov: 45 }}>
        <Suspense fallback={null}>
          {zone && <Scene zone={zone} places={places} />}
        </Suspense>
      </Canvas>
    </div>
  );
}