import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot } from "lucide-react";
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

const quickPrompts = [
  { text: "Where should I eat?", emoji: "🍽️" },
  { text: "What to do today?", emoji: "☀️" },
  { text: "Best souvenirs?", emoji: "🎁" },
  { text: "Hidden gems?", emoji: "💎" },
];

export default function Guide() {
  const [prefs, setPrefs] = usePrefs();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const greet = `Hi! I'm **Visi** ✨\n\nI'm your personal AI travel guide for **${prefs.destinationSlug ?? "your city"}**. Set your interests below, then ask me anything — from hidden restaurants to the best photo spots.\n\nWhat shall we discover today?`;
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
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col">
      {/* Header */}
      <header className="relative overflow-hidden px-5 pb-4 pt-7">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 border border-primary/20">
            <Mascot size={44} />
            {/* Online indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold">Visi</h1>
              <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                <Sparkles className="h-2.5 w-2.5" /> AI Guide
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Exploring <span className="text-primary font-medium capitalize">{prefs.destinationSlug ?? "the world"}</span>
            </p>
          </div>
        </div>
      </header>

      {/* Preferences Bar */}
      <div className="px-5 pb-3">
        <div className="rounded-2xl border border-border bg-card/60 p-3 backdrop-blur-sm">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Your preferences</p>
          <div className="flex flex-wrap items-center gap-2">
            {interestOptions.map((i) => {
              const on = prefs.interests.includes(i.id);
              return (
                <button
                  key={i.id}
                  onClick={() => toggleInterest(i.id)}
                  className={`chip transition-all duration-200 ${on ? "chip-active" : ""}`}
                >
                  <span>{i.emoji}</span>
                  <span>{i.label}</span>
                </button>
              );
            })}

            {/* Budget */}
            <div className="ml-auto flex items-center gap-0.5 rounded-full border border-border bg-muted/50 p-0.5">
              {budgets.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setPrefs({ budget: b.id })}
                  className={`rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-200 ${
                    prefs.budget === b.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollerRef} className="flex-1 space-y-4 overflow-y-auto px-5 pb-4 no-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/20 mt-1">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                  m.role === "user"
                    ? "rounded-tr-sm bg-primary text-primary-foreground shadow-[var(--shadow-pop)]"
                    : "rounded-tl-sm border border-border bg-card text-foreground shadow-[var(--shadow-card)]"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-p:my-1 prose-strong:text-primary prose-headings:font-display prose-headings:text-foreground prose-li:text-foreground/90 [&_p]:text-foreground/90">
                    <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {streaming && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-2.5 justify-start"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/20">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3.5 shadow-[var(--shadow-card)]">
                <span className="inline-flex gap-1.5">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-24 bg-gradient-to-t from-background via-background/95 to-transparent px-5 pt-4 pb-2">
        {/* Quick prompts */}
        <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p) => (
            <button
              key={p.text}
              onClick={() => send(p.text)}
              disabled={streaming}
              className="chip shrink-0 transition-all hover:border-primary/40 hover:text-foreground disabled:opacity-50"
            >
              <span>{p.emoji}</span>
              <span>{p.text}</span>
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex items-center gap-2 rounded-2xl border border-border bg-card/90 pl-4 pr-1.5 py-1.5 shadow-[var(--shadow-card)] backdrop-blur-sm focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 transition-all duration-200"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Visi anything…"
            className="flex-1 bg-transparent py-2 text-[15px] text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
