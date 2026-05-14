import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Copy, Check, CheckCircle, QrCode, Info } from "lucide-react";
import { QRCodeSVG } from "../components/QRCodeSVG";

const PIX_KEY = "00020126580014br.gov.bcb.pix0136a8f4c821-7e1b-4dfa-bc3e-2f9d12e45a670218Movimento Pro Crianca520400005303986540710.005802BR5918MOVPROCRIANCASP6009SAO PAULO62070503***6304B8FA";
const PIX_KEY_DISPLAY = "00020126580014br.gov.bcb.pix013...";

export function DonationPix() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PIX_KEY).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      navigate("/");
    }, 3000);
  };

  if (confirmed) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-full px-6 text-center"
        style={{ background: "#F4F7FF" }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
          >
            <CheckCircle size={48} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Righteous', sans-serif", color: "#1565C0", fontSize: "24px" }}>
              Obrigado! 💛
            </h2>
            <p style={{ fontFamily: "'Poppins', sans-serif", color: "#6B87B0", fontSize: "14px", marginTop: "8px", lineHeight: 1.5 }}>
              Sua doação vai mudar a vida<br />de muitas crianças!
            </p>
          </div>
          <div
            className="px-6 py-3 rounded-2xl"
            style={{ background: "#EEF4FF" }}
          >
            <p style={{ fontFamily: "'Poppins', sans-serif", color: "#1565C0", fontSize: "13px" }}>
              ⭐ Você fez a diferença hoje!
            </p>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ width: 24, height: 24, border: "3px solid #1565C0", borderTopColor: "transparent", borderRadius: "50%", marginTop: "8px" }}
          />
          <p style={{ fontFamily: "'Poppins', sans-serif", color: "#9BACC8", fontSize: "12px" }}>
            Redirecionando...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F4F7FF", minHeight: "100%" }}>
      {/* Header */}
      <div
        className="px-5 pt-4 pb-8"
        style={{ background: "linear-gradient(160deg, #1565C0 0%, #1976D2 100%)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer" }}
          >
            <ChevronLeft size={20} color="white" />
          </button>
          <span style={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>Finalizar doação</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.3)" }}>
              <Check size={14} color="white" strokeWidth={3} />
            </div>
            <span style={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>Seus Dados</span>
          </div>
          <div className="flex-1 h-0.5 rounded-full" style={{ background: "#FFD600" }} />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#FFD600" }}>
              <span style={{ fontFamily: "'Righteous', sans-serif", color: "#1565C0", fontSize: "13px" }}>2</span>
            </div>
            <span style={{ fontFamily: "'Poppins', sans-serif", color: "white", fontSize: "12px", fontWeight: 600 }}>Pagamento</span>
          </div>
        </div>
        <p style={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>Etapa 2 de 2 · Quase lá!</p>
      </div>

      {/* Content */}
      <div className="px-4 -mt-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl p-5"
          style={{ background: "white", boxShadow: "0 8px 30px rgba(21,101,192,0.12)" }}
        >
          {/* Title */}
          <div className="text-center mb-5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <QrCode size={22} color="#1565C0" />
              <h1 style={{ fontFamily: "'Righteous', sans-serif", color: "#1565C0", fontSize: "20px" }}>
                Finalize sua doação
              </h1>
            </div>
            <p style={{ fontFamily: "'Poppins', sans-serif", color: "#6B87B0", fontSize: "12px", lineHeight: 1.5 }}>
              Escaneie o QR Code ou copie o código<br />para pagar pelo seu banco
            </p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center mb-5">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.3 }}
              className="p-3 rounded-3xl"
              style={{ background: "#EEF4FF", boxShadow: "0 4px 20px rgba(21,101,192,0.15)" }}
            >
              <QRCodeSVG size={196} color="#1565C0" />
            </motion.div>

            {/* Value badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-3 px-4 py-1.5 rounded-full flex items-center gap-2"
              style={{ background: "#FFD600" }}
            >
              <span style={{ fontSize: "14px" }}>💛</span>
              <span style={{ fontFamily: "'Righteous', sans-serif", color: "#1565C0", fontSize: "14px" }}>
                Qualquer valor faz a diferença!
              </span>
            </motion.div>
          </div>

          {/* Instruction */}
          <div
            className="flex items-start gap-2 p-3 rounded-xl mb-4"
            style={{ background: "#F0F9FF" }}
          >
            <Info size={15} color="#1565C0" style={{ marginTop: "1px", flexShrink: 0 }} />
            <p style={{ fontFamily: "'Poppins', sans-serif", color: "#1565C0", fontSize: "12px", lineHeight: 1.5 }}>
              Abra o app do seu banco, acesse <strong>Pix</strong> e escaneie o QR Code ou cole o código abaixo.
            </p>
          </div>

          {/* Pix Code */}
          <div
            className="p-3 rounded-2xl mb-3"
            style={{ background: "#F4F7FF", border: "1.5px solid #E8EEF9" }}
          >
            <p style={{ fontFamily: "'Poppins', sans-serif", color: "#6B87B0", fontSize: "10px", marginBottom: "4px" }}>
              Código Pix (Copia e Cola):
            </p>
            <p
              style={{
                fontFamily: "monospace",
                color: "#1A2D5A",
                fontSize: "11px",
                wordBreak: "break-all",
                lineHeight: 1.5,
              }}
            >
              {PIX_KEY_DISPLAY}...
            </p>
          </div>

          {/* Copy button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCopy}
            className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 mb-3"
            style={{
              background: copied ? "#22C55E" : "#FFD600",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              color: copied ? "white" : "#1565C0",
              fontSize: "14px",
              transition: "all 0.3s",
              boxShadow: copied ? "0 4px 20px rgba(34,197,94,0.3)" : "0 4px 20px rgba(255,214,0,0.4)",
            }}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="copied"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check size={18} strokeWidth={3} />
                  Código copiado!
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <Copy size={18} />
                  Copiar código Pix
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* Confirm button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          className="w-full mt-4 py-4 rounded-2xl flex items-center justify-center gap-2"
          style={{
            background: "white",
            border: "2px solid #1565C0",
            cursor: "pointer",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            color: "#1565C0",
            fontSize: "15px",
          }}
        >
          <CheckCircle size={20} color="#1565C0" />
          Já fiz a doação
        </motion.button>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-1">
            <span style={{ fontSize: "12px" }}>🔒</span>
            <span style={{ fontFamily: "'Poppins', sans-serif", color: "#9BACC8", fontSize: "10px" }}>Seguro</span>
          </div>
          <div className="w-px h-3" style={{ background: "#E8EEF9" }} />
          <div className="flex items-center gap-1">
            <span style={{ fontSize: "12px" }}>✅</span>
            <span style={{ fontFamily: "'Poppins', sans-serif", color: "#9BACC8", fontSize: "10px" }}>Transparente</span>
          </div>
          <div className="w-px h-3" style={{ background: "#E8EEF9" }} />
          <div className="flex items-center gap-1">
            <span style={{ fontSize: "12px" }}>💙</span>
            <span style={{ fontFamily: "'Poppins', sans-serif", color: "#9BACC8", fontSize: "10px" }}>Confiável</span>
          </div>
        </div>
      </div>
    </div>
  );
}
