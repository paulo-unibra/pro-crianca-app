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

      <Text style={styles.headerOverline}>BEM-VINDO DE VOLTA</Text>
      <Text style={styles.headerTitle}>Entre na sua conta</Text>
      <Text style={styles.headerSubtitle}>
        Acesse suas inscrições e acompanhe tudo em tempo real.
      </Text>
    </View>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useInscricoes();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleEntrar() {
    if (!email.trim() || !email.includes('@')) {
      setErro('Informe um e-mail válido.');
      return;
    }

    if (!senha.trim()) {
      setErro('Informe sua senha.');
      return;
    }

    setErro('');
    setCarregando(true);

    try {
      await login(email.trim().toLowerCase(), senha);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/' as any);
      }
    } catch (e: any) {
      setErro(e?.message ?? 'Não foi possível entrar. Verifique seus dados.');
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
            router.replace('/' as any);
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
                <Ionicons name="log-in-outline" size={17} color={AZUL} />
              </View>
              <View style={{ flex: 1, marginTop: 10 }}>
                <Text style={styles.formTitle}>Entrar</Text>
                <Text style={styles.formSubtitle}>Use seu e-mail e senha para continuar.</Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>E-mail</Text>
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
                placeholder="Sua senha"
                placeholderTextColor="#9BACC8"
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleEntrar}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setMostrarSenha((old) => !old)}>
                <Ionicons
                  name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
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
            onPress={handleEntrar}
            disabled={carregando}>
            {carregando ? (
              <ActivityIndicator color={AZUL} />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Entrar</Text>
                <Ionicons name="arrow-forward" size={17} color={AZUL} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/cadastro' as any)}>
            <Text style={styles.secondaryButtonText}>Criar conta</Text>
          </TouchableOpacity>

          <Text style={styles.footnote}>
            Ao entrar, você pode acompanhar o status das suas pré-inscrições.
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
