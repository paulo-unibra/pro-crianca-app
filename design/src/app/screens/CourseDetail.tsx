import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ChevronLeft, Clock, Users, Star, Calendar, MapPin, CheckCircle, Share2, Heart } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { COURSES_DATA } from "./Courses";
import { useState } from "react";

const EXTRA_INFO: Record<string, {
  schedule: string;
  location: string;
  instructor: string;
  rating: number;
  reviews: number;
  topics: string[];
  requirements: string[];
}> = {
  "1": {
    schedule: "Seg, Qua e Sex – 14h às 16h",
    location: "Sede – Rua das Flores, 123, São Paulo",
    instructor: "Prof. Carlos Silva",
    rating: 4.9,
    reviews: 38,
    topics: ["Uso do computador e mouse", "Internet e segurança online", "Word e Excel básico", "E-mail e redes sociais", "Pesquisa escolar"],
    requirements: ["Idade entre 8 e 14 anos", "Nenhum conhecimento prévio necessário"],
  },
  "2": {
    schedule: "Ter e Qui – 13h às 15h",
    location: "Espaço Cultural – Av. Brasil, 456",
    instructor: "Profa. Ana Martins",
    rating: 5.0,
    reviews: 27,
    topics: ["Pintura em tela", "Desenho e esboço", "Artesanato com materiais recicláveis", "Arte digital básica", "Exposição final de trabalhos"],
    requirements: ["Crianças de 6 a 15 anos", "Materiais fornecidos pela instituição"],
  },
  "3": {
    schedule: "Seg a Sex – 13h30 às 16h",
    location: "Biblioteca Comunitária",
    instructor: "Equipe pedagógica",
    rating: 4.8,
    reviews: 52,
    topics: ["Matemática básica e avançada", "Português e redação", "Ciências naturais", "História e geografia", "Preparação para provas"],
    requirements: ["Estudantes do 1° ao 9° ano", "Matrícula ativa na escola regular"],
  },
  "4": {
    schedule: "Sáb e Dom – 9h às 11h",
    location: "Ginásio Municipal – Quadra B",
    instructor: "Profa. Juliana Ramos",
    rating: 4.9,
    reviews: 44,
    topics: ["Ritmo e percussão", "Dança folclórica", "Dança contemporânea", "Teoria musical básica", "Apresentações culturais"],
    requirements: ["Crianças de 4 a 12 anos", "Autorização dos responsáveis"],
  },
  "5": {
    schedule: "Sáb – 8h às 11h",
    location: "Campo do Bairro – Rua das Palmeiras",
    instructor: "Prof. Roberto Santos",
    rating: 4.7,
    reviews: 61,
    topics: ["Futebol e regras do esporte", "Trabalho em equipe", "Educação em valores", "Brincadeiras cooperativas", "Saúde e bem-estar"],
    requirements: ["Crianças de 6 a 16 anos", "Tênis esportivo obrigatório"],
  },
};

