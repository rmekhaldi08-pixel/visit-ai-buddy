import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Mascot from "@/components/Mascot";
import { usePrefs, Interest } from "@/lib/prefs";
import { toast } from "@/hooks/use-toast";

type Msg = { role: "user" | "assistant"; content: string };

const interestOptions: { id: Interest; label: string; emoji: string }[] = [
  { id: "food", label: "Food", emoji: "🍽️" },
  { id: "souvenirs", label: "Souvenirs", emoji: "🛍️" },
  { id: "activities", label: "Activities", emoji: "🎯" },
  { id: "spots", label: "Sights", emoji: "🏛️" },
];
const budgets = [
  { id: "low", label: "$" },
  { id: "medium", label: "$$" },
  { id: "high", label: "$$$" },
] as const;

export default function Guide() {
  const [prefs, setPrefs] = usePrefs();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const greet = `Hi! I'm Visi 👋 Pick what you're into below and I'll plan your day in ${prefs.destinationSlug ?? "your city"}.`;
    setMessages([{ role: "assistant", content: greet }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const toggleInterest = (i: Interest) => {
    const set = new Set(prefs.interests);
    set.has(i) ? set.delete(i) : set.add(i);
    setPrefs({ interests: Array.from(set) });
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setStreaming(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guide-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: next,
          destination: prefs.destinationSlug,
          interests: prefs.interests,
          budget: prefs.budget,
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast({ title: "Slow down", description: "Too many requests, try again in a moment." });
        else if (resp.status === 402) toast({ title: "Out of AI credits", description: "Add credits in Settings → Workspace → Usage." });
        else toast({ title: "Guide unavailable", description: "Please try again." });
        setStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      let done = false;
      while (!done) {
        const r = await reader.read();
        if (r.done) break;
        buf += decoder.decode(r.value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") { done = true; break; }
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              acc += delta;
              setMessages((m) => m.map((msg, i) => (i === m.length - 1 ? { ...msg, content: acc } : msg)));
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Network error", description: "Couldn't reach the guide." });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col px-5 pt-6">
      <header className="flex items-center gap-3">
        <Mascot size={56} />
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Your guide</p>
          <h1 className="font-display text-2xl font-bold">Visi</h1>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap gap-2">
        {interestOptions.map((i) => {
          const on = prefs.interests.includes(i.id);
          return (
            <button
              key={i.id}
              onClick={() => toggleInterest(i.id)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
              }`}
            >
              {i.emoji} {i.label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {budgets.map((b) => (
            <button
              key={b.id}
              onClick={() => setPrefs({ budget: b.id })}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                prefs.budget === b.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollerRef} className="mt-4 flex-1 space-y-3 overflow-y-auto pb-4">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug shadow-card ${
                  m.role === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-card text-foreground"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-p:my-1">
                    <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
              </div>
            </motion.div>
          ))}
          {streaming && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-card px-4 py-3 shadow-card">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </span>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="sticky bottom-24 -mx-5 px-5">
        <div className="flex gap-2">
          {["Where should I eat?", "What to do today?", "Best souvenirs?"].map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="mt-3 flex items-center gap-2 rounded-full border border-border bg-card pl-4 pr-1.5 shadow-card"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Visi anything…"
            className="flex-1 bg-transparent py-3 text-[15px] outline-none"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}