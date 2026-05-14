import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, User, Phone, CreditCard, Mail, AlertCircle, CheckCircle } from "lucide-react";

interface FormData {
  nome: string;
  telefone: string;
  cpf: string;
  email: string;
}

interface FormErrors {
  nome?: string;
  telefone?: string;
  cpf?: string;
  email?: string;
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  return value;
}

function maskCPF(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0,3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`;
  return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCPF(cpf: string) {
  const digits = cpf.replace(/\D/g, "");
  return digits.length === 11;
}

function validatePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10;
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
  inputMode?: "text" | "tel" | "email" | "numeric" | "decimal";
  valid?: boolean;
}

function Field({ label, value, onChange, error, icon, placeholder, type = "text", inputMode, valid }: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label style={{ fontFamily: "'Poppins', sans-serif", color: "#1A2D5A", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px" }}>
        {label}
      </label>
      <div
        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200"
        style={{
          background: focused ? "#EEF4FF" : "white",
          border: error
            ? "2px solid #EF4444"
            : valid && value
            ? "2px solid #22C55E"
            : focused
            ? "2px solid #1565C0"
            : "2px solid #E8EEF9",
          boxShadow: focused ? "0 0 0 4px rgba(21,101,192,0.08)" : "none",
        }}
      >
        <div style={{ color: error ? "#EF4444" : valid && value ? "#22C55E" : focused ? "#1565C0" : "#9BACC8" }}>
          {icon}
        </div>
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "14px",
            color: "#1A2D5A",
            background: "transparent",
            border: "none",
            outline: "none",
            flex: 1,
            width: "100%",
          }}
        />
        {valid && value && !error && (
          <CheckCircle size={16} color="#22C55E" />
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 mt-1.5"
          >
            <AlertCircle size={13} color="#EF4444" />
            <span style={{ fontFamily: "'Poppins', sans-serif", color: "#EF4444", fontSize: "12px" }}>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DonationForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({ nome: "", telefone: "", cpf: "", email: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const setField = (field: keyof FormData, value: string) => {
    let formatted = value;
    if (field === "telefone") formatted = maskPhone(value);
    if (field === "cpf") formatted = maskCPF(value);
    setForm((prev) => ({ ...prev, [field]: formatted }));
    if (touched[field]) validate({ ...form, [field]: formatted });
  };

  const validate = (data: FormData): FormErrors => {
    const newErrors: FormErrors = {};
    if (!data.nome.trim() || data.nome.trim().length < 3) newErrors.nome = "Por favor, informe seu nome completo";
    if (!validatePhone(data.telefone)) newErrors.telefone = "Telefone inválido. Use (00) 00000-0000";
    if (!validateCPF(data.cpf)) newErrors.cpf = "CPF inválido. Informe os 11 dígitos";
    if (!validateEmail(data.email)) newErrors.email = "E-mail inválido";
    setErrors(newErrors);
    return newErrors;
  };

  const handleContinue = async () => {
    const allTouched = { nome: true, telefone: true, cpf: true, email: true };
    setTouched(allTouched);
    const errs = validate(form);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    navigate("/doar/pagamento");
  };

  const isValid = (field: keyof FormData) => {
    if (field === "nome") return form.nome.trim().length >= 3;
    if (field === "telefone") return validatePhone(form.telefone);
    if (field === "cpf") return validateCPF(form.cpf);
    if (field === "email") return validateEmail(form.email);
    return false;
  };

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
          <span style={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>Fazer uma doação</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#FFD600" }}>
              <span style={{ fontFamily: "'Righteous', sans-serif", color: "#1565C0", fontSize: "13px" }}>1</span>
            </div>
            <span style={{ fontFamily: "'Poppins', sans-serif", color: "white", fontSize: "12px", fontWeight: 600 }}>Seus Dados</span>
          </div>
          <div className="flex-1 h-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <span style={{ fontFamily: "'Righteous', sans-serif", color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>2</span>
            </div>
            <span style={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>Pagamento</span>
          </div>
        </div>
        <p style={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>Etapa 1 de 2</p>
      </div>

      {/* Form Card */}
      <div className="px-4 -mt-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl p-5"
          style={{ background: "white", boxShadow: "0 8px 30px rgba(21,101,192,0.12)" }}
        >
          {/* Title */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FFD600" }}>
                <span style={{ fontSize: "16px" }}>💛</span>
              </div>
              <h1 style={{ fontFamily: "'Righteous', sans-serif", color: "#1565C0", fontSize: "20px" }}>
                Faça uma doação
              </h1>
            </div>
            <p style={{ fontFamily: "'Poppins', sans-serif", color: "#6B87B0", fontSize: "12px", lineHeight: 1.5 }}>
              Seus dados ajudam a garantir segurança e transparência
            </p>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-4">
            <Field
              label="Nome completo"
              value={form.nome}
              onChange={(v) => { setField("nome", v); setTouched((t) => ({ ...t, nome: true })); }}
              error={touched.nome ? errors.nome : undefined}
              valid={isValid("nome")}
              icon={<User size={18} />}
              placeholder="Seu nome completo"
            />
            <Field
              label="Telefone"
              value={form.telefone}
              onChange={(v) => { setField("telefone", v); setTouched((t) => ({ ...t, telefone: true })); }}
              error={touched.telefone ? errors.telefone : undefined}
              valid={isValid("telefone")}
              icon={<Phone size={18} />}
              placeholder="(00) 00000-0000"
              inputMode="tel"
            />
            <Field
              label="CPF"
              value={form.cpf}
              onChange={(v) => { setField("cpf", v); setTouched((t) => ({ ...t, cpf: true })); }}
              error={touched.cpf ? errors.cpf : undefined}
              valid={isValid("cpf")}
              icon={<CreditCard size={18} />}
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
            <Field
              label="E-mail"
              value={form.email}
              onChange={(v) => { setField("email", v); setTouched((t) => ({ ...t, email: true })); }}
              error={touched.email ? errors.email : undefined}
              valid={isValid("email")}
              icon={<Mail size={18} />}
              placeholder="seu@email.com"
              type="email"
              inputMode="email"
            />
          </div>

          {/* Security note */}
          <div
            className="flex items-center gap-2 mt-4 p-3 rounded-xl"
            style={{ background: "#F0F9FF" }}
          >
            <span style={{ fontSize: "14px" }}>🔒</span>
            <p style={{ fontFamily: "'Poppins', sans-serif", color: "#0D47A1", fontSize: "11px", lineHeight: 1.4 }}>
              Seus dados são protegidos e usados apenas para identificação da doação.
            </p>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          onClick={handleContinue}
          disabled={loading}
          className="w-full mt-4 py-4 rounded-2xl flex items-center justify-center gap-2"
          style={{
            background: loading ? "#CCAB00" : "#FFD600",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            color: "#1565C0",
            fontSize: "15px",
            boxShadow: "0 4px 20px rgba(255,214,0,0.4)",
            transition: "all 0.2s",
          }}
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ width: 20, height: 20, border: "2.5px solid #1565C0", borderTopColor: "transparent", borderRadius: "50%" }}
              />
              Verificando...
            </>
          ) : (
            <>
              Continuar
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="#1565C0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