export function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState(false);
  const [liked, setLiked] = useState(false);

  const course = COURSES_DATA.find((c) => c.id === id);
  const extra = id ? EXTRA_INFO[id] : null;

  if (!course || !extra) {
    return (
      <div className="flex items-center justify-center min-h-full" style={{ background: "#F4F7FF" }}>
        <p style={{ fontFamily: "'Poppins', sans-serif", color: "#6B87B0" }}>Curso não encontrado</p>
      </div>
    );
  }

  const handleEnroll = () => {
    if (course.available) setEnrolled(true);
  };

  return (
    <div style={{ background: "#F4F7FF", minHeight: "100%" }}>
      {/* Hero Image */}
      <div className="relative" style={{ height: "240px" }}>
        <ImageWithFallback
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(21,101,192,0.6) 0%, transparent 40%, rgba(0,0,0,0.3) 100%)" }} />

        {/* Top actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer" }}
          >
            <ChevronLeft size={22} color="#1565C0" />
          </motion.button>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setLiked(!liked)}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer" }}
            >
              <Heart size={20} color={liked ? "#EF4444" : "#1565C0"} fill={liked ? "#EF4444" : "none"} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer" }}
            >
              <Share2 size={18} color="#1565C0" />
            </motion.button>
          </div>
        </div>

        {/* Badge */}
        <div className="absolute bottom-4 left-4">
          <span
            className="px-3 py-1.5 rounded-full"
            style={{ background: course.tagBg, color: course.tagColor, fontFamily: "'Poppins', sans-serif", fontSize: "12px", fontWeight: 600 }}
          >
            {course.tag}
          </span>
        </div>

        {/* Available badge */}
        <div className="absolute bottom-4 right-4">
          <span
            className="px-3 py-1.5 rounded-full"
            style={{
              background: course.available ? "#22C55E" : "#F59E0B",
              color: "white",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            {course.available ? "● Vagas disponíveis" : "● Lista de espera"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 pb-6">
        {/* Title + Rating */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 style={{ fontFamily: "'Righteous', sans-serif", color: "#1A2D5A", fontSize: "24px", lineHeight: 1.2, marginBottom: "8px" }}>
            {course.title}
          </h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.floor(extra.rating) ? "#FFD600" : "none"}
                  color={i < Math.floor(extra.rating) ? "#FFD600" : "#E8EEF9"}
                />
              ))}
            </div>
            <span style={{ fontFamily: "'Poppins', sans-serif", color: "#1565C0", fontSize: "12px", fontWeight: 600 }}>{extra.rating}</span>
            <span style={{ fontFamily: "'Poppins', sans-serif", color: "#9BACC8", fontSize: "12px" }}>({extra.reviews} avaliações)</span>
          </div>
        </motion.div>

        {/* Quick info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2 mb-5"
        >
          {[
            { icon: <Clock size={16} color="#1565C0" />, label: "Duração", value: course.duration },
            { icon: <Users size={16} color="#1565C0" />, label: "Vagas", value: course.students.replace(" vagas", "") },
            { icon: <Star size={16} color="#1565C0" />, label: "Nível", value: course.level },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-1 p-3 rounded-2xl text-center"
              style={{ background: "white", boxShadow: "0 2px 10px rgba(21,101,192,0.08)" }}
            >
              {item.icon}
              <span style={{ fontFamily: "'Poppins', sans-serif", color: "#9BACC8", fontSize: "9px" }}>{item.label}</span>
              <span style={{ fontFamily: "'Poppins', sans-serif", color: "#1A2D5A", fontSize: "11px", fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-5"
        >
          <h3 style={{ fontFamily: "'Righteous', sans-serif", color: "#1A2D5A", fontSize: "16px", marginBottom: "8px" }}>Sobre o Curso</h3>
          <p style={{ fontFamily: "'Poppins', sans-serif", color: "#6B87B0", fontSize: "13px", lineHeight: 1.7 }}>
            {course.description}
          </p>
        </motion.div>

        {/* Schedule & Location */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4 mb-5"
          style={{ background: "#EEF4FF" }}
        >
          <div className="flex items-start gap-3 mb-3">
            <Calendar size={18} color="#1565C0" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: "'Poppins', sans-serif", color: "#9BACC8", fontSize: "11px" }}>Horário</p>
              <p style={{ fontFamily: "'Poppins', sans-serif", color: "#1A2D5A", fontSize: "13px", fontWeight: 600 }}>{extra.schedule}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 mb-3">
            <MapPin size={18} color="#1565C0" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: "'Poppins', sans-serif", color: "#9BACC8", fontSize: "11px" }}>Local</p>
              <p style={{ fontFamily: "'Poppins', sans-serif", color: "#1A2D5A", fontSize: "13px", fontWeight: 600 }}>{extra.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#1565C0" }}>
              <span style={{ fontSize: "10px" }}>👨‍🏫</span>
            </div>
            <div>
              <p style={{ fontFamily: "'Poppins', sans-serif", color: "#9BACC8", fontSize: "11px" }}>Instrutor(a)</p>
              <p style={{ fontFamily: "'Poppins', sans-serif", color: "#1A2D5A", fontSize: "13px", fontWeight: 600 }}>{extra.instructor}</p>
            </div>
          </div>
        </motion.div>

        {/* Topics */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-5"
        >
          <h3 style={{ fontFamily: "'Righteous', sans-serif", color: "#1A2D5A", fontSize: "16px", marginBottom: "12px" }}>O que você vai aprender</h3>
          <div className="flex flex-col gap-2">
            {extra.topics.map((topic, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle size={16} color="#22C55E" style={{ flexShrink: 0 }} />
                <span style={{ fontFamily: "'Poppins', sans-serif", color: "#1A2D5A", fontSize: "13px" }}>{topic}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 style={{ fontFamily: "'Righteous', sans-serif", color: "#1A2D5A", fontSize: "16px", marginBottom: "12px" }}>Requisitos</h3>
          <div className="flex flex-col gap-2">
            {extra.requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#1565C0" }} />
                <span style={{ fontFamily: "'Poppins', sans-serif", color: "#6B87B0", fontSize: "13px" }}>{req}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Enroll CTA */}
        <div className="mt-6">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleEnroll}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
            style={{
              background: enrolled ? "#22C55E" : course.available ? "#FFD600" : "#9BACC8",
              border: "none",
              cursor: course.available && !enrolled ? "pointer" : "default",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              color: enrolled ? "white" : course.available ? "#1565C0" : "white",
              fontSize: "15px",
              boxShadow: enrolled
                ? "0 4px 20px rgba(34,197,94,0.3)"
                : course.available
                ? "0 4px 20px rgba(255,214,0,0.4)"
                : "none",
              transition: "all 0.3s",
            }}
          >
            {enrolled ? (
              <>
                <CheckCircle size={20} />
                Inscrição realizada! 🎉
              </>
            ) : course.available ? (
              <>
                Quero me inscrever
                <span style={{ fontSize: "16px" }}>✨</span>
              </>
            ) : (
              "Entrar na lista de espera"
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}