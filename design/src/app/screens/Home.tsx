import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Heart, BookOpen, Users, Star, ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const HERO_IMAGE = "https://images.unsplash.com/photo-1591880311738-5903bdb28d6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGhhcHB5JTIwcGxheWluZyUyMEJyYXppbCUyMGNvbW11bml0eXxlbnwxfHx8fDE3NzYxNjUxODV8MA&ixlib=rb-4.1.0&q=80&w=1080";

const COURSES_PREVIEW = [
  {
    id: "1",
    title: "Informática Básica",
    image: "https://images.unsplash.com/photo-1759143103113-6696d40598bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGVkdWNhdGlvbiUyMGNsYXNzcm9vbSUyMGxlYXJuaW5nJTIwa2lkc3xlbnwxfHx8fDE3NzYxNjUxODl8MA&ixlib=rb-4.1.0&q=80&w=400",
    tag: "Tecnologia",
  },
  {
    id: "2",
    title: "Arte & Criatividade",
    image: "https://images.unsplash.com/photo-1703301287688-c9a306ebed99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwYXJ0JTIwcGFpbnRpbmclMjBjcmVhdGl2ZSUyMHdvcmtzaG9wfGVufDF8fHx8MTc3NjE2NTE5M3ww&ixlib=rb-4.1.0&q=80&w=400",
    tag: "Arte",
  },
];

const IMPACTS = [
  { value: "1.200+", label: "Crianças Atendidas", icon: "👧" },
  { value: "8", label: "Cursos Ativos", icon: "📚" },
  { value: "R$120k", label: "Doações Recebidas", icon: "💛" },
  { value: "15+", label: "Anos de Impacto", icon: "⭐" },
];

function ImpactCard({ value, label, icon, delay }: { value: string; label: string; icon: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex flex-col items-center gap-1 p-3 rounded-2xl"
      style={{ background: "white", flex: "1 1 0", boxShadow: "0 2px 12px rgba(21,101,192,0.08)" }}
    >
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <span style={{ fontFamily: "'Righteous', sans-serif", color: "#1565C0", fontSize: "16px", lineHeight: 1.2 }}>{value}</span>
      <span style={{ fontFamily: "'Poppins', sans-serif", color: "#6B87B0", fontSize: "9px", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
    </motion.div>
  );
}

export function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#F4F7FF", minHeight: "100%" }}>
      {/* Header */}
      <div
        className="px-5 pt-4 pb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1565C0 0%, #1976D2 60%, #1E88E5 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute" style={{ top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div className="absolute" style={{ top: 20, right: 10, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,214,0,0.15)" }} />

        {/* Logo Row */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "#FFD600" }}
            >
              <span style={{ fontSize: "20px" }}>🌟</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Righteous', sans-serif", color: "white", fontSize: "14px", lineHeight: 1.1 }}>Movimento</div>
              <div style={{ fontFamily: "'Righteous', sans-serif", color: "#FFD600", fontSize: "14px", lineHeight: 1.1 }}>Pró Criança</div>
            </div>
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <p style={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>Bem-vindo(a)! 👋</p>
          <h1 style={{ fontFamily: "'Righteous', sans-serif", color: "white", fontSize: "22px", lineHeight: 1.2, marginTop: "2px" }}>
            Cada doação transforma<br />uma vida! 💛
          </h1>
        </motion.div>
      </div>

      {/* Hero Card */}
      <div className="px-4 -mt-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="rounded-3xl overflow-hidden relative"
          style={{ height: "200px", boxShadow: "0 8px 30px rgba(21,101,192,0.2)" }}
        >
          <ImageWithFallback
            src={HERO_IMAGE}
            alt="Crianças felizes"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(21,101,192,0.85) 0%, rgba(21,101,192,0.2) 60%, transparent 100%)" }}
          />
          <div className="absolute bottom-4 left-4 right-4">
            <p style={{ fontFamily: "'Poppins', sans-serif", color: "white", fontSize: "12px", opacity: 0.9 }}>
              Juntos pelo futuro das crianças
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate("/doar")}
              className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-2xl"
              style={{
                background: "#FFD600",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                color: "#1565C0",
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Heart size={16} strokeWidth={2.5} fill="#1565C0" />
              Doar agora
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Impact Stats */}
      <div className="px-4 mt-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} color="#FFD600" />
          <span style={{ fontFamily: "'Righteous', sans-serif", color: "#1565C0", fontSize: "15px" }}>Nosso Impacto</span>
        </div>
        <div className="flex gap-2">
          {IMPACTS.map((item, i) => (
            <ImpactCard key={item.value} {...item} delay={0.15 + i * 0.07} />
          ))}
        </div>
      </div>

      {/* Donate CTA Banner */}
      <div className="px-4 mt-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: "#FFD600" }}
        >
          <div className="absolute" style={{ top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(21,101,192,0.1)" }} />
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontFamily: "'Righteous', sans-serif", color: "#1565C0", fontSize: "16px", lineHeight: 1.2 }}>
                Faça a diferença<br />hoje mesmo!
              </p>
              <p style={{ fontFamily: "'Poppins', sans-serif", color: "#0D47A1", fontSize: "12px", marginTop: "4px", opacity: 0.8 }}>
                Sua doação chega direto<br />para as crianças
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/doar")}
              className="flex items-center gap-1 px-4 py-3 rounded-2xl"
              style={{ background: "#1565C0", color: "white", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "13px", border: "none", cursor: "pointer" }}
            >
              Doe já
              <ArrowRight size={14} />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Courses Preview */}
      <div className="px-4 mt-5 pb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} color="#1565C0" />
            <span style={{ fontFamily: "'Righteous', sans-serif", color: "#1565C0", fontSize: "15px" }}>Cursos em Destaque</span>
          </div>
          <button
            onClick={() => navigate("/cursos")}
            className="flex items-center gap-0.5"
            style={{ fontFamily: "'Poppins', sans-serif", color: "#1976D2", fontSize: "12px", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}
          >
            Ver todos <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {COURSES_PREVIEW.map((course, i) => (
            <motion.button
              key={course.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/cursos/${course.id}`)}
              className="rounded-2xl overflow-hidden shrink-0 text-left"
              style={{ width: "160px", background: "white", boxShadow: "0 2px 12px rgba(21,101,192,0.1)", border: "none", cursor: "pointer" }}
            >
              <div style={{ height: "100px", overflow: "hidden" }}>
                <ImageWithFallback
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <span
                  className="inline-block px-2 py-0.5 rounded-full mb-1"
                  style={{ background: "#EEF4FF", color: "#1565C0", fontSize: "10px", fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
                >
                  {course.tag}
                </span>
                <p style={{ fontFamily: "'Poppins', sans-serif", color: "#1A2D5A", fontSize: "12px", fontWeight: 600, lineHeight: 1.3 }}>{course.title}</p>
              </div>
            </motion.button>
          ))}
          {/* See all card */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/cursos")}
            className="rounded-2xl shrink-0 flex flex-col items-center justify-center gap-2"
            style={{ width: "100px", background: "#EEF4FF", border: "2px dashed #1565C0", cursor: "pointer" }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#1565C0" }}>
              <ArrowRight size={18} color="white" />
            </div>
            <span style={{ fontFamily: "'Poppins', sans-serif", color: "#1565C0", fontSize: "11px", fontWeight: 600 }}>Ver todos</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
