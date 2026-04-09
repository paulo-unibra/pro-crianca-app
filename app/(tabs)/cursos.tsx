import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  StatusBar as RNStatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MPC } from '@/constants/theme';
import {
  useInscricoes,
  CURSOS,
  UNIDADES,
  TURNOS,
  Curso,
  Unidade,
  Turno,
  Inscricao,
} from '@/contexts/InscricoesContext';

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 44;
const ROXO = '#354FB8';
const CIANO = '#00AAFF';

// ─── Tipos de step ────────────────────────────────────────────────────────────

type Step = 'lista' | 'selecionarCurso' | 'selecionarUnidade' | 'selecionarTurno' | 'dados' | 'protocolo';

// ─── Componente Header ────────────────────────────────────────────────────────

function Header({ titulo, onBack }: { titulo: string; onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.backBtn} />
      )}
      <Text style={styles.headerTitle}>{titulo}</Text>
      <View style={styles.backBtn} />
    </View>
  );
}

// ─── Badge de status ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Inscricao['status'] }) {
  const cores: Record<Inscricao['status'], string> = {
    pendente: '#F7941D',
    confirmada: '#22C55E',
    cancelada: '#EF4444',
  };
  const labels: Record<Inscricao['status'], string> = {
    pendente: 'PENDENTE',
    confirmada: 'CONFIRMADA',
    cancelada: 'CANCELADA',
  };
  return (
    <View style={[styles.badge, { backgroundColor: cores[status] }]}>
      <Text style={styles.badgeText}>{labels[status]}</Text>
    </View>
  );
}

// ─── Tela: Lista de inscrições ────────────────────────────────────────────────

function TelaLista({ onNova }: { onNova: () => void }) {
  const { inscricoes } = useInscricoes();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <Header titulo="MEUS CURSOS" onBack={() => router.push('/')} />
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        {/* Botão nova pré-inscrição */}
        <TouchableOpacity style={styles.btnNova} onPress={onNova}>
          <Text style={styles.btnNovaPlus}>+</Text>
          <Text style={styles.btnNovaText}>NOVA PRÉ-INSCRIÇÃO</Text>
        </TouchableOpacity>

        {/* Lista */}
        {inscricoes.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Nenhuma inscrição ainda.</Text>
            <Text style={styles.emptySubtext}>Clique acima para iniciar uma pré-inscrição.</Text>
          </View>
        ) : (
          inscricoes.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcone}>{item.curso.icone}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardCurso}>{item.curso.nome}</Text>
                  <Text style={styles.cardUnidade}>{item.unidade.nome}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Turno</Text>
                <Text style={styles.cardValue}>{item.turno.label} · {item.turno.horario}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Protocolo</Text>
                <Text style={[styles.cardValue, { color: ROXO, fontWeight: '700' }]}>{item.protocolo}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Data</Text>
                <Text style={styles.cardValue}>{item.dataInscricao}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── Tela: Selecionar curso ───────────────────────────────────────────────────

