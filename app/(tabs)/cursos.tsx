import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MPC } from '@/constants/theme';
import {
  useInscricoes,
  type Curso,
  type Unidade,
  type Turno,
  type Inscricao,
  type DadosInscricao,
  shiftLabel,
  formatTurnoHorario,
  formatDias,
} from '@/contexts/InscricoesContext';

// ─── Constantes ───────────────────────────────────────────────────────────────

const ROXO = '#354FB8';
const CIANO = '#00AAFF';

// ─── Tipos de step ────────────────────────────────────────────────────────────

type Step =
  | 'lista'
  | 'selecionarCurso'
  | 'selecionarUnidade'
  | 'selecionarTurno'
  | 'enviando'
  | 'dados'
  | 'protocolo';

// ─── Componente Header ────────────────────────────────────────────────────────

function Header({ titulo, onBack }: { titulo: string; onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
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

// ─── Loading / Erro genérico ──────────────────────────────────────────────────

function LoadingBox({ mensagem }: { mensagem?: string }) {
  return (
    <View style={styles.centeredBox}>
      <ActivityIndicator size="large" color={ROXO} />
      {mensagem && <Text style={styles.loadingText}>{mensagem}</Text>}
    </View>
  );
}

function ErroBox({ mensagem, onRetry }: { mensagem: string; onRetry?: () => void }) {
  return (
    <View style={styles.centeredBox}>
      <Text style={styles.erroIcone}>⚠️</Text>
      <Text style={styles.erroTexto}>{mensagem}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.btnRetry} onPress={onRetry}>
          <Text style={styles.btnRetryText}>Tentar novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Tela: Lista de inscrições ────────────────────────────────────────────────

function TelaLista({ onNova }: { onNova: () => void }) {
  const { inscricoes, cancelarInscricao } = useInscricoes();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cancelando, setCancelando] = useState<string | null>(null);

  async function handleCancelar(id: string) {
    Alert.alert(
      'Cancelar pré-inscrição',
      'Tem certeza que deseja cancelar esta pré-inscrição?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancelando(id);
            try {
              await cancelarInscricao(id);
            } catch {
              Alert.alert('Erro', 'Não foi possível cancelar a inscrição. Tente novamente.');
            } finally {
              setCancelando(null);
            }
          },
        },
      ],
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <Header titulo="MEUS CURSOS" onBack={() => router.push('/')} />
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.btnNova} onPress={onNova}>
          <Text style={styles.btnNovaPlus}>+</Text>
          <Text style={styles.btnNovaText}>NOVA PRÉ-INSCRIÇÃO</Text>
        </TouchableOpacity>

        {inscricoes.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Nenhuma inscrição ainda.</Text>
            <Text style={styles.emptySubtext}>
              Clique acima para iniciar uma pré-inscrição.
            </Text>
          </View>
        ) : (
          inscricoes.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconeBox}>
                  <Text style={styles.cardIcone}>📚</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardCurso}>{item.curso.title}</Text>
                  <Text style={styles.cardUnidade}>{item.unidade.name}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Turno</Text>
                <Text style={styles.cardValue}>
                  {shiftLabel[item.turno.shift]} · {formatTurnoHorario(item.turno)}
                </Text>
              </View>
              {item.turno.days_of_week?.length > 0 && (
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Dias</Text>
                  <Text style={styles.cardValue}>{formatDias(item.turno.days_of_week)}</Text>
                </View>
              )}
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Protocolo</Text>
                <Text style={[styles.cardValue, { color: ROXO, fontWeight: '700' }]}>
                  {item.protocolo}
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Data</Text>
                <Text style={styles.cardValue}>{item.dataInscricao}</Text>
              </View>
              {item.status === 'pendente' && (
                <TouchableOpacity
                  style={[styles.btnCancelar, cancelando === item.id && { opacity: 0.6 }]}
                  onPress={() => handleCancelar(item.id)}
                  disabled={cancelando === item.id}
                >
                  {cancelando === item.id ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Text style={styles.btnCancelarText}>Cancelar pré-inscrição</Text>
                  )}
                </TouchableOpacity>
              )}
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
  const { cursos, loadingCursos, errorCursos, recarregarCursos } = useInscricoes();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <Header titulo="ESCOLHA O CURSO" onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepLabel}>Passo 1 de 4 — Curso</Text>

        {loadingCursos ? (
          <LoadingBox mensagem="Carregando cursos..." />
        ) : errorCursos ? (
          <ErroBox mensagem={errorCursos} onRetry={recarregarCursos} />
        ) : cursos.length === 0 ? (
          <ErroBox mensagem="Nenhum curso disponível no momento." onRetry={recarregarCursos} />
        ) : (
          cursos.map((curso) => (
            <TouchableOpacity
              key={curso.id}
              style={styles.optionCard}
              onPress={() => onSelect(curso)}
            >
              <Text style={styles.optionIcon}>📚</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>{curso.title}</Text>
                {curso.description ? (
                  <Text style={styles.optionDesc}>{curso.description}</Text>
                ) : null}
                {curso.workload ? (
                  <Text style={styles.optionMeta}>Carga horária: {curso.workload}h</Text>
                ) : null}
              </View>
              <Text style={styles.optionArrow}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── Tela: Selecionar unidade ─────────────────────────────────────────────────

function TelaEscolherUnidade({
  curso,
  onBack,
  onSelect,
}: {
  curso: Curso;
  onBack: () => void;
  onSelect: (u: Unidade) => void;
}) {
  const { unidadesDoCurso } = useInscricoes();
  const insets = useSafeAreaInsets();
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await unidadesDoCurso(curso.id);
      setUnidades(data);
    } catch {
      setErro('Não foi possível carregar as unidades.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [curso.id]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <Header titulo="ESCOLHA A UNIDADE" onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepLabel}>Passo 2 de 4 — Unidade</Text>
        <Text style={styles.subStepInfo}>Curso: {curso.title}</Text>

        {loading ? (
          <LoadingBox mensagem="Carregando unidades..." />
        ) : erro ? (
          <ErroBox mensagem={erro} onRetry={carregar} />
        ) : unidades.length === 0 ? (
          <ErroBox mensagem="Nenhuma unidade oferece este curso no momento." onRetry={carregar} />
        ) : (
          unidades.map((unidade) => (
            <TouchableOpacity
              key={unidade.id}
              style={styles.optionCard}
              onPress={() => onSelect(unidade)}
            >
              <Text style={styles.optionIcon}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>{unidade.name}</Text>
                {unidade.address || unidade.neighborhood ? (
                  <Text style={styles.optionDesc}>
                    {[unidade.address, unidade.neighborhood].filter(Boolean).join(' · ')}
                  </Text>
                ) : null}
                {unidade.city ? (
                  <Text style={styles.optionMeta}>{unidade.city}</Text>
                ) : null}
                {unidade.phone ? (
                  <Text style={styles.optionMeta}>Tel: {unidade.phone}</Text>
                ) : null}
              </View>
              <Text style={styles.optionArrow}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── Tela: Selecionar turno ───────────────────────────────────────────────────

const shiftEmoji: Record<Turno['shift'], string> = {
  manha: '🌅',
  tarde: '☀️',
  noite: '🌙',
};

function TelaEscolherTurno({
  curso,
  unidade,
  onBack,
  onSelect,
}: {
  curso: Curso;
  unidade: Unidade;
  onBack: () => void;
  onSelect: (t: Turno) => void;
}) {
  const { turnosDoCursoNaUnidade } = useInscricoes();
  const insets = useSafeAreaInsets();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await turnosDoCursoNaUnidade(curso.id, unidade.id);
      setTurnos(data);
    } catch {
      setErro('Não foi possível carregar os turnos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [curso.id, unidade.id]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <Header titulo="ESCOLHA O TURNO" onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepLabel}>Passo 3 de 4 — Turno</Text>
        <Text style={styles.subStepInfo}>
          {curso.title} · {unidade.name}
        </Text>

        {loading ? (
          <LoadingBox mensagem="Carregando turnos..." />
        ) : erro ? (
          <ErroBox mensagem={erro} onRetry={carregar} />
        ) : turnos.length === 0 ? (
          <ErroBox mensagem="Nenhum turno disponível para esta combinação." onRetry={carregar} />
        ) : (
          turnos.map((turno) => (
            <TouchableOpacity
              key={turno.id}
              style={styles.optionCard}
              onPress={() => onSelect(turno)}
            >
              <Text style={styles.optionIcon}>{shiftEmoji[turno.shift]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>{shiftLabel[turno.shift]}</Text>
                <Text style={styles.optionDesc}>{formatTurnoHorario(turno)}</Text>
                {turno.days_of_week?.length > 0 && (
                  <Text style={styles.optionMeta}>{formatDias(turno.days_of_week)}</Text>
                )}
                {turno.description ? (
                  <Text style={styles.optionMeta}>{turno.description}</Text>
                ) : null}
                <Text style={styles.optionVagas}>{turno.max_students} vagas disponíveis</Text>
              </View>
              <Text style={styles.optionArrow}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── Tela: Dados pessoais ─────────────────────────────────────────────────────

function TelaDados({
  onBack,
  onConfirmar,
  enviando,
  erroEnvio,
}: {
  onBack: () => void;
  onConfirmar: (nome: string, cpf: string, telefone: string, senha: string) => void;
  enviando: boolean;
  erroEnvio: string | null;
}) {
  const insets = useSafeAreaInsets();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
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
    if (senha.length > 0 && senha.length < 6) return setErro('A senha deve ter pelo menos 6 caracteres.');
    if (senha !== confirmarSenha) return setErro('As senhas não coincidem.');
    setErro('');
    onConfirmar(nome.trim(), cpf, telefone, senha);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F5F5F5' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header titulo="DADOS PESSOAIS" onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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

        {/* ── Seção de senha ─────────────────────────────────────── */}
        <View style={styles.senhaSecao}>
          <Text style={styles.senhaTitulo}>Criar acesso (opcional)</Text>
          <Text style={styles.senhaSubtitulo}>
            Cadastre uma senha para acompanhar suas inscrições pelo app futuramente.
          </Text>
        </View>

        <Text style={styles.inputLabel}>Senha</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={senha}
            onChangeText={setSenha}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#aaa"
            secureTextEntry={!mostrarSenha}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.olhoBtn}
            onPress={() => setMostrarSenha((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.olhoIcone}>{mostrarSenha ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Confirmar senha</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            placeholder="Repita a senha"
            placeholderTextColor="#aaa"
            secureTextEntry={!mostrarConfirmar}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.olhoBtn}
            onPress={() => setMostrarConfirmar((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.olhoIcone}>{mostrarConfirmar ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        {(erro || erroEnvio) ? (
          <Text style={styles.erroText}>{erro || erroEnvio}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.btnConfirmar, enviando && { opacity: 0.6 }]}
          onPress={handleConfirmar}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnConfirmarText}>CONFIRMAR PRÉ-INSCRIÇÃO</Text>
          )}
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
        showsVerticalScrollIndicator={false}
      >
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
          <Row label="Curso" value={inscricao.curso.title} />
          <Row label="Unidade" value={inscricao.unidade.name} />
          <Row
            label="Turno"
            value={`${shiftLabel[inscricao.turno.shift]} · ${formatTurnoHorario(inscricao.turno)}`}
          />
          {inscricao.turno.days_of_week?.length > 0 && (
            <Row label="Dias" value={formatDias(inscricao.turno.days_of_week)} />
          )}
          {inscricao.turno.description ? (
            <Row label="Obs." value={inscricao.turno.description} />
          ) : null}
          <Row label="Aluno" value={inscricao.nomeAluno} />
          <Row label="CPF" value={inscricao.cpf} />
          <Row label="Telefone" value={inscricao.telefone} />
        </View>

        <View style={styles.protocoloOrientacao}>
          <Text style={styles.protocoloOrientacaoTitulo}>⚠️ Próximo passo</Text>
          <Text style={styles.protocoloOrientacaoTexto}>
            Compareça à {inscricao.unidade.name} com os seguintes documentos para confirmar sua
            matrícula:
          </Text>
          <Text style={styles.protocoloDoc}>• RG ou certidão de nascimento</Text>
          <Text style={styles.protocoloDoc}>• CPF (ou do responsável)</Text>
          <Text style={styles.protocoloDoc}>• Comprovante de residência</Text>
          <Text style={styles.protocoloDoc}>• Foto 3x4 recente</Text>
          <Text style={[styles.protocoloOrientacaoTexto, { marginTop: 10 }]}>
            Informe o protocolo{' '}
            <Text style={{ fontWeight: '800' }}>{inscricao.protocolo}</Text> no balcão de
            atendimento.
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
  const { adicionarInscricao, enviando, erroEnvio, authToken, usuario } = useInscricoes();

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

  async function handleConfirmarDados(nome: string, cpf: string, telefone: string, senha: string) {
    if (!cursoSel || !unidadeSel || !turnoSel) return;
    try {
      const nova = await adicionarInscricao({
        curso: cursoSel,
        unidade: unidadeSel,
        turno: turnoSel,
        nomeAluno: nome,
        cpf,
        telefone,
        senha: senha || undefined,
      });
      setInscricaoFinal(nova);
      setStep('protocolo');
    } catch {
      // O erro já está em erroEnvio no context — TelaDados o exibe
    }
  }

  // Quando autenticado, pula a tela de dados e envia direto com os dados do usuário
  async function handleTurnoSelecionado(turno: Turno) {
    setTurnoSel(turno);
    if (authToken && usuario) {
      setStep('enviando');
      try {
        const nova = await adicionarInscricao({
          curso: cursoSel!,
          unidade: unidadeSel!,
          turno,
          nomeAluno: usuario.nome,
          cpf: usuario.cpf,
          telefone: usuario.telefone ?? '',
        });
        setInscricaoFinal(nova);
        setStep('protocolo');
      } catch (e: any) {
        // Mostra o erro via Alert e volta para a lista — não redireciona para TelaDados,
        // pois o usuário já está autenticado e não há dados a corrigir nessa tela
        Alert.alert(
          'Não foi possível se inscrever',
          e?.message ?? 'Ocorreu um erro. Tente novamente.',
          [{ text: 'OK', onPress: () => setStep('lista') }],
        );
      }
    } else {
      setStep('dados');
    }
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
          curso={cursoSel!}
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
          curso={cursoSel!}
          unidade={unidadeSel!}
          onBack={() => setStep('selecionarUnidade')}
          onSelect={handleTurnoSelecionado}
        />
      );

    case 'enviando':
      return (
        <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
          <Header titulo="MEUS CURSOS" />
          <LoadingBox mensagem="Enviando pré-inscrição..." />
        </View>
      );

    case 'dados':
      return (
        <TelaDados
          onBack={() => setStep('selecionarTurno')}
          onConfirmar={handleConfirmarDados}
          enviando={enviando}
          erroEnvio={erroEnvio}
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
  backArrow: { color: '#fff', fontSize: 24, fontWeight: '300' },
  headerTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  // Lista
  listContent: { padding: 16, gap: 12 },
  btnNova: {
    backgroundColor: ROXO,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnNovaPlus: { color: '#fff', fontSize: 22, fontWeight: '300', lineHeight: 24 },
  btnNovaText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.8 },

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
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIconeBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF1FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcone: { fontSize: 22 },
  cardCurso: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  cardUnidade: { fontSize: 12, color: '#666', marginTop: 2 },
  cardDivider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 4 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: 12, color: '#888', fontWeight: '500' },
  cardValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 8,
  },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  // Empty state
  emptyBox: { alignItems: 'center', paddingTop: 48, gap: 8 },
  emptyIcon: { fontSize: 44 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#333' },
  emptySubtext: { fontSize: 13, color: '#888', textAlign: 'center' },

  // Loading / Erro
  centeredBox: { alignItems: 'center', paddingTop: 48, gap: 12 },
  loadingText: { fontSize: 14, color: '#666', marginTop: 4 },
  erroIcone: { fontSize: 36 },
  erroTexto: { fontSize: 14, color: '#555', textAlign: 'center', paddingHorizontal: 16 },
  btnRetry: {
    backgroundColor: ROXO,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
  },
  btnRetryText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Step info
  stepLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subStepInfo: {
    fontSize: 13,
    color: ROXO,
    fontWeight: '600',
    marginBottom: 6,
  },

  // Opções (curso / unidade / turno)
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
  optionIcon: { fontSize: 26 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  optionDesc: { fontSize: 12, color: '#666', marginTop: 3 },
  optionMeta: { fontSize: 11, color: '#999', marginTop: 2, fontStyle: 'italic' },
  optionVagas: {
    fontSize: 11,
    color: '#22C55E',
    fontWeight: '600',
    marginTop: 3,
  },
  optionArrow: { fontSize: 22, color: '#bbb', fontWeight: '300' },

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
  erroText: { color: '#EF4444', fontSize: 13, fontWeight: '600', marginTop: 4 },

  // Seção de senha
  senhaSecao: {
    marginTop: 16,
    marginBottom: 4,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  senhaTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  senhaSubtitulo: {
    fontSize: 12,
    color: '#888',
    lineHeight: 17,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  olhoBtn: {
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  olhoIcone: {
    fontSize: 18,
  },

  btnConfirmar: {
    backgroundColor: ROXO,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  btnConfirmarText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.8 },

  // Protocolo
  protocoloContent: { paddingHorizontal: 24, alignItems: 'center' },
  protocoloIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  protocoloIconText: { color: '#fff', fontSize: 36, fontWeight: '800' },
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
  protocoloNumero: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1.5 },
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
  rowLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '500' },
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
  btnVoltarText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },

  // Cancelar inscrição
  btnCancelar: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    marginTop: 4,
  },
  btnCancelarText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
});
