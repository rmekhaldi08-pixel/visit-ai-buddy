import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home as HomeIcon, Map, Sparkles, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: HomeIcon, end: true },
  { to: "/map", label: "Map", icon: Map },
  { to: "/guide", label: "Guide", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
];

export default function MobileShell() {
  const location = useLocation();
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[440px] flex-col bg-background text-foreground">
      <main className="flex-1 overflow-y-auto pb-24" style={{ paddingTop: "var(--safe-top)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav
        className="glass fixed bottom-0 left-1/2 z-40 w-full max-w-[440px] -translate-x-1/2 border-t border-border/60"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <ul className="grid grid-cols-4">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-1 py-3 text-[10px] font-medium tracking-wide transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-300",
                        isActive
                          ? "bg-primary/15 glow-primary scale-110"
                          : "hover:bg-muted"
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-indicator"
                          className="absolute h-9 w-9 rounded-2xl bg-primary/10"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon
                        className={cn("h-[18px] w-[18px] relative z-10", isActive && "text-primary")}
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />
                    </span>
                    <span className={cn("uppercase tracking-widest", isActive ? "text-primary" : "")}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
