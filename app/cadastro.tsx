import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar as RNStatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useInscricoes } from '@/contexts/InscricoesContext';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 44;
const AZUL = '#354FB8';

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
  for (let i = 0; i < 9; i++) soma += parseInt(n[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(n[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(n[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(n[10]);
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
    if (mensagemErro) return setErro(mensagemErro);

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
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    } catch (e: any) {
      setErro(e.message ?? 'Não foi possível criar a conta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: AZUL }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" translucent />

      {/* Header */}
      <View style={[styles.header, { paddingTop: STATUSBAR_HEIGHT + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/login')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Image
          source={require('@/assets/images/logo-branca.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroOverline}>NOVO CADASTRO</Text>
          <Text style={styles.heroTitulo}>Crie sua{'\n'}conta</Text>
          <Text style={styles.heroSubtitulo}>
            Cadastre-se para acompanhar suas inscrições e receber novidades dos nossos cursos.
          </Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <Text style={styles.inputLabel}>Nome completo</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={(v) => { setNome(v); setErro(''); }}
            placeholder="Seu nome completo"
            placeholderTextColor="rgba(255,255,255,0.35)"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text style={[styles.inputLabel, { marginTop: 16 }]}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(v) => { setEmail(v); setErro(''); }}
            placeholder="seu@email.com"
            placeholderTextColor="rgba(255,255,255,0.35)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text style={[styles.inputLabel, { marginTop: 16 }]}>CPF</Text>
          <TextInput
            style={styles.input}
            value={cpf}
            onChangeText={(v) => { setCpf(formatarCPF(v)); setErro(''); }}
            placeholder="000.000.000-00"
            placeholderTextColor="rgba(255,255,255,0.35)"
            keyboardType="number-pad"
            returnKeyType="next"
          />

          <Text style={[styles.inputLabel, { marginTop: 16 }]}>Telefone <Text style={styles.opcional}>(opcional)</Text></Text>
          <TextInput
            style={styles.input}
            value={telefone}
            onChangeText={(v) => { setTelefone(formatarTelefone(v)); setErro(''); }}
            placeholder="(00) 00000-0000"
            placeholderTextColor="rgba(255,255,255,0.35)"
            keyboardType="phone-pad"
            returnKeyType="next"
          />

          <Text style={[styles.inputLabel, { marginTop: 16 }]}>Senha</Text>
          <View style={styles.senhaWrap}>
            <TextInput
              style={[styles.input, styles.inputSenha]}
              value={senha}
              onChangeText={(v) => { setSenha(v); setErro(''); }}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor="rgba(255,255,255,0.35)"
              secureTextEntry={!senhaVisivel}
              returnKeyType="next"
            />
            <TouchableOpacity
              style={styles.senhaToggle}
              onPress={() => setSenhaVisivel((v) => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.senhaToggleText}>{senhaVisivel ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.inputLabel, { marginTop: 16 }]}>Confirmar senha</Text>
          <View style={styles.senhaWrap}>
            <TextInput
              style={[styles.input, styles.inputSenha]}
              value={confirmarSenha}
              onChangeText={(v) => { setConfirmarSenha(v); setErro(''); }}
              placeholder="Repita a senha"
              placeholderTextColor="rgba(255,255,255,0.35)"
              secureTextEntry={!confirmarSenhaVisivel}
              returnKeyType="done"
              onSubmitEditing={handleCadastrar}
            />
            <TouchableOpacity
              style={styles.senhaToggle}
              onPress={() => setConfirmarSenhaVisivel((v) => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.senhaToggleText}>{confirmarSenhaVisivel ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {erro ? <Text style={styles.erroText}>{erro}</Text> : null}

          <TouchableOpacity
            style={[styles.btnCadastrar, carregando && { opacity: 0.7 }]}
            onPress={handleCadastrar}
            disabled={carregando}
            activeOpacity={0.8}>
            {carregando ? (
              <ActivityIndicator color={AZUL} />
            ) : (
              <Text style={styles.btnCadastrarText}>CRIAR CONTA</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnJaTenho}
            onPress={() => router.replace('/login')}
            activeOpacity={0.8}>
            <Text style={styles.btnJaTenhoText}>Já tenho conta → Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
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
  logoImage: {
    width: 110,
    height: 60,
  },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },

  hero: {
    paddingVertical: 28,
    gap: 8,
  },
  heroOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  heroTitulo: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 42,
  },
  heroSubtitulo: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    lineHeight: 20,
    maxWidth: '85%',
  },

  form: {
    gap: 0,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  opcional: {
    fontWeight: '400',
    color: 'rgba(255,255,255,0.45)',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  senhaWrap: {
    position: 'relative',
  },
  inputSenha: {
    paddingRight: 52,
  },
  senhaToggle: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  senhaToggleText: {
    fontSize: 18,
  },

  erroText: {
    color: '#ff8a80',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },

  btnCadastrar: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 28,
  },
  btnCadastrarText: {
    color: AZUL,
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 1,
  },

  btnJaTenho: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnJaTenhoText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
});
