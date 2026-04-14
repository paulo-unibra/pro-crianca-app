import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

// ─── URL base da API ───────────────────────────────────────────────────────────
// Ajuste para o endereço do seu servidor Laravel
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000/api';

// Fetch com timeout para evitar loading infinito quando o servidor não responde
async function fetchComTimeout(url: string, options?: RequestInit, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (e: any) {
    if (e.name === 'AbortError') {
      throw new Error('Tempo de conexão esgotado. Verifique se o servidor está acessível.');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export type Curso = {
  id: number;
  title: string;
  description: string | null;
  workload: number | null;
};

export type Unidade = {
  id: number;
  name: string;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  phone: string | null;
};

export type Turno = {
  id: number;
  shift: 'manha' | 'tarde' | 'noite';
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  max_students: number;
};

export type StatusInscricao = 'pendente' | 'confirmada' | 'cancelada';

export type Inscricao = {
  id: string;
  protocolo: string;
  curso: Curso;
  unidade: Unidade;
  turno: Turno;
  nomeAluno: string;
  cpf: string;
  telefone: string;
  dataInscricao: string;
  status: StatusInscricao;
};

// Dados extras passados ao adicionarInscricao mas não armazenados no objeto Inscricao
export type DadosInscricao = Omit<Inscricao, 'id' | 'protocolo' | 'dataInscricao' | 'status'> & {
  senha?: string;
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

export const shiftLabel: Record<Turno['shift'], string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
};

export function formatTurnoHorario(turno: Turno): string {
  if (turno.start_time && turno.end_time) {
    return `${turno.start_time} – ${turno.end_time}`;
  }
  return shiftLabel[turno.shift];
}

// ─── Context ───────────────────────────────────────────────────────────────────

type InscricoesContextType = {
  // Dados da API
  cursos: Curso[];
  loadingCursos: boolean;
  errorCursos: string | null;
  recarregarCursos: () => void;

  unidadesDoCurso: (cursoId: number) => Promise<Unidade[]>;
  turnosDoCursoNaUnidade: (cursoId: number, unitId: number) => Promise<Turno[]>;

  // Inscrições locais (geradas no device após envio)
  inscricoes: Inscricao[];
  adicionarInscricao: (dados: DadosInscricao) => Promise<Inscricao>;

  // Token Sanctum obtido ao criar conta na inscrição
  authToken: string | null;

  // Estado de envio
  enviando: boolean;
  erroEnvio: string | null;
};

const InscricoesContext = createContext<InscricoesContextType | null>(null);

export function InscricoesProvider({ children }: { children: React.ReactNode }) {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [errorCursos, setErrorCursos] = useState<string | null>(null);

  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // ── Carrega lista de cursos ──────────────────────────────────────────────────

  const carregarCursos = useCallback(async () => {
    setLoadingCursos(true);
    setErrorCursos(null);
    try {
      const res = await fetchComTimeout(`${API_BASE_URL}/courses`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data: Curso[] = await res.json();
      setCursos(data);
    } catch (e: any) {
      setErrorCursos('Não foi possível carregar os cursos. Verifique sua conexão.');
    } finally {
      setLoadingCursos(false);
    }
  }, []);

  useEffect(() => {
    carregarCursos();
  }, [carregarCursos]);

  // ── Busca unidades de um curso ───────────────────────────────────────────────

  async function unidadesDoCurso(cursoId: number): Promise<Unidade[]> {
    const res = await fetchComTimeout(`${API_BASE_URL}/courses/${cursoId}/units`);
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return res.json();
  }

  // ── Busca turnos de um curso em uma unidade ──────────────────────────────────

  async function turnosDoCursoNaUnidade(cursoId: number, unitId: number): Promise<Turno[]> {
    const res = await fetchComTimeout(`${API_BASE_URL}/courses/${cursoId}/units/${unitId}/shifts`);
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return res.json();
  }

  // ── Submete pré-inscrição à API e salva localmente ───────────────────────────

  function gerarProtocolo(): string {
    const ano = new Date().getFullYear();
    const num = String(Math.floor(Math.random() * 90000) + 10000);
    return `MPC-${ano}-${num}`;
  }

  async function adicionarInscricao(dados: DadosInscricao): Promise<Inscricao> {
    setEnviando(true);
    setErroEnvio(null);

    try {
      const body = new FormData();
      body.append('course_id', String(dados.curso.id));
      body.append('unit_id', String(dados.unidade.id));
      body.append('course_shift_id', String(dados.turno.id));
      body.append('full_name', dados.nomeAluno);
      body.append('cpf', dados.cpf);
      body.append('phone', dados.telefone);
      if (dados.senha) {
        body.append('password', dados.senha);
      }

      const res = await fetchComTimeout(`${API_BASE_URL}/enroll`, {
        method: 'POST',
        body,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message ?? `Erro ${res.status}`);
      }

      const json = await res.json();

      // Armazena token Sanctum se a API criou/vinculou uma conta
      if (json.token) {
        setAuthToken(json.token);
      }

      const protocolo = gerarProtocolo();

      const nova: Inscricao = {
        curso: dados.curso,
        unidade: dados.unidade,
        turno: dados.turno,
        nomeAluno: dados.nomeAluno,
        cpf: dados.cpf,
        telefone: dados.telefone,
        id: String(json.enrollment?.id ?? Date.now()),
        protocolo,
        dataInscricao: new Date().toISOString().split('T')[0],
        status: 'pendente',
      };

      setInscricoes((prev) => [nova, ...prev]);
      return nova;
    } catch (e: any) {
      setErroEnvio(e.message ?? 'Erro ao enviar inscrição.');
      throw e;
    } finally {
      setEnviando(false);
    }
  }

  return (
    <InscricoesContext.Provider
      value={{
        cursos,
        loadingCursos,
        errorCursos,
        recarregarCursos: carregarCursos,
        unidadesDoCurso,
        turnosDoCursoNaUnidade,
        inscricoes,
        adicionarInscricao,
        authToken,
        enviando,
        erroEnvio,
      }}
    >
      {children}
    </InscricoesContext.Provider>
  );
}

export function useInscricoes() {
  const ctx = useContext(InscricoesContext);
  if (!ctx) throw new Error('useInscricoes deve ser usado dentro de InscricoesProvider');
  return ctx;
}