function TelaEscolherCurso({
  onBack,
  onSelect,
}: {
  onBack: () => void;
  onSelect: (c: Curso) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <Header titulo="ESCOLHA O CURSO" onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>Passo 1 de 4 — Curso</Text>
        {CURSOS.map((curso) => (
          <TouchableOpacity key={curso.id} style={styles.optionCard} onPress={() => onSelect(curso)}>
            <Text style={styles.optionIcon}>{curso.icone}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>{curso.nome}</Text>
              <Text style={styles.optionDesc}>{curso.descricao}</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Tela: Selecionar unidade ─────────────────────────────────────────────────

function TelaEscolherUnidade({
  onBack,
  onSelect,
}: {
  onBack: () => void;
  onSelect: (u: Unidade) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <Header titulo="ESCOLHA A UNIDADE" onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>Passo 2 de 4 — Unidade</Text>
        {UNIDADES.map((unidade) => (
          <TouchableOpacity key={unidade.id} style={styles.optionCard} onPress={() => onSelect(unidade)}>
            <Text style={styles.optionIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>{unidade.nome}</Text>
              <Text style={styles.optionDesc}>{unidade.endereco} · {unidade.bairro}</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Tela: Selecionar turno ───────────────────────────────────────────────────

function TelaEscolherTurno({
  onBack,
  onSelect,
}: {
  onBack: () => void;
  onSelect: (t: Turno) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <Header titulo="ESCOLHA O TURNO" onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>Passo 3 de 4 — Turno</Text>
        {TURNOS.map((turno) => (
          <TouchableOpacity key={turno.id} style={styles.optionCard} onPress={() => onSelect(turno)}>
            <Text style={styles.optionIcon}>
              {turno.id === 'manha' ? '🌅' : turno.id === 'tarde' ? '☀️' : '🌙'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>{turno.label}</Text>
              <Text style={styles.optionDesc}>{turno.horario}</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Tela: Dados pessoais ─────────────────────────────────────────────────────

function TelaDados({
  onBack,
  onConfirmar,
}: {
  onBack: () => void;
  onConfirmar: (nome: string, cpf: string, telefone: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [erro, setErro] = useState('');

  function formatCpf(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
  }

  function formatTelefone(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }

  function handleConfirmar() {
    if (!nome.trim()) return setErro('Informe o nome completo.');
    if (cpf.replace(/\D/g, '').length < 11) return setErro('CPF inválido.');
    if (telefone.replace(/\D/g, '').length < 10) return setErro('Telefone inválido.');
    setErro('');
    onConfirmar(nome.trim(), cpf, telefone);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F5F5F5' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header titulo="DADOS PESSOAIS" onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>Passo 4 de 4 — Seus dados</Text>

        <Text style={styles.inputLabel}>Nome completo *</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Maria da Silva"
          placeholderTextColor="#aaa"
          autoCapitalize="words"
        />

        <Text style={styles.inputLabel}>CPF *</Text>
        <TextInput
          style={styles.input}
          value={cpf}
          onChangeText={(t) => setCpf(formatCpf(t))}
          placeholder="000.000.000-00"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
        />

        <Text style={styles.inputLabel}>Telefone / WhatsApp *</Text>
        <TextInput
          style={styles.input}
          value={telefone}
          onChangeText={(t) => setTelefone(formatTelefone(t))}
          placeholder="(11) 99999-9999"
          placeholderTextColor="#aaa"
          keyboardType="phone-pad"
        />

        {erro ? <Text style={styles.erroText}>{erro}</Text> : null}

        <TouchableOpacity style={styles.btnConfirmar} onPress={handleConfirmar}>
          <Text style={styles.btnConfirmarText}>CONFIRMAR PRÉ-INSCRIÇÃO</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Tela: Protocolo ──────────────────────────────────────────────────────────

function TelaProtocolo({
  inscricao,
  onVoltar,
}: {
  inscricao: Inscricao;
  onVoltar: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: ROXO }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[
          styles.protocoloContent,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Ícone de sucesso */}
        <View style={styles.protocoloIconBox}>
          <Text style={styles.protocoloIconText}>✓</Text>
        </View>

        <Text style={styles.protocoloTitulo}>Pré-inscrição{'\n'}realizada!</Text>

        <View style={styles.protocoloBox}>
          <Text style={styles.protocoloLabel}>Número do protocolo</Text>
          <Text style={styles.protocoloNumero}>{inscricao.protocolo}</Text>
        </View>

        <View style={styles.protocoloResumo}>
          <Text style={styles.protocoloResumoTitulo}>Resumo</Text>
          <Row label="Curso" value={`${inscricao.curso.icone} ${inscricao.curso.nome}`} />
          <Row label="Unidade" value={inscricao.unidade.nome} />
          <Row label="Turno" value={`${inscricao.turno.label} · ${inscricao.turno.horario}`} />
          <Row label="Aluno" value={inscricao.nomeAluno} />
          <Row label="CPF" value={inscricao.cpf} />
          <Row label="Telefone" value={inscricao.telefone} />
        </View>

        <View style={styles.protocoloOrientacao}>
          <Text style={styles.protocoloOrientacaoTitulo}>⚠️ Próximo passo</Text>
          <Text style={styles.protocoloOrientacaoTexto}>
            Compareça à {inscricao.unidade.nome} com os seguintes documentos para confirmar sua
            matrícula:
          </Text>
          <Text style={styles.protocoloDoc}>• RG ou certidão de nascimento</Text>
          <Text style={styles.protocoloDoc}>• CPF (ou do responsável)</Text>
          <Text style={styles.protocoloDoc}>• Comprovante de residência</Text>
          <Text style={styles.protocoloDoc}>• Foto 3x4 recente</Text>
          <Text style={[styles.protocoloOrientacaoTexto, { marginTop: 10 }]}>
            Informe o protocolo <Text style={{ fontWeight: '800' }}>{inscricao.protocolo}</Text> no
            balcão de atendimento.
          </Text>
        </View>

        <TouchableOpacity style={styles.btnVoltar} onPress={onVoltar}>
          <Text style={styles.btnVoltarText}>VER MINHAS INSCRIÇÕES</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.rowItem}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CursosScreen() {
  const { adicionarInscricao } = useInscricoes();
  const [step, setStep] = useState<Step>('lista');
  const [cursoSel, setCursoSel] = useState<Curso | null>(null);
  const [unidadeSel, setUnidadeSel] = useState<Unidade | null>(null);
  const [turnoSel, setTurnoSel] = useState<Turno | null>(null);
  const [inscricaoFinal, setInscricaoFinal] = useState<Inscricao | null>(null);

  function resetFluxo() {
    setCursoSel(null);
    setUnidadeSel(null);
    setTurnoSel(null);
    setInscricaoFinal(null);
  }

  function handleConfirmarDados(nome: string, cpf: string, telefone: string) {
    if (!cursoSel || !unidadeSel || !turnoSel) return;
    const nova = adicionarInscricao({
      curso: cursoSel,
      unidade: unidadeSel,
      turno: turnoSel,
      nomeAluno: nome,
      cpf,
      telefone,
    });
    setInscricaoFinal(nova);
    setStep('protocolo');
  }

  switch (step) {
    case 'lista':
      return (
        <TelaLista
          onNova={() => {
            resetFluxo();
            setStep('selecionarCurso');
          }}
        />
      );

    case 'selecionarCurso':
      return (
        <TelaEscolherCurso
          onBack={() => setStep('lista')}
          onSelect={(c) => {
            setCursoSel(c);
            setStep('selecionarUnidade');
          }}
        />
      );

    case 'selecionarUnidade':
      return (
        <TelaEscolherUnidade
          onBack={() => setStep('selecionarCurso')}
          onSelect={(u) => {
            setUnidadeSel(u);
            setStep('selecionarTurno');
          }}
        />
      );

    case 'selecionarTurno':
      return (
        <TelaEscolherTurno
          onBack={() => setStep('selecionarUnidade')}
          onSelect={(t) => {
            setTurnoSel(t);
            setStep('dados');
          }}
        />
      );

    case 'dados':
      return (
        <TelaDados
          onBack={() => setStep('selecionarTurno')}
          onConfirmar={handleConfirmarDados}
        />
      );

    case 'protocolo':
      return inscricaoFinal ? (
        <TelaProtocolo
          inscricao={inscricaoFinal}
          onVoltar={() => {
            resetFluxo();
            setStep('lista');
          }}
        />
      ) : null;

    default:
      return null;
  }
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Header
  header: {
    backgroundColor: ROXO,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  // Lista
  listContent: {
    padding: 16,
    gap: 12,
  },
  btnNova: {
    backgroundColor: ROXO,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnNovaPlus: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 24,
  },
  btnNovaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.8,
  },

  // Card de inscrição
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcone: {
    fontSize: 26,
  },
  cardCurso: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  cardUnidade: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 8,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Empty state
  emptyBox: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 44,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },

  // Opções (curso / unidade / turno)
  stepLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  optionIcon: {
    fontSize: 26,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  optionDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  optionArrow: {
    fontSize: 22,
    color: '#bbb',
    fontWeight: '300',
  },

  // Dados pessoais
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    letterSpacing: 0.3,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  erroText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  btnConfirmar: {
    backgroundColor: ROXO,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  btnConfirmarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.8,
  },

  // Protocolo
  protocoloContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  protocoloIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  protocoloIconText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
  },
  protocoloTitulo: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 24,
  },
  protocoloBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  protocoloLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  protocoloNumero: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  protocoloResumo: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  protocoloResumoTitulo: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  rowLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '500',
  },
  rowValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
  },
  protocoloOrientacao: {
    backgroundColor: 'rgba(247,148,29,0.2)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(247,148,29,0.4)',
  },
  protocoloOrientacaoTitulo: {
    color: '#F7941D',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  protocoloOrientacaoTexto: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 18,
  },
  protocoloDoc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 20,
    paddingLeft: 4,
  },
  btnVoltar: {
    backgroundColor: CIANO,
    borderRadius: 30,
    paddingHorizontal: 28,
    paddingVertical: 14,
    alignSelf: 'center',
  },
  btnVoltarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
