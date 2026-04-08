import React, { createContext, useContext, useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Curso = {
  id: string;
  nome: string;
  descricao: string;
  icone: string; // emoji
};

export type Unidade = {
  id: string;
  nome: string;
  endereco: string;
  bairro: string;
};

export type Turno = {
  id: string;
  label: string;
  horario: string;
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const CURSOS: Curso[] = [
  {
    id: 'prog-web',
    nome: 'Programador Web',
    descricao: 'HTML, CSS, JavaScript e fundamentos do desenvolvimento web',
    icone: '💻',
  },
  {
    id: 'arduino',
    nome: 'Arduino',
    descricao: 'Eletrônica básica e programação de microcontroladores',
    icone: '🔧',
  },
  {
    id: 'web-designer',
    nome: 'Web Designer',
    descricao: 'Design visual, UX/UI e ferramentas de criação digital',
    icone: '🎨',
  },
];

export const UNIDADES: Unidade[] = [
  {
    id: 'centro',
    nome: 'Unidade Centro',
    endereco: 'Rua das Flores, 123',
    bairro: 'Centro',
  },
  {
    id: 'norte',
    nome: 'Unidade Norte',
    endereco: 'Av. Principal, 456',
    bairro: 'Bairro Norte',
  },
  {
    id: 'sul',
    nome: 'Unidade Sul',
    endereco: 'Rua da Paz, 789',
    bairro: 'Bairro Sul',
  },
];

export const TURNOS: Turno[] = [
  { id: 'manha', label: 'Manhã', horario: '08h00 – 11h30' },
  { id: 'tarde', label: 'Tarde', horario: '13h00 – 16h30' },
  { id: 'noite', label: 'Noite', horario: '18h30 – 21h30' },
];

// Inscrições mock iniciais (já existentes para o usuário)
const INSCRICOES_MOCK: Inscricao[] = [
  {
    id: '1',
    protocolo: 'MPC-2024-00123',
    curso: CURSOS[0],
    unidade: UNIDADES[0],
    turno: TURNOS[1],
    nomeAluno: 'João Silva',
    cpf: '123.456.789-00',
    telefone: '(11) 98765-4321',
    dataInscricao: '2024-03-15',
    status: 'pendente',
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────

type InscricoesContextType = {
  inscricoes: Inscricao[];
  adicionarInscricao: (dados: Omit<Inscricao, 'id' | 'protocolo' | 'dataInscricao' | 'status'>) => Inscricao;
};

const InscricoesContext = createContext<InscricoesContextType | null>(null);

export function InscricoesProvider({ children }: { children: React.ReactNode }) {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>(INSCRICOES_MOCK);

  function gerarProtocolo(): string {
    const ano = new Date().getFullYear();
    const num = String(Math.floor(Math.random() * 90000) + 10000);
    return `MPC-${ano}-${num}`;
  }

  function adicionarInscricao(
    dados: Omit<Inscricao, 'id' | 'protocolo' | 'dataInscricao' | 'status'>
  ): Inscricao {
    const nova: Inscricao = {
      ...dados,
      id: String(Date.now()),
      protocolo: gerarProtocolo(),
      dataInscricao: new Date().toISOString().split('T')[0],
      status: 'pendente',
    };
    setInscricoes((prev) => [nova, ...prev]);
    return nova;
  }

  return (
    <InscricoesContext.Provider value={{ inscricoes, adicionarInscricao }}>
      {children}
    </InscricoesContext.Provider>
  );
}

export function useInscricoes() {
  const ctx = useContext(InscricoesContext);
  if (!ctx) throw new Error('useInscricoes deve ser usado dentro de InscricoesProvider');
  return ctx;
}
