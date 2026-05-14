import { motion } from "motion/react";
import { Heart, Star, Users, Award, ChevronDown, ChevronUp } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";
import { useNavigate } from "react-router";

const VOLUNTEER_IMAGE = "https://images.unsplash.com/photo-1709375635395-7774ae07995a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2x1bnRlZXIlMjBzb2NpYWwlMjB3b3JrJTIwaGVscGluZyUyMGNvbW11bml0eSUyMGNoaWxkcmVufGVufDF8fHx8MTc3NjE2NTE5N3ww&ixlib=rb-4.1.0&q=80&w=800";

const TESTIMONIALS = [
  {
    id: "1",
    name: "Ana Paula Santos",
    role: "Mãe do Lucas, 10 anos",
    text: "O Movimento Pró Criança mudou a vida do meu filho. Ele aprendeu informática e hoje ajuda toda a família com o computador. Sou eternamente grata!",
    rating: 5,
    avatar: "👩🏽",
  },
  {
    id: "2",
    name: "Carlos Eduardo",
    role: "Ex-aluno, agora voluntário",
    text: "Fui beneficiário há 8 anos e hoje sou voluntário. Este lugar me ensinou que todo sonho é possível quando temos apoio e acesso à educação.",
    rating: 5,
    avatar: "👨🏾",
  },
  {
    id: "3",
    name: "Dra. Maria Fernanda",
    role: "Parceira institucional",
    text: "Raramente vejo uma organização com tanto impacto real. Cada centavo doado chega de fato às crianças. Trabalho sério e transparente.",
    rating: 5,
    avatar: "👩🏻",
  },
];

const TIMELINE = [
  { year: "2009", event: "Fundação do Movimento por um grupo de educadores apaixonados" },
  { year: "2012", event: "Primeiro centro de atividades inaugurado em São Paulo" },
  { year: "2016", event: "Expansão para 5 bairros periféricos da capital" },
  { year: "2020", event: "Lançamento dos cursos online durante a pandemia" },
  { year: "2024", event: "Mais de 1.200 crianças atendidas por ano" },
];

const IMPACTS = [
  { value: "1.200+", label: "Crianças atendidas/ano", icon: "👧", color: "#1565C0" },
  { value: "8", label: "Cursos gratuitos", icon: "📚", color: "#1976D2" },
  { value: "R$120k", label: "Em doações este ano", icon: "💛", color: "#F59E0B" },
  { value: "15+", label: "Anos de impacto social", icon: "⭐", color: "#8B5CF6" },
  { value: "50+", label: "Voluntários ativos", icon: "🤝", color: "#10B981" },
  { value: "95%", label: "Aprovação dos familiares", icon: "❤️", color: "#EF4444" },
];

function TestimonialCard({ name, role, text, rating, avatar }: typeof TESTIMONIALS[0]) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 100;
  const displayText = expanded || !isLong ? text : text.slice(0, 100) + "...";

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "white", boxShadow: "0 2px 12px rgba(21,101,192,0.08)", flexShrink: 0, width: "260px" }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "#EEF4FF", fontSize: "22px" }}
        >
          {avatar}
        </div>
        <div>
          <p style={{ fontFamily: "'Poppins', sans-serif", color: "#1A2D5A", fontSize: "12px", fontWeight: 600 }}>{name}</p>
          <p style={{ fontFamily: "'Poppins', sans-serif", color: "#9BACC8", fontSize: "10px" }}>{role}</p>
        </div>
      </div>
      <div className="flex gap-0.5 mb-2">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} size={12} fill="#FFD600" color="#FFD600" />
        ))}
      </div>
      <p style={{ fontFamily: "'Poppins', sans-serif", color: "#6B87B0", fontSize: "12px", lineHeight: 1.6 }}>
        "{displayText}"
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-1"
          style={{ fontFamily: "'Poppins', sans-serif", color: "#1565C0", fontSize: "11px", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          {expanded ? <><ChevronUp size={12} /> Ver menos</> : <><ChevronDown size={12} /> Ver mais</>}
        </button>
      )}
    </div>
  );
}

