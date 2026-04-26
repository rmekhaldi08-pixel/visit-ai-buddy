import { usePrefs } from "@/lib/prefs";
import Mascot from "@/components/Mascot";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const [prefs, setPrefs] = usePrefs();
  const [destinations, setDestinations] = useState<{ slug: string; name: string }[]>([]);

  useEffect(() => {
    supabase.from("destinations").select("slug,name").then(({ data }) => setDestinations(data ?? []));
  }, []);

  return (
    <div className="flex flex-col gap-6 px-5 pt-6">
      <header className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
          <Mascot size={68} bouncing={false} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Hello,</p>
          <h1 className="font-display text-2xl font-bold">{prefs.name}</h1>
        </div>
      </header>

      <section className="flex flex-col gap-2 rounded-2xl bg-card p-4 shadow-card">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Display name</label>
        <input
          value={prefs.name}
          onChange={(e) => setPrefs({ name: e.target.value })}
          className="rounded-xl border border-border bg-background px-3 py-2 text-base"
        />
      </section>

      <section className="flex flex-col gap-2 rounded-2xl bg-card p-4 shadow-card">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Current destination</label>
        <select
          value={prefs.destinationSlug ?? ""}
          onChange={(e) => setPrefs({ destinationSlug: e.target.value || null })}
          className="rounded-xl border border-border bg-background px-3 py-2 text-base"
        >
          <option value="">— choose —</option>
          {destinations.map((d) => (
            <option key={d.slug} value={d.slug}>{d.name}</option>
          ))}
        </select>
      </section>

      <section className="rounded-2xl bg-card p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Saved interests</p>
        <p className="mt-2 font-display text-lg">
          {prefs.interests.length ? prefs.interests.map((i) => `#${i}`).join("  ") : "No interests set yet"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Budget · {prefs.budget}</p>
      </section>

      <p className="pt-4 text-center text-xs text-muted-foreground">VisitAI · v0.1 · Built with ❤️</p>
    </div>
  );
}