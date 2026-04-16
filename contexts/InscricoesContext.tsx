import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── URL base da API ───────────────────────────────────────────────────────────
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000/api';

const STORAGE_TOKEN_KEY = '@pro_crianca:token';

// Erro enriquecido com código da API
export class ApiError extends Error {
  code: string | null;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code ?? null;
  }
}

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

export type Usuario = {
  nome: string;
  email: string;
  cpf: string;
  telefone: string | null;
};

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
  days_of_week: string[];
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

// Converte status do backend (inglês) para o tipo local (português)
function mapStatus(apiStatus: string): StatusInscricao {
  switch (apiStatus) {
    case 'accepted':  return 'confirmada';
    case 'rejected':
    case 'cancelled': return 'cancelada';
    default:          return 'pendente';
  }
}

export const shiftLabel: Record<Turno['shift'], string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
};

const DAY_LABELS: Record<string, string> = {
  seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui',
  sex: 'Sex', sab: 'Sáb', dom: 'Dom',
};

export function formatDias(days: string[]): string {
  if (!days || days.length === 0) return '';
  return days.map((d) => DAY_LABELS[d] ?? d).join(', ');
}

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

  // Inscrições (buscadas da API quando autenticado)
  inscricoes: Inscricao[];
  adicionarInscricao: (dados: DadosInscricao) => Promise<Inscricao>;
  cancelarInscricao: (inscricaoId: string) => Promise<void>;

  // Token Sanctum obtido ao criar conta na inscrição
  authToken: string | null;

  // Dados do usuário autenticado (carregados via GET /api/user)
  usuario: Usuario | null;

  // true enquanto o token está sendo lido do AsyncStorage na inicialização
  loadingSession: boolean;

  // Encerra a sessão do usuário
  logout: () => Promise<void>;

  // Autentica com e-mail + senha; lança erro com mensagem legível em caso de falha
  login: (email: string, senha: string) => Promise<void>;

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
  const [authToken, setAuthTokenState] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // ── Persiste token no AsyncStorage e no estado ───────────────────────────────

  const setAuthToken = useCallback(async (token: string | null) => {
    setAuthTokenState(token);
    try {
      if (token) {
        await AsyncStorage.setItem(STORAGE_TOKEN_KEY, token);
      } else {
        await AsyncStorage.removeItem(STORAGE_TOKEN_KEY);
      }
    } catch {
      // falha silenciosa de storage não deve quebrar o app
    }
  }, []);

  // ── Restaura sessão ao iniciar o app ─────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_TOKEN_KEY);
        if (saved) {
          setAuthTokenState(saved);
        }
      } catch {
        // ignora erro de leitura
      } finally {
        setLoadingSession(false);
      }
    })();
  }, []);

  // ── Busca dados do usuário autenticado ──────────────────────────────────────

  const carregarUsuario = useCallback(async (token: string) => {
    try {
      const res = await fetchComTimeout(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      setUsuario({
        nome: data.name ?? '',
        email: data.email ?? '',
        cpf: data.cpf ?? '',
        telefone: data.phone ?? null,
      });
    } catch {
      // falha silenciosa
    }
  }, []);

  // ── Busca inscrições da API quando tiver token ───────────────────────────────

  const carregarInscricoes = useCallback(async (token: string) => {
    try {
      const res = await fetchComTimeout(`${API_BASE_URL}/enrollments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      // Mapeia a resposta da API para o tipo Inscricao local
      const mapped: Inscricao[] = (data as any[]).map((item) => ({
        id: String(item.id),
        protocolo: item.protocol ?? `MPC-${new Date().getFullYear()}-${item.id}`,
        curso: item.course ?? { id: item.course_id, title: '', description: null, workload: null },
        unidade: item.unit ?? { id: item.unit_id, name: '', address: null, neighborhood: null, city: null, phone: null },
        turno: item.shift ?? { id: item.course_shift_id, shift: 'manha', description: null, start_time: null, end_time: null, days_of_week: [], max_students: 0 },
        nomeAluno: item.full_name ?? '',
        cpf: item.cpf ?? '',
        telefone: item.phone ?? '',
        dataInscricao: (item.created_at ?? '').split('T')[0],
        status: mapStatus(item.status),
      }));
      setInscricoes(mapped);
    } catch {
      // falha silenciosa — inscrições locais continuam visíveis
    }
  }, []);

  useEffect(() => {
    if (authToken) {
      carregarInscricoes(authToken);
      carregarUsuario(authToken);
    } else {
      setInscricoes([]);
      setUsuario(null);
    }
  }, [authToken, carregarInscricoes, carregarUsuario]);

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

      const headers: Record<string, string> = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetchComTimeout(`${API_BASE_URL}/enroll`, {
        method: 'POST',
        headers,
        body,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new ApiError(json.message ?? `Erro ${res.status}`, json.code);
      }

      const json = await res.json();

      // Armazena token Sanctum se a API criou/vinculou uma conta
      if (json.access_token) {
        await setAuthToken(json.access_token);
      }

      // Usa o protocolo retornado pela API, ou gera um fallback local
      const protocolo: string =
        json.enrollment?.protocol ??
        `MPC-${new Date().getFullYear()}-${String(json.enrollment?.id ?? Date.now()).padStart(5, '0')}`;

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
      throw e; // propaga ApiError (com .code) ou Error genérico
    } finally {
      setEnviando(false);
    }
  }

  // ── Cancela uma pré-inscrição pendente ───────────────────────────────────────

  async function cancelarInscricao(inscricaoId: string): Promise<void> {
    if (!authToken) throw new Error('Usuário não autenticado.');

    const res = await fetchComTimeout(`${API_BASE_URL}/enrollments/${inscricaoId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error((json as any).message ?? `Erro ${res.status}`);
    }

    // Atualiza o status localmente sem recarregar tudo
    setInscricoes((prev) =>
      prev.map((i) => (i.id === inscricaoId ? { ...i, status: 'cancelada' as const } : i))
    );
  }

  // ── Encerra a sessão do usuário ──────────────────────────────────────────────

  async function logout(): Promise<void> {
    await setAuthToken(null);
    setUsuario(null);
    setInscricoes([]);
  }

  // ── Autentica com e-mail + senha ─────────────────────────────────────────────

  async function login(email: string, senha: string): Promise<void> {
    const res = await fetchComTimeout(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password: senha }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error((json as any).message ?? 'Credenciais inválidas.');
    }

    const token: string = (json as any).access_token;
    await setAuthToken(token);
    // carregarUsuario e carregarInscricoes são disparados pelo useEffect que observa authToken
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
        cancelarInscricao,
        authToken,
        usuario,
        loadingSession,
        logout,
        login,
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