export function About() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#F4F7FF", minHeight: "100%" }}>
      {/* Header */}
      <div
        className="px-5 pt-4 pb-8 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1565C0 0%, #1976D2 100%)" }}
      >
        <div className="absolute" style={{ top: -30, right: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,214,0,0.1)" }} />
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FFD600" }}>
            <Heart size={16} color="#1565C0" fill="#1565C0" />
          </div>
          <h1 style={{ fontFamily: "'Righteous', sans-serif", color: "white", fontSize: "20px" }}>
            Quem Somos
          </h1>
        </div>
        <p style={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255,255,255,0.75)", fontSize: "12px", position: "relative", zIndex: 10 }}>
          Conheça nossa história e impacto social
        </p>
      </div>

      {/* About Card */}
      <div className="px-4 -mt-5 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 8px 30px rgba(21,101,192,0.15)" }}
        >
          <div style={{ height: "180px", position: "relative" }}>
            <ImageWithFallback
              src={VOLUNTEER_IMAGE}
              alt="Voluntários ajudando crianças"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(21,101,192,0.85) 0%, transparent 60%)" }} />
            <div className="absolute bottom-4 left-4 right-4">
              <span
                className="inline-block px-3 py-1 rounded-full mb-1"
                style={{ background: "#FFD600", fontFamily: "'Righteous', sans-serif", color: "#1565C0", fontSize: "11px" }}
              >
                Desde 2009
              </span>
            </div>
          </div>
          <div className="p-5" style={{ background: "white" }}>
            <h2 style={{ fontFamily: "'Righteous', sans-serif", color: "#1A2D5A", fontSize: "18px", marginBottom: "8px" }}>
              Movimento Pró Criança
            </h2>
            <p style={{ fontFamily: "'Poppins', sans-serif", color: "#6B87B0", fontSize: "13px", lineHeight: 1.7 }}>
              Somos um movimento social sem fins lucrativos fundado em 2009, com o objetivo de garantir acesso à educação, cultura e desenvolvimento integral para crianças e adolescentes em situação de vulnerabilidade social.
            </p>
            <p style={{ fontFamily: "'Poppins', sans-serif", color: "#6B87B0", fontSize: "13px", lineHeight: 1.7, marginTop: "8px" }}>
              Acreditamos que toda criança merece uma infância digna, cheia de oportunidades e repleta de sorrisos. 💙
            </p>
          </div>
        </motion.div>
      </div>

      {/* Mission, Vision, Values */}
      <div className="px-4 mt-5">
        <h2 style={{ fontFamily: "'Righteous', sans-serif", color: "#1565C0", fontSize: "17px", marginBottom: "12px" }}>
          Nossos Pilares
        </h2>
        <div className="flex flex-col gap-3">
          {[
            { icon: "🎯", title: "Missão", text: "Transformar vidas através da educação, cultura e esporte, promovendo o desenvolvimento integral de crianças e jovens.", color: "#EEF4FF", border: "#1565C0" },
            { icon: "🌟", title: "Visão", text: "Ser referência nacional em proteção e desenvolvimento infantil, alcançando comunidades em todo o Brasil.", color: "#FFFBEB", border: "#F59E0B" },
            { icon: "💛", title: "Valores", text: "Transparência, amor, respeito, inclusão e compromisso com o futuro das nossas crianças.", color: "#ECFDF5", border: "#10B981" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ background: item.color, borderLeft: `3px solid ${item.border}` }}
            >
              <span style={{ fontSize: "22px", flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontFamily: "'Righteous', sans-serif", color: "#1A2D5A", fontSize: "14px", marginBottom: "4px" }}>{item.title}</p>
                <p style={{ fontFamily: "'Poppins', sans-serif", color: "#6B87B0", fontSize: "12px", lineHeight: 1.5 }}>{item.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Impact Numbers */}
      <div className="px-4 mt-5">
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} color="#FFD600" />
          <h2 style={{ fontFamily: "'Righteous', sans-serif", color: "#1565C0", fontSize: "17px" }}>Nosso Impacto</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {IMPACTS.map((item, i) => (
            <motion.div
              key={item.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="flex flex-col items-center gap-1 p-3 rounded-2xl text-center"
              style={{ background: "white", boxShadow: "0 2px 10px rgba(21,101,192,0.08)" }}
            >
              <span style={{ fontSize: "22px" }}>{item.icon}</span>
              <span style={{ fontFamily: "'Righteous', sans-serif", color: item.color, fontSize: "16px", lineHeight: 1.1 }}>{item.value}</span>
              <span style={{ fontFamily: "'Poppins', sans-serif", color: "#9BACC8", fontSize: "9px", lineHeight: 1.3 }}>{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 mt-5">
        <h2 style={{ fontFamily: "'Righteous', sans-serif", color: "#1565C0", fontSize: "17px", marginBottom: "12px" }}>
          Nossa Jornada
        </h2>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5" style={{ background: "#E8EEF9" }} />
          <div className="flex flex-col gap-4">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex items-start gap-4 relative"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10"
                  style={{ background: i === TIMELINE.length - 1 ? "#FFD600" : "#1565C0" }}
                >
                  <span style={{ fontFamily: "'Righteous', sans-serif", color: i === TIMELINE.length - 1 ? "#1565C0" : "white", fontSize: "9px" }}>
                    {item.year.slice(2)}
                  </span>
                </div>
                <div className="flex-1 pb-1">
                  <span style={{ fontFamily: "'Righteous', sans-serif", color: "#1565C0", fontSize: "13px" }}>{item.year}</span>
                  <p style={{ fontFamily: "'Poppins', sans-serif", color: "#6B87B0", fontSize: "12px", lineHeight: 1.5 }}>{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mt-5">
        <div className="px-4 mb-3">
          <div className="flex items-center gap-2">
            <Star size={16} color="#FFD600" fill="#FFD600" />
            <h2 style={{ fontFamily: "'Righteous', sans-serif", color: "#1565C0", fontSize: "17px" }}>Depoimentos</h2>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: "none" }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <TestimonialCard {...t} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Donate CTA */}
      <div className="px-4 mt-5 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl p-5 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)" }}
        >
          <div className="absolute" style={{ top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,214,0,0.15)" }} />
          <div className="absolute" style={{ bottom: -15, left: -15, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div className="relative z-10">
            <span style={{ fontSize: "32px" }}>💛</span>
            <h3 style={{ fontFamily: "'Righteous', sans-serif", color: "white", fontSize: "18px", marginTop: "8px", marginBottom: "8px" }}>
              Seja parte dessa história!
            </h3>
            <p style={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255,255,255,0.8)", fontSize: "12px", lineHeight: 1.5, marginBottom: "16px" }}>
              Sua doação transforma vidas e garante que mais crianças tenham acesso a um futuro melhor.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/doar")}
              className="px-8 py-3.5 rounded-2xl"
              style={{
                background: "#FFD600",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                color: "#1565C0",
                fontSize: "15px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              }}
            >
              ❤️ Quero Doar Agora
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Social & Contact */}
      <div className="px-4 pb-6">
        <div
          className="rounded-2xl p-4"
          style={{ background: "white", boxShadow: "0 2px 12px rgba(21,101,192,0.08)" }}
        >
          <p style={{ fontFamily: "'Righteous', sans-serif", color: "#1A2D5A", fontSize: "14px", marginBottom: "12px" }}>Fale Conosco</p>
          <div className="flex flex-col gap-2">
            {[
              { icon: "📧", label: "contato@movimentoprocrianca.org.br" },
              { icon: "📱", label: "(11) 9 9999-0000" },
              { icon: "📍", label: "Rua das Flores, 123 – São Paulo/SP" },
              { icon: "🌐", label: "www.movimentoprocrianca.org.br" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span style={{ fontSize: "14px" }}>{item.icon}</span>
                <span style={{ fontFamily: "'Poppins', sans-serif", color: "#6B87B0", fontSize: "12px" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
