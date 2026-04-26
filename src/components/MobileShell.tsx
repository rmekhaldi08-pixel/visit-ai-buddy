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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <nav
        className="glass fixed bottom-0 left-1/2 z-40 w-full max-w-[440px] -translate-x-1/2 border-t border-border"
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
                    "flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full transition-all",
                        isActive && "bg-primary-soft"
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                    </span>
                    {label}
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