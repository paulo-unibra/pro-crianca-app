import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar as RNStatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MPC } from '@/constants/theme';
import { useInscricoes } from '@/contexts/InscricoesContext';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 44;
const AZUL = '#354FB8';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return cpf;
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatCpfInput(text: string) {
  const d = text.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function formatTelefoneInput(text: string) {
  const d = text.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
};

const STATUS_COLOR: Record<string, string> = {
  pendente: '#F7941D',
  confirmada: '#4CAF50',
  cancelada: '#e53935',
};

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { inscricoes, authToken, usuario, cancelarInscricao, logout, atualizarPerfil } = useInscricoes();
  const [cancelando, setCancelando] = useState<string | null>(null);

  // ── Estado do formulário de edição ───────────────────────────────────────────
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroEdicao, setErroEdicao] = useState('');
  const [form, setForm] = useState({ nome: '', cpf: '', telefone: '' });

  function abrirEdicao() {
    setForm({
      nome: usuario?.nome ?? '',
      cpf: formatCpf(usuario?.cpf ?? ''),
      telefone: formatTelefoneInput(usuario?.telefone ?? ''),
    });
    setErroEdicao('');
    setEditando(true);
  }

  async function salvarEdicao() {
    if (!form.nome.trim()) return setErroEdicao('Informe o nome completo.');
    const cpfLimpo = form.cpf.replace(/\D/g, '');
    if (cpfLimpo.length > 0 && cpfLimpo.length !== 11) return setErroEdicao('CPF inválido.');

    setSalvando(true);
    setErroEdicao('');
    try {
      await atualizarPerfil({
        nome: form.nome.trim(),
        cpf: cpfLimpo || undefined,
        telefone: form.telefone,
      });
      setEditando(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (e: any) {
      setErroEdicao(e.message ?? 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  // ── Logout ───────────────────────────────────────────────────────────────────

  async function handleLogout() {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  }

  async function handleCancelar(id: string, nomeCurso: string) {
    Alert.alert(
      'Cancelar inscrição',
      `Tem certeza que deseja cancelar sua pré-inscrição em "${nomeCurso}"?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancelando(id);
            try {
              await cancelarInscricao(id);
            } catch (e: any) {
              Alert.alert('Erro', e.message ?? 'Não foi possível cancelar. Tente novamente.');
            } finally {
              setCancelando(null);
            }
          },
        },
      ]
    );
  }

  const nomeUsuario = usuario?.nome ?? null;
  const cpfUsuario = usuario?.cpf ?? null;
  const telefoneUsuario = usuario?.telefone ?? null;
  const emailUsuario = usuario?.email ?? null;
  const autenticado = !!authToken;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: MPC.azulEscuro }}>
        <StatusBar style="light" translucent />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Voltar</Text>
          </TouchableOpacity>
          <Image
            source={require('@/assets/images/logo-branca.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar + título */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarIcon}>👤</Text>
            </View>
            <Text style={styles.nomeUsuario}>
              {nomeUsuario ?? (autenticado ? 'Carregando…' : 'Visitante')}
            </Text>
            <Text style={styles.tagUsuario}>
              {autenticado ? 'Conta vinculada' : 'Sem conta vinculada'}
            </Text>
          </View>

          {/* Card de dados pessoais */}
          {autenticado && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitulo}>Dados pessoais</Text>
                {!editando && (
                  <TouchableOpacity style={styles.btnEditar} onPress={abrirEdicao} activeOpacity={0.75}>
                    <Text style={styles.btnEditarText}>✏️ Editar</Text>
                  </TouchableOpacity>
                )}
              </View>

              {editando ? (
                /* ── Formulário de edição ── */
                <View style={styles.formEdicao}>
                  <Text style={styles.inputLabel}>Nome completo *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.nome}
                    onChangeText={(v) => setForm({ ...form, nome: v })}
                    placeholder="Seu nome completo"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    autoCapitalize="words"
                  />

                  <Text style={styles.inputLabel}>E-mail</Text>
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={emailUsuario ?? ''}
                    editable={false}
                  />
                  <Text style={styles.inputHint}>O e-mail não pode ser alterado.</Text>

                  <Text style={styles.inputLabel}>CPF</Text>
                  <TextInput
                    style={styles.input}
                    value={form.cpf}
                    onChangeText={(v) => setForm({ ...form, cpf: formatCpfInput(v) })}
                    placeholder="000.000.000-00"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="numeric"
                  />

                  <Text style={styles.inputLabel}>Telefone</Text>
                  <TextInput
                    style={styles.input}
                    value={form.telefone}
                    onChangeText={(v) => setForm({ ...form, telefone: formatTelefoneInput(v) })}
                    placeholder="(81) 99999-9999"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="phone-pad"
                  />

                  {erroEdicao ? (
                    <Text style={styles.erroText}>{erroEdicao}</Text>
                  ) : null}

                  <View style={styles.botoesEdicao}>
                    <TouchableOpacity
                      style={styles.btnCancelarEdicao}
                      onPress={() => setEditando(false)}
                      disabled={salvando}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.btnCancelarEdicaoText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnSalvar}
                      onPress={salvarEdicao}
                      disabled={salvando}
                      activeOpacity={0.75}
                    >
                      {salvando
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={styles.btnSalvarText}>Salvar</Text>
                      }
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* ── Visualização ── */
                <View>
                  {emailUsuario ? <InfoRow label="E-mail" value={emailUsuario} icon="✉️" /> : null}
                  {cpfUsuario ? <InfoRow label="CPF" value={formatCpf(cpfUsuario)} icon="🪪" /> : (
                    <InfoRow label="CPF" value="Não cadastrado — necessário para doações" icon="🪪" destaque />
                  )}
                  {telefoneUsuario
                    ? <InfoRow label="Telefone" value={formatTelefoneInput(telefoneUsuario)} icon="📱" />
                    : <InfoRow label="Telefone" value="Não cadastrado" icon="📱" destaque />
                  }
                </View>
              )}
            </View>
          )}

          {/* Card de inscrições */}
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>
              Minhas inscrições{inscricoes.length > 0 ? ` (${inscricoes.length})` : ''}
            </Text>

            {inscricoes.length === 0 ? (
              <View style={styles.vazio}>
                <Text style={styles.vazioIcon}>📋</Text>
                <Text style={styles.vazioTexto}>
                  {autenticado
                    ? 'Você ainda não tem inscrições.'
                    : 'Faça uma inscrição para ver seu histórico aqui.'}
                </Text>
                <TouchableOpacity
                  style={styles.btnSecundario}
                  onPress={() => router.push('/cursos' as any)}
                >
                  <Text style={styles.btnSecundarioText}>VER CURSOS DISPONÍVEIS</Text>
                </TouchableOpacity>
              </View>
            ) : (
              inscricoes.map((insc) => (
                <View key={insc.id} style={styles.inscricaoCard}>
                  <View style={styles.inscricaoHeader}>
                    <Text style={styles.inscricaoProtocolo}>{insc.protocolo}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[insc.status] + '22' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLOR[insc.status] }]}>
                        {STATUS_LABEL[insc.status]}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.inscricaoCurso}>{insc.curso.title}</Text>
                  <Text style={styles.inscricaoDetalhe}>📍 {insc.unidade.name}</Text>
                  {insc.turno.start_time && insc.turno.end_time ? (
                    <Text style={styles.inscricaoDetalhe}>
                      🕐 {insc.turno.start_time} – {insc.turno.end_time}
                    </Text>
                  ) : null}
                  <Text style={styles.inscricaoData}>
                    Inscrito em {formatDate(insc.dataInscricao)}
                  </Text>

                  {insc.status === 'pendente' && (
                    <TouchableOpacity
                      style={styles.btnCancelar}
                      onPress={() => handleCancelar(insc.id, insc.curso.title)}
                      disabled={cancelando === insc.id}
                      activeOpacity={0.75}
                    >
                      {cancelando === insc.id
                        ? <ActivityIndicator size="small" color="#e53935" />
                        : <Text style={styles.btnCancelarText}>Cancelar pré-inscrição</Text>
                      }
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>

          {/* Sem conta */}
          {!autenticado && (
            <>
              <TouchableOpacity
                style={styles.btnEntrar}
                onPress={() => router.push('/login' as any)}
                activeOpacity={0.8}>
                <Text style={styles.btnEntrarText}>ENTRAR NA MINHA CONTA</Text>
              </TouchableOpacity>
              <View style={styles.avisoCard}>
                <Text style={styles.avisoTexto}>
                  💡 Ao fazer uma inscrição, sua conta é criada automaticamente com o CPF informado. Assim você poderá acompanhar seu histórico aqui.
                </Text>
              </View>
            </>
          )}

          {/* Logout */}
          {autenticado && (
            <TouchableOpacity style={styles.btnLogout} onPress={handleLogout} activeOpacity={0.75}>
              <Text style={styles.btnLogoutText}>SAIR DA CONTA</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Componente auxiliar ──────────────────────────────────────────────────────

function InfoRow({ label, value, icon, destaque }: { label: string; value: string; icon: string; destaque?: boolean }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.icon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={[infoStyles.value, destaque && infoStyles.valueDestaque]}>{value}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  icon: { fontSize: 20 },
  label: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  value: {
    color: MPC.branco,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 1,
  },
  valueDestaque: {
    color: '#F7941D',
    fontSize: 13,
    fontStyle: 'italic',
  },
});

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    paddingTop: STATUSBAR_HEIGHT + 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoImage: { width: 130, height: 75 },
  backBtn: { paddingVertical: 4, paddingRight: 12 },
  backBtnText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },

  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },

  avatarSection: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', marginBottom: 4,
  },
  avatarIcon: { fontSize: 40 },
  nomeUsuario: { color: MPC.branco, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  tagUsuario: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '500' },

  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', marginBottom: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardTitulo: { color: MPC.branco, fontSize: 16, fontWeight: '800' },

  btnEditar: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  btnEditarText: { color: MPC.branco, fontSize: 12, fontWeight: '700' },

  // Formulário de edição
  formEdicao: { gap: 2 },
  inputLabel: {
    color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700',
    letterSpacing: 0.3, marginTop: 10, marginBottom: 4,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: MPC.branco,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  inputDisabled: { opacity: 0.4 },
  inputHint: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 },
  erroText: { color: '#F87171', fontSize: 13, fontWeight: '600', marginTop: 8 },
  botoesEdicao: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnCancelarEdicao: {
    flex: 1, paddingVertical: 13, borderRadius: 30, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
  },
  btnCancelarEdicaoText: { color: 'rgba(255,255,255,0.7)', fontWeight: '700', fontSize: 13 },
  btnSalvar: {
    flex: 1, paddingVertical: 13, borderRadius: 30, alignItems: 'center',
    backgroundColor: AZUL,
  },
  btnSalvarText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },

  // Vazio
  vazio: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  vazioIcon: { fontSize: 36 },
  vazioTexto: { color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  btnSecundario: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  btnSecundarioText: { color: MPC.branco, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  // Inscrição
  inscricaoCard: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 4,
  },
  inscricaoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  inscricaoProtocolo: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  inscricaoCurso: { color: MPC.branco, fontSize: 15, fontWeight: '800', marginBottom: 2 },
  inscricaoDetalhe: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  inscricaoData: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 4 },
  btnCancelar: {
    marginTop: 10, alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: 'rgba(229,57,53,0.6)',
    backgroundColor: 'rgba(229,57,53,0.08)', minWidth: 48, alignItems: 'center',
  },
  btnCancelarText: { color: '#ff6b6b', fontSize: 12, fontWeight: '700' },

  // Aviso
  avisoCard: {
    backgroundColor: 'rgba(0,170,255,0.12)', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: 'rgba(0,170,255,0.25)', marginBottom: 4,
  },
  avisoTexto: { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 19 },

  // Logout
  btnLogout: {
    borderRadius: 30, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(229,57,53,0.5)',
    backgroundColor: 'rgba(229,57,53,0.08)', marginTop: 4, marginBottom: 8,
  },
  btnLogoutText: { color: '#ff6b6b', fontSize: 13, fontWeight: '800', letterSpacing: 0.8 },

  // Entrar
  btnEntrar: {
    backgroundColor: '#fff', borderRadius: 30, paddingVertical: 15,
    alignItems: 'center', marginTop: 4, marginBottom: 12,
  },
  btnEntrarText: { color: MPC.azulEscuro, fontWeight: '900', fontSize: 14, letterSpacing: 0.8 },
});

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 44;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return cpf;
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
};

const STATUS_COLOR: Record<string, string> = {
  pendente: '#F7941D',
  confirmada: '#4CAF50',
  cancelada: '#e53935',
};

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { inscricoes, authToken, usuario, cancelarInscricao, logout } = useInscricoes();
  const [cancelando, setCancelando] = useState<string | null>(null);

  async function handleLogout() {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair? Você precisará fazer uma nova inscrição para acessar seu histórico novamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  }

  async function handleCancelar(id: string, nomeCurso: string) {
    Alert.alert(
      'Cancelar inscrição',
      `Tem certeza que deseja cancelar sua pré-inscrição em "${nomeCurso}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancelando(id);
            try {
              await cancelarInscricao(id);
            } catch (e: any) {
              Alert.alert('Erro', e.message ?? 'Não foi possível cancelar. Tente novamente.');
            } finally {
              setCancelando(null);
            }
          },
        },
      ]
    );
  }

  // Extrai dados do usuário do contexto (preferência) ou da primeira inscrição (fallback)
  const primeiraInscricao = inscricoes[0] ?? null;
  const nomeUsuario = usuario?.nome ?? primeiraInscricao?.nomeAluno ?? null;
  const cpfUsuario = usuario?.cpf ?? primeiraInscricao?.cpf ?? null;
  const telefoneUsuario = usuario?.telefone ?? primeiraInscricao?.telefone ?? null;
  const emailUsuario = usuario?.email ?? null;

  const autenticado = !!authToken;

  return (
    <View style={{ flex: 1, backgroundColor: MPC.azulEscuro }}>
      <StatusBar style="light" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Voltar</Text>
        </TouchableOpacity>
        <Image
          source={require('@/assets/images/logo-branca.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + título */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <Text style={styles.nomeUsuario}>
            {nomeUsuario ?? (autenticado ? 'Carregando…' : 'Visitante')}
          </Text>
          <Text style={styles.tagUsuario}>
            {autenticado ? 'Conta vinculada' : 'Sem conta vinculada'}
          </Text>
        </View>

        {/* Card de dados pessoais */}
        {autenticado && (cpfUsuario || telefoneUsuario || emailUsuario) ? (
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Dados pessoais</Text>

            {emailUsuario ? (
              <InfoRow label="E-mail" value={emailUsuario} icon="✉️" />
            ) : null}

            {cpfUsuario ? (
              <InfoRow label="CPF" value={formatCpf(cpfUsuario)} icon="🪪" />
            ) : null}

            {telefoneUsuario ? (
              <InfoRow label="Telefone" value={telefoneUsuario} icon="📱" />
            ) : null}
          </View>
        ) : null}

        {/* Card de inscrições */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>
            Minhas inscrições{inscricoes.length > 0 ? ` (${inscricoes.length})` : ''}
          </Text>

          {inscricoes.length === 0 ? (
            <View style={styles.vazio}>
              <Text style={styles.vazioIcon}>📋</Text>
              <Text style={styles.vazioTexto}>
                {autenticado
                  ? 'Você ainda não tem inscrições.'
                  : 'Faça uma inscrição para ver seu histórico aqui.'}
              </Text>
              <TouchableOpacity
                style={styles.btnSecundario}
                onPress={() => router.push('/cursos' as any)}
              >
                <Text style={styles.btnSecundarioText}>VER CURSOS DISPONÍVEIS</Text>
              </TouchableOpacity>
            </View>
          ) : (
            inscricoes.map((insc) => (
              <View key={insc.id} style={styles.inscricaoCard}>
                {/* Protocolo + status */}
                <View style={styles.inscricaoHeader}>
                  <Text style={styles.inscricaoProtocolo}>{insc.protocolo}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: STATUS_COLOR[insc.status] + '22' },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: STATUS_COLOR[insc.status] }]}
                    >
                      {STATUS_LABEL[insc.status]}
                    </Text>
                  </View>
                </View>

                {/* Curso */}
                <Text style={styles.inscricaoCurso}>{insc.curso.title}</Text>

                {/* Unidade + turno */}
                <Text style={styles.inscricaoDetalhe}>
                  📍 {insc.unidade.name}
                </Text>
                {insc.turno.start_time && insc.turno.end_time ? (
                  <Text style={styles.inscricaoDetalhe}>
                    🕐 {insc.turno.start_time} – {insc.turno.end_time}
                  </Text>
                ) : null}

                {/* Data */}
                <Text style={styles.inscricaoData}>
                  Inscrito em {formatDate(insc.dataInscricao)}
                </Text>

                {/* Botão cancelar — só para pendentes */}
                {insc.status === 'pendente' && (
                  <TouchableOpacity
                    style={styles.btnCancelar}
                    onPress={() => handleCancelar(insc.id, insc.curso.title)}
                    disabled={cancelando === insc.id}
                    activeOpacity={0.75}
                  >
                    {cancelando === insc.id ? (
                      <ActivityIndicator size="small" color="#e53935" />
                    ) : (
                      <Text style={styles.btnCancelarText}>Cancelar pré-inscrição</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        {/* Aviso sem conta */}
        {!autenticado && (
          <>
            <TouchableOpacity
              style={styles.btnEntrar}
              onPress={() => router.push('/login' as any)}
              activeOpacity={0.8}>
              <Text style={styles.btnEntrarText}>ENTRAR NA MINHA CONTA</Text>
            </TouchableOpacity>

            <View style={styles.avisoCard}>
              <Text style={styles.avisoTexto}>
                💡 Ao fazer uma inscrição, sua conta é criada automaticamente com o CPF informado. Assim você poderá acompanhar seu histórico aqui.
              </Text>
            </View>
          </>
        )}

        {/* Botão de logout */}
        {autenticado && (
          <TouchableOpacity style={styles.btnLogout} onPress={handleLogout} activeOpacity={0.75}>
            <Text style={styles.btnLogoutText}>SAIR DA CONTA</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Componente auxiliar ──────────────────────────────────────────────────────

function InfoRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.icon}>{icon}</Text>
      <View>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  icon: { fontSize: 20 },
  label: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  value: {
    color: MPC.branco,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 1,
  },
});

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    paddingTop: STATUSBAR_HEIGHT + 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoImage: { width: 130, height: 75 },
  backBtn: { paddingVertical: 4, paddingRight: 12 },
  backBtnText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 4,
  },
  avatarIcon: { fontSize: 40 },
  nomeUsuario: {
    color: MPC.branco,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  tagUsuario: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '500',
  },

  // Cards genéricos
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 4,
  },
  cardTitulo: {
    color: MPC.branco,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },

  // Vazio
  vazio: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  vazioIcon: { fontSize: 36 },
  vazioTexto: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  btnSecundario: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  btnSecundarioText: {
    color: MPC.branco,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Card de inscrição
  inscricaoCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 4,
  },
  inscricaoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  inscricaoProtocolo: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inscricaoCurso: {
    color: MPC.branco,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  inscricaoDetalhe: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
  },
  inscricaoData: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    marginTop: 4,
  },
  btnCancelar: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(229,57,53,0.6)',
    backgroundColor: 'rgba(229,57,53,0.08)',
    minWidth: 48,
    alignItems: 'center',
  },
  btnCancelarText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: '700',
  },

  // Aviso
  avisoCard: {
    backgroundColor: 'rgba(0,170,255,0.12)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,170,255,0.25)',
    marginBottom: 4,
  },
  avisoTexto: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    lineHeight: 19,
  },

  // Logout
  btnLogout: {
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(229,57,53,0.5)',
    backgroundColor: 'rgba(229,57,53,0.08)',
    marginTop: 4,
    marginBottom: 8,
  },
  btnLogoutText: {
    color: '#ff6b6b',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // Entrar
  btnEntrar: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  btnEntrarText: {
    color: MPC.azulEscuro,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.8,
  },
});
