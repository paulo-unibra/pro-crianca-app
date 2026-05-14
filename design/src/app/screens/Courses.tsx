import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { BookOpen, Clock, Users, ChevronRight, Search } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";

export const COURSES_DATA = [
  {
    id: "1",
    title: "Informática Básica",
    description: "Aprenda o básico de computação, internet e ferramentas digitais para o dia a dia.",
    image: "https://images.unsplash.com/photo-1759143103113-6696d40598bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGVkdWNhdGlvbiUyMGNsYXNzcm9vbSUyMGxlYXJuaW5nJTIwa2lkc3xlbnwxfHx8fDE3NzYxNjUxODl8MA&ixlib=rb-4.1.0&q=80&w=800",
    tag: "Tecnologia",
    tagColor: "#3B82F6",
    tagBg: "#EFF6FF",
    duration: "3 meses",
    students: "45 vagas",
    level: "Iniciante",
    available: true,
  },
  {
    id: "2",
    title: "Arte & Criatividade",
    description: "Explore pintura, desenho, artesanato e expressão criativa em atividades lúdicas.",
    image: "https://images.unsplash.com/photo-1703301287688-c9a306ebed99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwYXJ0JTIwcGFpbnRpbmclMjBjcmVhdGl2ZSUyMHdvcmtzaG9wfGVufDF8fHx8MTc3NjE2NTE5M3ww&ixlib=rb-4.1.0&q=80&w=800",
    tag: "Arte",
    tagColor: "#EC4899",
    tagBg: "#FDF2F8",
    duration: "2 meses",
    students: "30 vagas",
    level: "Todos os níveis",
    available: true,
  },
  {
    id: "3",
    title: "Reforço Escolar",
    description: "Apoio pedagógico em matemática, português e ciências para crianças do ensino fundamental.",
    image: "https://images.unsplash.com/photo-1762475833776-fd57865db4d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZCUyMHJlYWRpbmclMjBib29rcyUyMGxpYnJhcnklMjBzY2hvb2x8ZW58MXx8fHwxNzc2MTY1MTkzfDA&ixlib=rb-4.1.0&q=80&w=800",
    tag: "Educação",
    tagColor: "#10B981",
    tagBg: "#ECFDF5",
    duration: "Semestral",
    students: "60 vagas",
    level: "6-14 anos",
    available: true,
  },
  {
    id: "4",
    title: "Música & Dança",
    description: "Ritmo, expressão corporal e música como ferramenta de desenvolvimento e alegria.",
    image: "https://images.unsplash.com/photo-1758874961449-37e171a41223?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMG11c2ljJTIwZGFuY2UlMjBqb3klMjBzbWlsaW5nfGVufDF8fHx8MTc3NjE2NTE5NHww&ixlib=rb-4.1.0&q=80&w=800",
    tag: "Cultura",
    tagColor: "#8B5CF6",
    tagBg: "#F5F3FF",
    duration: "4 meses",
    students: "40 vagas",
    level: "4-12 anos",
    available: true,
  },
  {
    id: "5",
    title: "Esportes & Cidadania",
    description: "Futebol, brincadeiras coletivas e educação em valores como respeito e cooperação.",
    image: "https://images.unsplash.com/photo-1767902012345-bd31f0ba76d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMHNwb3J0cyUyMG91dGRvb3IlMjBzb2NjZXIlMjBraWRzfGVufDF8fHx8MTc3NjE2NTE5N3ww&ixlib=rb-4.1.0&q=80&w=800",
    tag: "Esporte",
    tagColor: "#F59E0B",
    tagBg: "#FFFBEB",
    duration: "Anual",
    students: "80 vagas",
    level: "6-16 anos",
    available: false,
  },
];

const CATEGORIES = ["Todos", "Tecnologia", "Arte", "Educação", "Cultura", "Esporte"];

