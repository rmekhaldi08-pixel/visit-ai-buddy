import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5">
      {/* Glow orb */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center gap-5 text-center"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
          <Compass className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary/80">Lost in transit</p>
          <h1 className="mt-2 font-display text-6xl font-bold text-foreground">404</h1>
          <p className="mt-2 text-lg text-muted-foreground">This destination doesn't exist.</p>
        </div>

        <Link
          to="/"
          className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-pop)] transition-all hover:opacity-90 active:scale-95"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
