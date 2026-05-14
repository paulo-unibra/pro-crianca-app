import { Outlet, useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Home, Heart, BookOpen, Info } from "lucide-react";

const NAV_ITEMS = [
  { label: "Início", icon: Home, path: "/" },
  { label: "Doar", icon: Heart, path: "/doar" },
  { label: "Cursos", icon: BookOpen, path: "/cursos" },
  { label: "Sobre", icon: Info, path: "/sobre" },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isPixPage = location.pathname === "/doar/pagamento";
  const isCourseDetail = location.pathname.startsWith("/cursos/");

  const getActiveTab = () => {
    if (location.pathname === "/" ) return "/";
    if (location.pathname.startsWith("/doar")) return "/doar";
    if (location.pathname.startsWith("/cursos")) return "/cursos";
    if (location.pathname.startsWith("/sobre")) return "/sobre";
    return "/";
  };

  const activeTab = getActiveTab();

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)", fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Phone frame wrapper */}
      <div
        className="relative flex flex-col overflow-hidden shadow-2xl"
        style={{
          width: "min(100vw, 430px)",
          height: "min(100vh, 932px)",
          borderRadius: "min(2.5rem, 0px)",
          background: "#F4F7FF",
        }}
      >
        {/* Status Bar */}
        <div
          className="flex items-center justify-between px-6 pt-3 pb-1 shrink-0"
          style={{ background: "#1565C0", color: "white", fontSize: "12px" }}
        >
          <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>9:41</span>
          <div className="flex items-center gap-1">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
              <rect x="0" y="3" width="3" height="9" rx="1" fill="white" opacity="0.4"/>
              <rect x="4.5" y="2" width="3" height="10" rx="1" fill="white" opacity="0.6"/>
              <rect x="9" y="0" width="3" height="12" rx="1" fill="white" opacity="0.8"/>
              <rect x="13.5" y="0" width="3" height="12" rx="1" fill="white"/>
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M8 2.5C10.2 2.5 12.2 3.5 13.6 5.1L15 3.7C13.2 1.8 10.7 0.5 8 0.5C5.3 0.5 2.8 1.8 1 3.7L2.4 5.1C3.8 3.5 5.8 2.5 8 2.5Z" fill="white"/>
              <path d="M8 5.5C9.4 5.5 10.7 6.1 11.6 7.1L13 5.7C11.7 4.3 9.9 3.5 8 3.5C6.1 3.5 4.3 4.3 3 5.7L4.4 7.1C5.3 6.1 6.6 5.5 8 5.5Z" fill="white"/>
              <circle cx="8" cy="10" r="1.5" fill="white"/>
            </svg>
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <div style={{ width: "24px", height: "12px", border: "1.5px solid white", borderRadius: "3px", padding: "1px", display: "flex" }}>
                <div style={{ width: "75%", background: "white", borderRadius: "1px" }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "none" }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </div>

        {/* Bottom Navigation */}
        <div
          className="shrink-0 px-2 pb-4 pt-1"
          style={{
            background: "white",
            borderTop: "1px solid #E8EEF9",
            boxShadow: "0 -4px 20px rgba(21,101,192,0.08)",
          }}
        >
          <div className="flex items-center justify-around">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-200 relative"
                  style={{
                    background: isActive ? "#EEF4FF" : "transparent",
                    minWidth: "72px",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: "#EEF4FF" }}
                      transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                    />
                  )}
                  <div className="relative z-10">
                    {item.label === "Doar" && isActive ? (
                      <div
                        className="rounded-full p-1.5"
                        style={{ background: "#FFD600" }}
                      >
                        <Icon size={20} color="#1565C0" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <Icon
                        size={22}
                        color={isActive ? "#1565C0" : "#9BACC8"}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    )}
                  </div>
                  <span
                    className="relative z-10 text-xs leading-none"
                    style={{
                      color: isActive ? "#1565C0" : "#9BACC8",
                      fontWeight: isActive ? 600 : 400,
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "10px",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