export function Courses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filtered = COURSES_DATA.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "Todos" || c.tag === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ background: "#F4F7FF", minHeight: "100%" }}>
      {/* Header */}
      <div
        className="px-5 pt-4 pb-8"
        style={{ background: "linear-gradient(160deg, #1565C0 0%, #1976D2 100%)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FFD600" }}>
            <BookOpen size={16} color="#1565C0" />
          </div>
          <h1 style={{ fontFamily: "'Righteous', sans-serif", color: "white", fontSize: "20px" }}>
            Nossos Cursos
          </h1>
        </div>
        <p style={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255,255,255,0.75)", fontSize: "12px" }}>
          Formação gratuita para crianças e adolescentes
        </p>

        {/* Search */}
        <div
          className="flex items-center gap-2 mt-4 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.2)" }}
        >
          <Search size={16} color="rgba(255,255,255,0.7)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar curso..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "'Poppins', sans-serif",
              color: "white",
              fontSize: "13px",
              flex: 1,
            }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 -mt-5 relative z-10">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className="shrink-0 px-4 py-2 rounded-full"
              style={{
                background: activeCategory === cat ? "#1565C0" : "white",
                color: activeCategory === cat ? "white" : "#6B87B0",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: activeCategory === cat ? 600 : 400,
                fontSize: "12px",
                border: activeCategory === cat ? "none" : "1.5px solid #E8EEF9",
                boxShadow: activeCategory === cat ? "0 4px 12px rgba(21,101,192,0.3)" : "0 2px 8px rgba(21,101,192,0.06)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Course List */}
      <div className="px-4 mt-4 pb-6 flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <span style={{ fontSize: "40px" }}>🔍</span>
            <p style={{ fontFamily: "'Poppins', sans-serif", color: "#9BACC8", fontSize: "13px", marginTop: "8px" }}>
              Nenhum curso encontrado
            </p>
          </div>
        ) : (
          filtered.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl overflow-hidden"
              style={{ background: "white", boxShadow: "0 4px 16px rgba(21,101,192,0.10)" }}
            >
              {/* Image */}
              <div className="relative" style={{ height: "150px" }}>
                <ImageWithFallback
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)" }} />
                {!course.available && (
                  <div
                    className="absolute top-3 right-3 px-3 py-1 rounded-full"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                  >
                    <span style={{ fontFamily: "'Poppins', sans-serif", color: "white", fontSize: "10px", fontWeight: 600 }}>Lista de espera</span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span
                    className="px-3 py-1 rounded-full"
                    style={{ background: course.tagBg, color: course.tagColor, fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 600 }}
                  >
                    {course.tag}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 style={{ fontFamily: "'Righteous', sans-serif", color: "#1A2D5A", fontSize: "17px", marginBottom: "6px" }}>
                  {course.title}
                </h3>
                <p style={{ fontFamily: "'Poppins', sans-serif", color: "#6B87B0", fontSize: "12px", lineHeight: 1.5, marginBottom: "12px" }}>
                  {course.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock size={12} color="#9BACC8" />
                    <span style={{ fontFamily: "'Poppins', sans-serif", color: "#9BACC8", fontSize: "11px" }}>{course.duration}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full" style={{ background: "#E8EEF9" }} />
                  <div className="flex items-center gap-1">
                    <Users size={12} color="#9BACC8" />
                    <span style={{ fontFamily: "'Poppins', sans-serif", color: "#9BACC8", fontSize: "11px" }}>{course.students}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full" style={{ background: "#E8EEF9" }} />
                  <span style={{ fontFamily: "'Poppins', sans-serif", color: "#9BACC8", fontSize: "11px" }}>{course.level}</span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/cursos/${course.id}`)}
                  className="w-full py-3 rounded-2xl flex items-center justify-center gap-2"
                  style={{
                    background: course.available ? "#1565C0" : "#F4F7FF",
                    color: course.available ? "white" : "#9BACC8",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    fontSize: "13px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Saiba mais
                  <ChevronRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
