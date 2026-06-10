import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInscricoes } from '@/contexts/InscricoesContext';

const AZUL = '#1565C0';
const AMARELO = '#FFD600';
const BG = '#F4F7FF';
const TEXTO = '#1A2D5A';
const SUBTEXTO = '#6B87B0';

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  confirmada: 'Confirmada',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

const STATUS_COLOR: Record<string, string> = {
  pendente: '#F7941D',
  confirmada: '#22C55E',
  concluida: '#1565C0',
  cancelada: '#EF4444',
};

function formatCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return cpf;
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatCpfInput(text: string) {
  const d = text.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
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

function Header({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}> 
      <View style={styles.headerCircleLarge} pointerEvents="none" />
      <View style={styles.headerCircleSmall} pointerEvents="none" />

      <View style={styles.headerTopRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>

        <Image
          source={require('@/assets/images/logo-branca.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <View style={styles.backButton} />
      </View>

      <Text style={styles.headerOverline}>MINHA CONTA</Text>
      <Text style={styles.headerTitle}>Perfil</Text>
      <Text style={styles.headerSubtitle}>Seus dados, inscrições e configurações de conta.</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  muted,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={14} color={AZUL} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, muted && styles.infoValueMuted]}>{value}</Text>
      </View>
    </View>
  );
}

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { inscricoes, authToken, usuario, cancelarInscricao, logout, atualizarPerfil } =
    useInscricoes();

  const [cancelando, setCancelando] = useState<string | null>(null);

  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroEdicao, setErroEdicao] = useState('');
  const [form, setForm] = useState({ nome: '', cpf: '', telefone: '' });

  const autenticado = Boolean(authToken);
  const nomeUsuario = usuario?.nome ?? null;
  const cpfUsuario = usuario?.cpf ?? null;
  const telefoneUsuario = usuario?.telefone ?? null;
  const emailUsuario = usuario?.email ?? null;

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
    if (!form.nome.trim()) {
      setErroEdicao('Informe o nome completo.');
      return;
    }

    const cpfLimpo = form.cpf.replace(/\D/g, '');
    if (cpfLimpo.length > 0 && cpfLimpo.length !== 11) {
      setErroEdicao('CPF inválido.');
      return;
    }

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

  async function handleLogout() {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/' as any);
        },
      },
    ]);
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
      ],
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" translucent />

      <Header
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/' as any);
          }
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 26 }}>
        <View style={styles.contentWrap}>
          <View style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              <Ionicons name="person" size={30} color={AZUL} />
            </View>
            <Text style={styles.userName}>
              {nomeUsuario ?? (autenticado ? 'Carregando...' : 'Visitante')}
            </Text>
            <Text style={styles.userTag}>
              {autenticado ? 'Conta vinculada' : 'Sem conta vinculada'}
            </Text>
          </View>

          {autenticado ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Dados pessoais</Text>

                {!editando ? (
                  <TouchableOpacity style={styles.editButton} onPress={abrirEdicao}>
                    <Ionicons name="create-outline" size={13} color={AZUL} />
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {editando ? (
                <View style={{ gap: 8 }}>
                  <Text style={styles.inputLabel}>Nome completo *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.nome}
                    onChangeText={(v) => setForm((old) => ({ ...old, nome: v }))}
                    placeholder="Seu nome completo"
                    placeholderTextColor="#9BACC8"
                    autoCapitalize="words"
                  />

                  <Text style={styles.inputLabel}>E-mail</Text>
                  <TextInput style={[styles.input, styles.inputDisabled]} value={emailUsuario ?? ''} editable={false} />
                  <Text style={styles.inputHint}>O e-mail não pode ser alterado.</Text>

                  <Text style={styles.inputLabel}>CPF</Text>
                  <TextInput
                    style={styles.input}
                    value={form.cpf}
                    onChangeText={(v) => setForm((old) => ({ ...old, cpf: formatCpfInput(v) }))}
                    placeholder="000.000.000-00"
                    placeholderTextColor="#9BACC8"
                    keyboardType="numeric"
                  />

                  <Text style={styles.inputLabel}>Telefone</Text>
                  <TextInput
                    style={styles.input}
                    value={form.telefone}
                    onChangeText={(v) =>
                      setForm((old) => ({ ...old, telefone: formatTelefoneInput(v) }))
                    }
                    placeholder="(81) 99999-9999"
                    placeholderTextColor="#9BACC8"
                    keyboardType="phone-pad"
                  />

                  {erroEdicao ? (
                    <View style={styles.errorRow}>
                      <Ionicons name="alert-circle" size={14} color="#EF4444" />
                      <Text style={styles.errorText}>{erroEdicao}</Text>
                    </View>
                  ) : null}

                  <View style={styles.editButtonsRow}>
                    <TouchableOpacity
                      style={styles.cancelEditButton}
                      onPress={() => setEditando(false)}
                      disabled={salvando}>
                      <Text style={styles.cancelEditButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={salvarEdicao}
                      disabled={salvando}>
                      {salvando ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.saveButtonText}>Salvar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  {emailUsuario ? <InfoRow icon="mail-outline" label="E-mail" value={emailUsuario} /> : null}

                  {cpfUsuario ? (
                    <InfoRow icon="card-outline" label="CPF" value={formatCpf(cpfUsuario)} />
                  ) : (
                    <InfoRow
                      icon="card-outline"
                      label="CPF"
                      value="Não cadastrado - necessário para doações"
                      muted
                    />
                  )}

                  {telefoneUsuario ? (
                    <InfoRow
                      icon="call-outline"
                      label="Telefone"
                      value={formatTelefoneInput(telefoneUsuario)}
                    />
                  ) : (
                    <InfoRow
                      icon="call-outline"
                      label="Telefone"
                      value="Não cadastrado"
                      muted
                    />
                  )}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Acesse sua conta</Text>
              <Text style={styles.notAuthText}>
                Entre para acompanhar seu histórico e gerenciar inscrições.
              </Text>

              <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/login' as any)}>
                <Text style={styles.primaryButtonText}>Entrar na minha conta</Text>
                <Ionicons name="arrow-forward" size={16} color={AZUL} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push('/cadastro' as any)}>
                <Text style={styles.secondaryButtonText}>Criar conta</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Minhas inscrições{inscricoes.length > 0 ? ` (${inscricoes.length})` : ''}
            </Text>

            {inscricoes.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>
                  {autenticado
                    ? 'Você ainda não tem inscrições.'
                    : 'Faça uma inscrição para ver seu histórico aqui.'}
                </Text>
                <TouchableOpacity
                  style={styles.outlineButton}
                  onPress={() => router.push('/cursos' as any)}>
                  <Text style={styles.outlineButtonText}>Ver cursos disponíveis</Text>
                </TouchableOpacity>
              </View>
            ) : (
              inscricoes.map((insc) => (
                <View key={insc.id} style={styles.enrollmentCard}>
                  <View style={styles.enrollmentHeader}>
                    <Text style={styles.enrollmentProtocol}>{insc.protocolo}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: `${STATUS_COLOR[insc.status]}22`,
                          borderColor: `${STATUS_COLOR[insc.status]}66`,
                        },
                      ]}>
                      <Text style={[styles.statusText, { color: STATUS_COLOR[insc.status] }]}>
                        {STATUS_LABEL[insc.status]}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.enrollmentCourse}>{insc.curso.title}</Text>
                  <Text style={styles.enrollmentDetail}>📍 {insc.unidade.name}</Text>
                  {insc.turno.start_time && insc.turno.end_time ? (
                    <Text style={styles.enrollmentDetail}>
                      🕒 {insc.turno.start_time} - {insc.turno.end_time}
                    </Text>
                  ) : null}
                  <Text style={styles.enrollmentDate}>Inscrito em {formatDate(insc.dataInscricao)}</Text>

                  {insc.status === 'pendente' ? (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelar(insc.id, insc.curso.title)}
                      disabled={cancelando === insc.id}>
                      {cancelando === insc.id ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <Text style={styles.cancelButtonText}>Cancelar pré-inscrição</Text>
                      )}
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))
            )}
          </View>

          {autenticado ? (
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Sair da conta</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    backgroundColor: AZUL,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 18,
    paddingBottom: 22,
    overflow: 'hidden',
  },
  headerCircleLarge: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(111, 196, 255, 0.16)',
    right: -45,
    top: -25,
  },
  headerCircleSmall: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 214, 0, 0.18)',
    right: 14,
    top: 18,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 112,
    height: 42,
    marginLeft: -8,
  },
  headerOverline: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 35,
    marginBottom: 6,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: '92%',
  },

  contentWrap: {
    paddingHorizontal: 16,
    marginTop: -12,
    gap: 12,
  },

  profileCard: {
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAF0FA',
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: AZUL,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#D6E6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  userName: {
    color: TEXTO,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  userTag: {
    marginTop: 3,
    color: SUBTEXTO,
    fontSize: 12,
    fontWeight: '500',
  },

  card: {
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAF0FA',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: AZUL,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    color: TEXTO,
    fontSize: 16,
    fontWeight: '800',
  },

  editButton: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#D6E2F7',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    color: AZUL,
    fontSize: 12,
    fontWeight: '700',
  },

  infoRow: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECF1FA',
    backgroundColor: '#FAFCFF',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    color: '#8CA6CC',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 1,
  },
  infoValue: {
    color: TEXTO,
    fontSize: 13,
    fontWeight: '600',
  },
  infoValueMuted: {
    color: '#A0B4D4',
    fontStyle: 'italic',
  },

  inputLabel: {
    color: TEXTO,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 3,
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8EEF9',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    fontSize: 14,
    color: TEXTO,
  },
  inputDisabled: {
    backgroundColor: '#F2F6FD',
    color: '#8CA6CC',
  },
  inputHint: {
    marginTop: 3,
    color: '#8CA6CC',
    fontSize: 11,
  },

  errorRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },

  editButtonsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  cancelEditButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D6E2F7',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelEditButtonText: {
    color: SUBTEXTO,
    fontSize: 13,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: AZUL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },

  notAuthText: {
    marginTop: 4,
    color: SUBTEXTO,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    marginTop: 12,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: AMARELO,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primaryButtonText: {
    color: AZUL,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  secondaryButton: {
    marginTop: 8,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D6E2F7',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: AZUL,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 6,
  },
  emptyText: {
    color: SUBTEXTO,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  outlineButton: {
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#D6E2F7',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  outlineButtonText: {
    color: AZUL,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  enrollmentCard: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECF1FA',
    backgroundColor: '#FAFCFF',
    padding: 12,
  },
  enrollmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  enrollmentProtocol: {
    color: '#8CA6CC',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  enrollmentCourse: {
    color: TEXTO,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  enrollmentDetail: {
    color: SUBTEXTO,
    fontSize: 12,
    marginTop: 1,
  },
  enrollmentDate: {
    color: '#8CA6CC',
    fontSize: 11,
    marginTop: 6,
  },
  cancelButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#F4B5B5',
    backgroundColor: '#FFF4F4',
    paddingHorizontal: 12,
    paddingVertical: 7,
    minWidth: 44,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },

  logoutButton: {
    marginTop: 2,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F4B5B5',
    backgroundColor: '#FFF4F4',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
