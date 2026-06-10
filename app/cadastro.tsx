import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useInscricoes } from '@/contexts/InscricoesContext';

const AZUL = '#1565C0';
const AZUL_ESCURO = '#1565C0';
const AMARELO = '#FFD600';
const BG = '#F4F7FF';
const TEXTO = '#1A2D5A';
const SUBTEXTO = '#6B87B0';

function formatarCPF(valor: string): string {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);
  return numeros
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function validarCPF(cpf: string): boolean {
  const n = cpf.replace(/\D/g, '');
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i += 1) soma += Number.parseInt(n[i], 10) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== Number.parseInt(n[9], 10)) return false;
  soma = 0;
  for (let i = 0; i < 10; i += 1) soma += Number.parseInt(n[i], 10) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === Number.parseInt(n[10], 10);
}

function formatarTelefone(valor: string): string {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);
  if (numeros.length <= 10) {
    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return numeros
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
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

      <Text style={styles.headerOverline}>NOVO CADASTRO</Text>
      <Text style={styles.headerTitle}>Crie sua conta</Text>
      <Text style={styles.headerSubtitle}>
        Cadastre-se para acompanhar inscrições e receber novidades.
      </Text>
    </View>
  );
}

export default function CadastroScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { registrar } = useInscricoes();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmarSenhaVisivel, setConfirmarSenhaVisivel] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  function validar(): string | null {
    if (!nome.trim() || nome.trim().length < 3) return 'Informe seu nome completo.';
    if (!email.trim() || !email.includes('@')) return 'Informe um e-mail válido.';
    const cpfNumeros = cpf.replace(/\D/g, '');
    if (cpfNumeros.length !== 11 || !validarCPF(cpfNumeros)) return 'Informe um CPF válido.';
    if (!senha || senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
    if (senha !== confirmarSenha) return 'As senhas não coincidem.';
    return null;
  }

  async function handleCadastrar() {
    const mensagemErro = validar();
    if (mensagemErro) {
      setErro(mensagemErro);
      return;
    }

    setErro('');
    setCarregando(true);

    try {
      await registrar({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        cpf: cpf.replace(/\D/g, ''),
        telefone: telefone.replace(/\D/g, ''),
        senha,
      });

      router.replace('/perfil' as any);
    } catch (e: any) {
      setErro(e?.message ?? 'Não foi possível criar a conta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
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
            router.replace('/login' as any);
          }
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 26 }}>
        <View style={styles.formWrap}>
          <View style={styles.formCard}>
            <View style={styles.formTitleRow}>
              <View style={styles.formTitleIconWrap}>
                <Ionicons name="person-add-outline" size={17} color={AZUL} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formTitle}>Criar conta</Text>
                <Text style={styles.formSubtitle}>Preencha seus dados para começar.</Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>Nome completo</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={17} color="#9BACC8" />
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={(v) => {
                  setNome(v);
                  if (erro) setErro('');
                }}
                placeholder="Seu nome completo"
                placeholderTextColor="#9BACC8"
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>E-mail</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={17} color="#9BACC8" />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (erro) setErro('');
                }}
                placeholder="seu@email.com"
                placeholderTextColor="#9BACC8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>CPF</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="card-outline" size={17} color="#9BACC8" />
              <TextInput
                style={styles.input}
                value={cpf}
                onChangeText={(v) => {
                  setCpf(formatarCPF(v));
                  if (erro) setErro('');
                }}
                placeholder="000.000.000-00"
                placeholderTextColor="#9BACC8"
                keyboardType="number-pad"
                returnKeyType="next"
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Telefone (opcional)</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={17} color="#9BACC8" />
              <TextInput
                style={styles.input}
                value={telefone}
                onChangeText={(v) => {
                  setTelefone(formatarTelefone(v));
                  if (erro) setErro('');
                }}
                placeholder="(00) 00000-0000"
                placeholderTextColor="#9BACC8"
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Senha</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={17} color="#9BACC8" />
              <TextInput
                style={styles.input}
                value={senha}
                onChangeText={(v) => {
                  setSenha(v);
                  if (erro) setErro('');
                }}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor="#9BACC8"
                secureTextEntry={!senhaVisivel}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setSenhaVisivel((old) => !old)}>
                <Ionicons
                  name={senhaVisivel ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#6B87B0"
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Confirmar senha</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="shield-checkmark-outline" size={17} color="#9BACC8" />
              <TextInput
                style={styles.input}
                value={confirmarSenha}
                onChangeText={(v) => {
                  setConfirmarSenha(v);
                  if (erro) setErro('');
                }}
                placeholder="Repita a senha"
                placeholderTextColor="#9BACC8"
                secureTextEntry={!confirmarSenhaVisivel}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleCadastrar}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setConfirmarSenhaVisivel((old) => !old)}>
                <Ionicons
                  name={confirmarSenhaVisivel ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#6B87B0"
                />
              </TouchableOpacity>
            </View>

            {erro ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} color="#EF4444" />
                <Text style={styles.errorText}>{erro}</Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, carregando && { opacity: 0.7 }]}
            onPress={handleCadastrar}
            disabled={carregando}>
            {carregando ? (
              <ActivityIndicator color={AZUL} />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Criar conta</Text>
                <Ionicons name="arrow-forward" size={17} color={AZUL} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/login' as any)}>
            <Text style={styles.secondaryButtonText}>Já tenho conta</Text>
          </TouchableOpacity>

          <Text style={styles.footnote}>
            Com sua conta criada, você acompanha suas pré-inscrições no app.
          </Text>
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

  formWrap: {
    paddingHorizontal: 16,
    marginTop: -12,
  },
  formCard: {
    borderRadius: 24,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: '#EAF0FA',
    shadowColor: AZUL,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  formTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  formTitleIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: AMARELO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    color: AZUL_ESCURO,
    fontSize: 20,
    fontWeight: '900',
  },
  formSubtitle: {
    marginTop: 3,
    color: SUBTEXTO,
    fontSize: 12,
    lineHeight: 17,
  },

  inputLabel: {
    color: TEXTO,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrap: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8EEF9',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: TEXTO,
    paddingVertical: 0,
  },
  eyeButton: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
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

  primaryButton: {
    marginTop: 14,
    backgroundColor: AMARELO,
    borderRadius: 18,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: AMARELO,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryButtonText: {
    color: AZUL,
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 18,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: '#D6E2F7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: AZUL,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  footnote: {
    marginTop: 12,
    textAlign: 'center',
    color: '#8CA6CC',
    fontSize: 11,
    lineHeight: 16,
    paddingHorizontal: 6,
  },
});
