import { usePrefs } from "@/lib/prefs";
import Mascot from "@/components/Mascot";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  Wallet,
  Heart,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  Star,
} from "lucide-react";

const interestEmojis: Record<string, string> = {
  food: "🍽️",
  souvenirs: "🛍️",
  activities: "🎯",
  spots: "🏛️",
};

export default function Profile() {
  const [prefs, setPrefs] = usePrefs();
  const [destinations, setDestinations] = useState<{ slug: string; name: string }[]>([]);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    supabase.from("destinations").select("slug,name").then(({ data }) => setDestinations(data ?? []));
  }, []);

  const menuItems = [
    { icon: Bell, label: "Notifications", desc: "Manage your alerts" },
    { icon: Shield, label: "Privacy", desc: "Control your data" },
    { icon: HelpCircle, label: "Help & Support", desc: "Get assistance" },
    { icon: Star, label: "Rate the App", desc: "Share your feedback" },
  ];

  return (
    <div className="flex flex-col gap-5 px-5 pb-6 pt-7">
      {/* Aurora glow */}
      <div className="pointer-events-none fixed -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />

      {/* Hero Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
      >
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <Mascot size={60} bouncing={false} />
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              ✓
            </div>
          </div>

          <div className="flex-1">
            {editingName ? (
              <input
                autoFocus
                value={prefs.name}
                onChange={(e) => setPrefs({ name: e.target.value })}
                onBlur={() => setEditingName(false)}
                className="w-full rounded-xl border border-primary/30 bg-background/50 px-3 py-1.5 font-display text-2xl font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <button onClick={() => setEditingName(true)} className="group flex items-center gap-1.5 text-left">
                <h1 className="font-display text-2xl font-bold">{prefs.name ?? "Traveler"}</h1>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
              </button>
            )}
            <p className="mt-0.5 text-sm text-muted-foreground">Global Explorer</p>

            {/* Stats row */}
            <div className="mt-2 flex gap-3">
              <div className="text-center">
                <p className="text-base font-bold text-primary">{destinations.length}</p>
                <p className="text-[10px] text-muted-foreground">Places</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="text-base font-bold text-primary">{prefs.interests.length}</p>
                <p className="text-[10px] text-muted-foreground">Interests</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="text-base font-bold text-primary capitalize">{prefs.budget ?? "—"}</p>
                <p className="text-[10px] text-muted-foreground">Budget</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Destination Picker */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">Current Destination</p>
        </div>
        <select
          value={prefs.destinationSlug ?? ""}
          onChange={(e) => setPrefs({ destinationSlug: e.target.value || null })}
          className="luxury-input"
        >
          <option value="">— Choose a destination —</option>
          {destinations.map((d) => (
            <option key={d.slug} value={d.slug}>{d.name}</option>
          ))}
        </select>
      </motion.section>

      {/* Budget */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/15">
            <Wallet className="h-4 w-4 text-secondary" />
          </div>
          <p className="text-sm font-semibold text-foreground">Travel Budget</p>
        </div>
        <div className="flex gap-2">
          {(["low", "medium", "high"] as const).map((b) => {
            const labels = { low: "Budget $", medium: "Mid $$", high: "Luxury $$$" };
            return (
              <button
                key={b}
                onClick={() => setPrefs({ budget: b })}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                  prefs.budget === b
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-pop)]"
                    : "border border-border bg-muted/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {labels[b]}
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* Interests */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15">
            <Heart className="h-4 w-4 text-accent" />
          </div>
          <p className="text-sm font-semibold text-foreground">Your Interests</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {prefs.interests.length > 0 ? (
            prefs.interests.map((i) => (
              <span key={i} className="chip chip-active capitalize">
                {interestEmojis[i] ?? "✨"} {i}
              </span>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No interests set — head to Guide to pick some!
            </p>
          )}
        </div>
      </motion.section>

      {/* Settings Menu */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden"
      >
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            className={`flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50 ${
              i < menuItems.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </motion.section>

      <p className="text-center text-xs text-muted-foreground">VisitAI · v0.1 · Made with ❤️</p>
    </div>
  );
}
