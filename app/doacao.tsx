import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  type TextInputProps,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useInscricoes } from '@/contexts/InscricoesContext';

// ─── Constantes ───────────────────────────────────────────────────────────────

const AZUL = '#1B67C8';
const AZUL_ESCURO = '#1565C0';
const AZUL_CLARO = '#1976D2';
const AMARELO = '#FFD600';
const BG = '#F4F7FF';
const TEXTO = '#1A2D5A';
const VERDE = '#00C896';
const STORAGE_KEY = '@mpc_doacao_dados';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type MetodoPagamento = 'pix' | 'boleto' | 'credit_card';
type Step = 'metodo' | 'valor' | 'dados' | 'cartao' | 'processando' | 'confirmacao';

interface DadosDoador {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
}

interface DadosCartao {
  numero: string;
  nome: string;
  validade: string;
  cvv: string;
}

interface FormErrors {
  nome?: string;
  telefone?: string;
  cpf?: string;
  email?: string;
}

interface ResultadoPagamento {
  donation: any;
  payment: {
    order_id?: string;
    charge_id?: string;
    status?: string;
    qr_code?: string;
    qr_code_url?: string;
    boleto_url?: string;
    boleto_barcode?: string;
    due_at?: string;
  };
}

// ─── Formatadores ─────────────────────────────────────────────────────────────

function formatCpf(text: string) {
  const d = text.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function formatTelefone(text: string) {
  const d = text.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

function formatCartaoNumero(text: string) {
  return text.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatValidade(text: string) {
  const d = text.replace(/\D/g, '').slice(0, 4);
  if (d.length >= 3) return d.slice(0, 2) + '/' + d.slice(2);
  return d;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCPF(cpf: string) {
  const digits = cpf.replace(/\D/g, '');
  return digits.length === 11;
}

function validatePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ onBack }: { onBack?: () => void }) {
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
      <Image source={require('@/assets/images/logo-branca.png')} style={styles.logoImage} resizeMode="contain" />
      <View style={styles.backBtn} />
    </View>
  );
}

type DoadorField = keyof DadosDoador;

function DonationProgressHeader({
  onBack,
  step,
}: {
  onBack: () => void;
  step: 1 | 2;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.progressHeader, { paddingTop: insets.top + 10 }]}> 
      <View style={styles.progressTopRow}>
        <TouchableOpacity style={styles.progressBackBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.progressTitle}>Fazer uma doação</Text>
      </View>

      <View style={styles.progressStepsRow}>
        <View style={styles.progressStepWrap}>
          <View style={[styles.progressStepCircle, styles.progressStepCircleActive]}>
            {step > 1 ? (
              <Ionicons name="checkmark" size={14} color="#1565C0" />
            ) : (
              <Text style={styles.progressStepNumberActive}>1</Text>
            )}
          </View>
          <Text style={[styles.progressStepLabel, step === 1 ? styles.progressStepLabelActive : styles.progressStepLabelMuted]}>
            Seus Dados
          </Text>
        </View>

        <View style={[styles.progressLine, step > 1 && styles.progressLineDone]} />

        <View style={styles.progressStepWrap}>
          <View
            style={[
              styles.progressStepCircle,
              step === 2 ? styles.progressStepCircleActive : styles.progressStepCircleMuted,
            ]}>
            <Text style={step === 2 ? styles.progressStepNumberActive : styles.progressStepNumberMuted}>2</Text>
          </View>
          <Text
            style={[
              styles.progressStepLabel,
              step === 2 ? styles.progressStepLabelActive : styles.progressStepLabelMuted,
            ]}>
            Pagamento
          </Text>
        </View>
      </View>

      <Text style={styles.progressCaption}>Etapa {step} de 2</Text>
    </View>
  );
}

function DonationInputField({
  label,
  icon,
  value,
  onChangeText,
  onFocus,
  onBlur,
  placeholder,
  valid,
  focused,
  error,
  ...inputProps
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  placeholder: string;
  valid: boolean;
  focused?: boolean;
  error?: string;
} & TextInputProps) {
  const borderColor = error
    ? '#EF4444'
    : valid && value
      ? '#22C55E'
      : focused
        ? '#1565C0'
        : '#E8EEF9';
  const iconColor = error
    ? '#EF4444'
    : valid && value
      ? '#22C55E'
      : focused
        ? '#1565C0'
        : '#9BACC8';

  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldWrap, { borderColor, backgroundColor: focused ? '#EEF4FF' : '#fff' }]}> 
        <Ionicons name={icon} size={18} color={iconColor} style={{ marginTop: 1 }} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor="#9BACC8"
          style={styles.fieldInput}
          {...inputProps}
        />
        {valid && value.length > 0 && !error ? (
          <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
        ) : null}
      </View>

      {error ? (
        <View style={styles.fieldErrorRow}>
          <Ionicons name="alert-circle" size={13} color="#EF4444" />
          <Text style={styles.fieldErrorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── Tela 1: Método de pagamento ──────────────────────────────────────────────

function TelaMetodo({ onSelect }: { onSelect: (m: MetodoPagamento) => void }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const metodos: { id: MetodoPagamento; icone: string; titulo: string; descricao: string }[] = [
    { id: 'pix', icone: '⚡', titulo: 'PIX', descricao: 'Transferência instantânea, rápida e segura' },
    { id: 'boleto', icone: '🏦', titulo: 'Boleto Bancário', descricao: 'Pague em qualquer banco ou lotérica' },
    { id: 'credit_card', icone: '💳', titulo: 'Cartão de Crédito', descricao: 'Visa, Mastercard, Elo e outras bandeiras' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: AZUL }}>
      <StatusBar style="light" translucent />
      <Header onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.metodoContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.metodoHero}>
          <Text style={styles.metodoOverline}>MOVIMENTO PRÓ CRIANÇA</Text>
          <Text style={styles.metodoTitulo}>Faça a diferença{'\n'}na vida de uma{'\n'}criança</Text>
          <Text style={styles.metodoSubtitulo}>
            Sua doação apoia atividades gratuitas para crianças e jovens em situação de vulnerabilidade no Recife.
          </Text>
        </View>

        <Text style={styles.metodosLabel}>Escolha a forma de doação</Text>

        {metodos.map((m) => (
          <TouchableOpacity key={m.id} style={styles.metodoCard} onPress={() => onSelect(m.id)} activeOpacity={0.75}>
            <View style={styles.metodoIconWrap}>
              <Text style={styles.metodoIcone}>{m.icone}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metodoCardTitulo}>{m.titulo}</Text>
              <Text style={styles.metodoCardDesc}>{m.descricao}</Text>
            </View>
            <Text style={styles.metodoArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Tela 2: Valor da doação ──────────────────────────────────────────────────

function TelaValor({
  metodo,
  onBack,
  onContinuar,
  erroExterno,
}: {
  metodo: MetodoPagamento;
  onBack: () => void;
  onContinuar: (valor: number) => void;
  erroExterno?: string;
}) {
  const insets = useSafeAreaInsets();
  const [valorSelecionado, setValorSelecionado] = useState<number | null>(null);
  const [valorCustom, setValorCustom] = useState('');
  const [erro, setErro] = useState('');

  const sugestoes = [10, 25, 50, 100, 200];

  function handleContinuar() {
    const valor = valorSelecionado ?? parseFloat(valorCustom.replace(',', '.'));
    if (!valor || valor < 1) return setErro('Informe um valor mínimo de R$ 1,00.');
    setErro('');
    onContinuar(valor);
  }

  const corMetodo = metodo === 'pix' ? VERDE : AZUL;

  return (
    <KeyboardAvoidingView
      style={styles.formScreen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header onBack={onBack} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.formOuterWrap}>
          <View style={styles.formCard}>
            <View style={[styles.metodoBanner, { backgroundColor: corMetodo }]}> 
              <Text style={styles.metodoBannerIcone}>{metodo === 'pix' ? '⚡' : metodo === 'boleto' ? '🏦' : '💳'}</Text>
              <View>
                <Text style={styles.metodoBannerLabel}>DOAÇÃO VIA</Text>
                <Text style={styles.metodoBannerTitulo}>
                  {metodo === 'pix' ? 'PIX' : metodo === 'boleto' ? 'Boleto' : 'Cartão de Crédito'}
                </Text>
              </View>
            </View>

            <Text style={styles.formTitulo}>Qual o valor da doação?</Text>
            <Text style={styles.formSubtitulo}>Escolha um valor sugerido ou informe outro.</Text>

            <View style={styles.sugestoesWrap}>
              {sugestoes.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[
                    styles.sugestaoBtn,
                    valorSelecionado === v && {
                      backgroundColor: AZUL,
                      borderColor: AZUL,
                    },
                  ]}
                  onPress={() => {
                    setValorSelecionado(v);
                    setValorCustom('');
                    setErro('');
                  }}
                  activeOpacity={0.75}>
                  <Text style={[styles.sugestaoText, valorSelecionado === v && { color: '#fff' }]}> 
                    R$ {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Outro valor</Text>
            <View style={styles.valorInputWrap}>
              <Text style={styles.valorPrefix}>R$</Text>
              <TextInput
                style={styles.valorInput}
                value={valorCustom}
                onChangeText={(v) => {
                  setValorCustom(v.replace(/[^0-9,]/g, ''));
                  setValorSelecionado(null);
                  setErro('');
                }}
                placeholder="0,00"
                placeholderTextColor="#9BACC8"
                keyboardType="decimal-pad"
              />
            </View>

            {erro ? <Text style={styles.erroText}>{erro}</Text> : null}
            {!erro && erroExterno ? <Text style={styles.erroText}>{erroExterno}</Text> : null}

            <TouchableOpacity style={styles.btnPrimario} onPress={handleContinuar}>
              <Text style={styles.btnPrimarioText}>CONTINUAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Tela 3: Dados do doador ──────────────────────────────────────────────────

function TelaDados({
  metodo,
  onBack,
  onContinuar,
}: {
  metodo: MetodoPagamento;
  onBack: () => void;
  onContinuar: (dados: DadosDoador) => void;
}) {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<DadosDoador>({ nome: '', email: '', telefone: '', cpf: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<DoadorField, boolean>>({
    nome: false,
    email: false,
    telefone: false,
    cpf: false,
  });
  const [focusedField, setFocusedField] = useState<DoadorField | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setForm(JSON.parse(raw));
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function validate(data: DadosDoador): FormErrors {
    const newErrors: FormErrors = {};
    if (!data.nome.trim() || data.nome.trim().length < 3) {
      newErrors.nome = 'Por favor, informe seu nome completo';
    }
    if (!validatePhone(data.telefone)) {
      newErrors.telefone = 'Telefone inválido. Use (00) 00000-0000';
    }
    if (!validateCPF(data.cpf)) {
      newErrors.cpf = 'CPF inválido. Informe os 11 dígitos';
    }
    if (!validateEmail(data.email)) {
      newErrors.email = 'E-mail inválido';
    }
    setErrors(newErrors);
    return newErrors;
  }

  function setField(field: DoadorField, value: string) {
    let nextValue = value;
    if (field === 'telefone') nextValue = formatTelefone(value);
    if (field === 'cpf') nextValue = formatCpf(value);

    const next = { ...form, [field]: nextValue };
    setForm(next);
    if (touched[field]) {
      validate(next);
    }
  }

  function isValid(field: DoadorField) {
    if (field === 'nome') return form.nome.trim().length >= 3;
    if (field === 'telefone') return validatePhone(form.telefone);
    if (field === 'cpf') return validateCPF(form.cpf);
    if (field === 'email') return validateEmail(form.email);
    return false;
  }

  function touchField(field: DoadorField) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function handleContinuar() {
    const allTouched: Record<DoadorField, boolean> = {
      nome: true,
      email: true,
      telefone: true,
      cpf: true,
    };
    setTouched(allTouched);
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(form)).catch(() => {});
    onContinuar(form);
  }

  const paymentText =
    metodo === 'pix' ? 'QR Code PIX' : metodo === 'boleto' ? 'boleto' : 'pagamento';

  return (
    <KeyboardAvoidingView
      style={styles.formScreen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <DonationProgressHeader onBack={onBack} step={1} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 36 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.formOuterWrap}>
          <View style={styles.formCard}>
            <View style={styles.formIntroRow}>
              <View style={styles.formIntroIcon}>
                <Text style={styles.formIntroIconText}>💛</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formCardTitle}>Faça uma doação</Text>
                <Text style={styles.formCardSubtitle}>
                  Seus dados ajudam a garantir segurança e transparência
                </Text>
              </View>
            </View>

            <View style={styles.fieldsContainer}>
              <DonationInputField
                label="Nome completo"
                icon="person-outline"
                value={form.nome}
                onChangeText={(value) => setField('nome', value)}
                onFocus={() => {
                  setFocusedField('nome');
                  touchField('nome');
                }}
                onBlur={() => setFocusedField(null)}
                placeholder="Seu nome completo"
                autoCapitalize="words"
                valid={isValid('nome')}
                focused={focusedField === 'nome'}
                error={touched.nome ? errors.nome : undefined}
              />

              <DonationInputField
                label="Telefone"
                icon="call-outline"
                value={form.telefone}
                onChangeText={(value) => setField('telefone', value)}
                onFocus={() => {
                  setFocusedField('telefone');
                  touchField('telefone');
                }}
                onBlur={() => setFocusedField(null)}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                valid={isValid('telefone')}
                focused={focusedField === 'telefone'}
                error={touched.telefone ? errors.telefone : undefined}
              />

              <DonationInputField
                label="CPF"
                icon="card-outline"
                value={form.cpf}
                onChangeText={(value) => setField('cpf', value)}
                onFocus={() => {
                  setFocusedField('cpf');
                  touchField('cpf');
                }}
                onBlur={() => setFocusedField(null)}
                placeholder="000.000.000-00"
                keyboardType="numeric"
                valid={isValid('cpf')}
                focused={focusedField === 'cpf'}
                error={touched.cpf ? errors.cpf : undefined}
              />

              <DonationInputField
                label="E-mail"
                icon="mail-outline"
                value={form.email}
                onChangeText={(value) => setField('email', value)}
                onFocus={() => {
                  setFocusedField('email');
                  touchField('email');
                }}
                onBlur={() => setFocusedField(null)}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                valid={isValid('email')}
                focused={focusedField === 'email'}
                error={touched.email ? errors.email : undefined}
              />
            </View>

            <View style={styles.securityInfoBox}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityInfoText}>
                Seus dados são protegidos e usados apenas para identificação da doação via{' '}
                {paymentText}.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.yellowContinueButton} onPress={handleContinuar}>
            <Text style={styles.yellowContinueText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={18} color="#1565C0" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Tela 4: Dados do cartão ──────────────────────────────────────────────────

function TelaCartao({
  onBack,
  onContinuar,
}: {
  onBack: () => void;
  onContinuar: (cartao: DadosCartao) => void;
}) {
  const insets = useSafeAreaInsets();
  const [cartao, setCartao] = useState<DadosCartao>({ numero: '', nome: '', validade: '', cvv: '' });
  const [erro, setErro] = useState('');

  function handleContinuar() {
    if (cartao.numero.replace(/\D/g, '').length < 16) return setErro('Número do cartão inválido.');
    if (!cartao.nome.trim()) return setErro('Informe o nome no cartão.');
    if (cartao.validade.replace(/\D/g, '').length < 4) return setErro('Validade inválida.');
    if (cartao.cvv.replace(/\D/g, '').length < 3) return setErro('CVV inválido.');
    setErro('');
    onContinuar(cartao);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F5F5F5' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header onBack={onBack} />
      <ScrollView contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
        <View style={[styles.metodoBanner, { backgroundColor: AZUL }]}>
          <Text style={styles.metodoBannerIcone}>💳</Text>
          <View>
            <Text style={styles.metodoBannerLabel}>DOAÇÃO VIA</Text>
            <Text style={styles.metodoBannerTitulo}>Cartão de Crédito</Text>
          </View>
        </View>

        {/* Preview */}
        <View style={styles.cartaoPreview}>
          <Text style={styles.cartaoPreviewBandeira}>💳</Text>
          <Text style={styles.cartaoPreviewNumero}>{cartao.numero || '•••• •••• •••• ••••'}</Text>
          <View style={styles.cartaoPreviewBottom}>
            <Text style={styles.cartaoPreviewNome}>{cartao.nome.toUpperCase() || 'NOME NO CARTÃO'}</Text>
            <Text style={styles.cartaoPreviewValidade}>{cartao.validade || 'MM/AA'}</Text>
          </View>
        </View>

        <Text style={styles.inputLabel}>Número do cartão *</Text>
        <TextInput style={styles.input} value={cartao.numero} onChangeText={(v) => setCartao({ ...cartao, numero: formatCartaoNumero(v) })} placeholder="0000 0000 0000 0000" placeholderTextColor="#aaa" keyboardType="numeric" />

        <Text style={styles.inputLabel}>Nome no cartão *</Text>
        <TextInput style={styles.input} value={cartao.nome} onChangeText={(v) => setCartao({ ...cartao, nome: v })} placeholder="Como aparece no cartão" placeholderTextColor="#aaa" autoCapitalize="characters" />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Validade *</Text>
            <TextInput style={styles.input} value={cartao.validade} onChangeText={(v) => setCartao({ ...cartao, validade: formatValidade(v) })} placeholder="MM/AA" placeholderTextColor="#aaa" keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>CVV *</Text>
            <TextInput style={styles.input} value={cartao.cvv} onChangeText={(v) => setCartao({ ...cartao, cvv: v.replace(/\D/g, '').slice(0, 4) })} placeholder="000" placeholderTextColor="#aaa" keyboardType="numeric" secureTextEntry />
          </View>
        </View>

        {erro ? <Text style={styles.erroText}>{erro}</Text> : null}

        <TouchableOpacity style={styles.btnPrimario} onPress={handleContinuar}>
          <Text style={styles.btnPrimarioText}>CONFIRMAR DOAÇÃO</Text>
        </TouchableOpacity>
        <Text style={styles.segurancaText}>🔒 Pagamento seguro — dados criptografados</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Tela 5: Confirmação ──────────────────────────────────────────────────────

function TelaConfirmacao({
  metodo,
  dados,
  resultado,
  onNova,
}: {
  metodo: MetodoPagamento;
  dados: DadosDoador;
  resultado: ResultadoPagamento;
  onNova: () => void;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { payment } = resultado;

  console.log('[Confirmacao] resultado completo', JSON.stringify(resultado, null, 2));
  console.log('[Confirmacao] payment', JSON.stringify(payment, null, 2));
  console.log('[Confirmacao] PIX - qr_code_url:', payment?.qr_code_url, '| qr_code:', payment?.qr_code?.slice(0, 40));

  async function handleCopiarPix() {
    if (payment.qr_code) {
      await Clipboard.setStringAsync(payment.qr_code);
      Alert.alert('Copiado!', 'Código PIX copiado para a área de transferência.');
    }
  }

  async function handleCopiarBoleto() {
    if (payment.boleto_barcode) {
      await Clipboard.setStringAsync(payment.boleto_barcode);
      Alert.alert('Copiado!', 'Linha digitável copiada.');
    }
  }

  function handleAbrirBoleto() {
    if (payment.boleto_url) Linking.openURL(payment.boleto_url);
  }

  const corMetodo = metodo === 'pix' ? VERDE : AZUL;

  return (
    <View style={{ flex: 1, backgroundColor: corMetodo }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[styles.confirmacaoContent, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}>

        <View style={styles.confirmacaoIconBox}>
          <Text style={styles.confirmacaoIconText}>
            {metodo === 'credit_card' ? '✓' : metodo === 'pix' ? '⚡' : '🏦'}
          </Text>
        </View>

        <Text style={styles.confirmacaoTitulo}>
          {metodo === 'pix' ? 'QR Code PIX gerado!' : metodo === 'boleto' ? 'Boleto gerado!' : 'Doação confirmada!'}
        </Text>
        <Text style={styles.confirmacaoSubtitulo}>
          {metodo === 'pix'
            ? 'Escaneie o QR Code ou copie o código para concluir sua doação.'
            : metodo === 'boleto'
            ? 'Pague o boleto até o vencimento no seu banco, lotérica ou app de pagamentos.'
            : `Obrigado, ${dados.nome.split(' ')[0]}! Sua doação foi processada com sucesso.`}
        </Text>

        {/* Resumo do doador */}
        <View style={styles.confirmacaoResumo}>
          <Text style={styles.confirmacaoResumoTitulo}>DADOS DO DOADOR</Text>
          <RowItem label="Nome" value={dados.nome} />
          <RowItem label="E-mail" value={dados.email} />
          <RowItem label="CPF" value={dados.cpf} />
        </View>

        {/* PIX */}
        {metodo === 'pix' && (
          <View style={styles.pixBox}>
            {payment.qr_code_url ? (
              <Image source={{ uri: payment.qr_code_url }} style={styles.qrCodeImagem} resizeMode="contain" />
            ) : (
              <View style={styles.qrCodePlaceholder}>
                <Text style={styles.qrCodePlaceholderText}>QR Code indisponível</Text>
              </View>
            )}
            <Text style={styles.pixLabel}>OU COPIE O CÓDIGO PIX</Text>
            <View style={styles.pixChaveWrap}>
              <Text style={styles.pixChave} numberOfLines={2}>{payment.qr_code ?? '—'}</Text>
              <TouchableOpacity style={styles.pixCopiarBtn} onPress={handleCopiarPix}>
                <Text style={styles.pixCopiarText}>COPIAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Boleto */}
        {metodo === 'boleto' && (
          <View style={styles.boletoBox}>
            <Text style={styles.boletoLabel}>LINHA DIGITÁVEL</Text>
            <Text style={styles.boletoLinha}>{payment.boleto_barcode ?? '—'}</Text>
            <TouchableOpacity style={styles.boletoCopiarBtn} onPress={handleCopiarBoleto}>
              <Text style={styles.boletoCopiarText}>COPIAR LINHA DIGITÁVEL</Text>
            </TouchableOpacity>
            {payment.boleto_url ? (
              <TouchableOpacity style={[styles.boletoCopiarBtn, { backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 8 }]} onPress={handleAbrirBoleto}>
                <Text style={styles.boletoCopiarText}>ABRIR BOLETO (PDF)</Text>
              </TouchableOpacity>
            ) : null}
            {payment.due_at ? (
              <Text style={styles.boletoInfoText}>
                ⏰ Vencimento: {new Date(payment.due_at).toLocaleDateString('pt-BR')}
              </Text>
            ) : null}
          </View>
        )}

        <TouchableOpacity style={styles.btnNova} onPress={onNova}>
          <Text style={styles.btnNovaText}>FAZER NOVA DOAÇÃO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnVoltar} onPress={() => router.push('/')}>
          <Text style={styles.btnVoltarText}>VOLTAR AO INÍCIO</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function RowItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.rowItem}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DoacaoScreen() {
  const { usuario, authToken } = useInscricoes();
  const [step, setStep] = useState<Step>('metodo');
  const [metodo, setMetodo] = useState<MetodoPagamento | null>(null);
  const [valor, setValor] = useState<number | null>(null);
  const [dadosDoador, setDadosDoador] = useState<DadosDoador | null>(null);
  const [resultado, setResultado] = useState<ResultadoPagamento | null>(null);
  const [erroProcessamento, setErroProcessamento] = useState('');

  const dadosAutenticado: DadosDoador | null = usuario
    ? { nome: usuario.nome, email: usuario.email, cpf: usuario.cpf, telefone: usuario.telefone ?? '' }
    : null;

  function handleMetodoSelect(m: MetodoPagamento) {
    setMetodo(m);
    setStep('valor');
  }

  function handleValorContinuar(v: number) {
    console.log('[Doacao] handleValorContinuar', { v, metodo, dadosAutenticado: !!dadosAutenticado, authToken: authToken ? authToken.slice(0, 10) + '...' : null });
    setValor(v);
    // Se usuário autenticado, pular etapa de dados
    if (dadosAutenticado) {
      setDadosDoador(dadosAutenticado);
      if (metodo === 'credit_card') {
        setStep('cartao');
      } else {
        processarPagamento(dadosAutenticado, null, v);
      }
    } else {
      setStep('dados');
    }
  }

  function handleDadosContinuar(dados: DadosDoador) {
    setDadosDoador(dados);
    if (metodo === 'credit_card') {
      setStep('cartao');
    } else {
      processarPagamento(dados, null);
    }
  }

  function handleCartaoContinuar(cartao: DadosCartao) {
    if (dadosDoador) processarPagamento(dadosDoador, cartao);
  }

  async function processarPagamento(dados: DadosDoador, cartao: DadosCartao | null, valorOverride?: number) {
    setStep('processando');
    setErroProcessamento('');
    const valorFinal = valorOverride ?? valor;

    try {
      const isAnonimo = !authToken;
      const url = isAnonimo ? `${API_BASE_URL}/donations/anonymous` : `${API_BASE_URL}/donations`;

      const body: any = {
        amount: valorFinal,
        payment_method: metodo,
        donor_name: dados.nome,
        donor_email: dados.email,
        donor_cpf: dados.cpf.replace(/\D/g, ''),
        donor_phone: dados.telefone.replace(/\D/g, ''),
      };

      if (metodo === 'credit_card' && cartao) {
        body.card_number = cartao.numero.replace(/\D/g, '');
        body.card_holder = cartao.nome;
        body.card_expiry = cartao.validade;
        body.card_cvv = cartao.cvv;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      console.log('[Doacao] REQUEST', {
        url,
        metodo,
        valorFinal,
        isAnonimo,
        body: { ...body, card_number: body.card_number ? '****' : undefined, card_cvv: body.card_cvv ? '***' : undefined },
        hasAuthToken: !!authToken,
      });

      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      const rawText = await res.text();

      console.log('[Doacao] RESPONSE', { status: res.status, ok: res.ok, rawText });

      let json: any;
      try {
        json = JSON.parse(rawText);
      } catch {
        throw new Error(`Resposta inválida do servidor (${res.status}): ${rawText.slice(0, 200)}`);
      }

      if (!res.ok) {
        console.log('[Doacao] ERRO HTTP', { status: res.status, json });
        throw new Error(json.message ?? `Erro ${res.status} ao processar pagamento.`);
      }

      console.log('[Doacao] JSON COMPLETO DO BACK-END', JSON.stringify(json, null, 2));
      console.log('[Doacao] PAYMENT OBJECT', JSON.stringify(json?.payment, null, 2));
      console.log('[Doacao] PIX FIELDS', {
        qr_code_url: json?.payment?.qr_code_url,
        qr_code: json?.payment?.qr_code,
        status: json?.payment?.status,
      });
      setResultado(json);
      setStep('confirmacao');
    } catch (e: any) {
      console.log('[Doacao] CATCH', { name: e?.name, message: e?.message, stack: e?.stack?.slice(0, 300) });
      setErroProcessamento(e.message ?? 'Não foi possível processar o pagamento.');
      // Volta para 'dados' (usuário anônimo) ou 'valor' (usuário autenticado)
      setStep(dadosAutenticado ? 'valor' : 'dados');
    }
  }

  function handleNova() {
    setStep('metodo');
    setMetodo(null);
    setValor(null);
    setDadosDoador(null);
    setResultado(null);
    setErroProcessamento('');
  }

  // ── Tela de processando ──────────────────────────────────────────────────────
  if (step === 'processando') {
    return (
      <View style={{ flex: 1, backgroundColor: AZUL, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Processando pagamento…</Text>
      </View>
    );
  }

  switch (step) {
    case 'metodo':
      return <TelaMetodo onSelect={handleMetodoSelect} />;
    case 'valor':
      return <TelaValor metodo={metodo!} onBack={() => setStep('metodo')} onContinuar={handleValorContinuar} erroExterno={erroProcessamento} />;
    case 'dados':
      return (
        <>
          <TelaDados
            metodo={metodo!}
            onBack={() => setStep('valor')}
            onContinuar={handleDadosContinuar}
          />
          {erroProcessamento ? (
            <View style={{ position: 'absolute', bottom: 24, left: 20, right: 20, backgroundColor: '#EF4444', borderRadius: 12, padding: 14 }}>
              <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>{erroProcessamento}</Text>
            </View>
          ) : null}
        </>
      );
    case 'cartao':
      return <TelaCartao onBack={() => setStep('dados')} onContinuar={handleCartaoContinuar} />;
    case 'confirmacao':
      return <TelaConfirmacao metodo={metodo!} dados={dadosDoador!} resultado={resultado!} onNova={handleNova} />;
    default:
      return null;
  }
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  formScreen: {
    flex: 1,
    backgroundColor: BG,
  },
  formOuterWrap: {
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
    shadowColor: '#1565C0',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  formIntroRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    alignItems: 'center',
  },
  formIntroIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: AMARELO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formIntroIconText: {
    fontSize: 15,
  },
  formCardTitle: {
    color: AZUL_ESCURO,
    fontSize: 20,
    fontWeight: '900',
  },
  formCardSubtitle: {
    marginTop: 3,
    color: '#6B87B0',
    fontSize: 12,
    lineHeight: 17,
  },
  fieldsContainer: {
    gap: 12,
  },
  fieldLabel: {
    color: TEXTO,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  fieldWrap: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
    color: TEXTO,
    paddingVertical: 0,
  },
  fieldErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  fieldErrorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
  securityInfoBox: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#F0F9FF',
    padding: 12,
    flexDirection: 'row',
    gap: 8,
  },
  securityIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  securityInfoText: {
    flex: 1,
    color: '#0D47A1',
    fontSize: 11,
    lineHeight: 15,
  },
  yellowContinueButton: {
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
  yellowContinueText: {
    color: AZUL_ESCURO,
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  progressHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: AZUL,
  },
  progressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  progressBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  progressTitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    fontWeight: '600',
  },
  progressStepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressStepWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressStepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepCircleActive: {
    backgroundColor: AMARELO,
  },
  progressStepCircleMuted: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  progressStepNumberActive: {
    color: AZUL_ESCURO,
    fontSize: 13,
    fontWeight: '800',
  },
  progressStepNumberMuted: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '700',
  },
  progressStepLabel: {
    fontSize: 12,
  },
  progressStepLabelActive: {
    color: '#fff',
    fontWeight: '700',
  },
  progressStepLabelMuted: {
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  progressLine: {
    height: 2,
    flex: 1,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  progressLineDone: {
    backgroundColor: AMARELO,
  },
  progressCaption: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '500',
  },

  header: {
    backgroundColor: AZUL,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  backArrow: { color: '#fff', fontSize: 22, fontWeight: '400' },
  logoImage: { width: 112, height: 44, marginLeft: -8 },

  metodoContent: { paddingHorizontal: 20, paddingTop: 8 },
  metodoHero: { paddingVertical: 12, gap: 8 },
  metodoOverline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
  },
  metodoTitulo: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 35,
  },
  metodoSubtitulo: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: '88%',
  },
  metodosLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 12,
  },
  metodoCard: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  metodoIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metodoIcone: { fontSize: 20 },
  metodoCardTitulo: { color: '#fff', fontSize: 15, fontWeight: '800' },
  metodoCardDesc: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  metodoArrow: { color: 'rgba(255,255,255,0.62)', fontSize: 20, fontWeight: '400' },

  formContent: { paddingHorizontal: 20, paddingTop: 8 },
  metodoBanner: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  metodoBannerIcone: { fontSize: 28 },
  metodoBannerLabel: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  metodoBannerTitulo: { color: '#fff', fontSize: 17, fontWeight: '900' },
  formTitulo: { fontSize: 22, fontWeight: '900', color: TEXTO, marginBottom: 4 },
  formSubtitulo: { fontSize: 13, color: '#6B87B0', lineHeight: 18, marginBottom: 16 },

  sugestoesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  sugestaoBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: AZUL,
    backgroundColor: '#fff',
  },
  sugestaoText: { color: AZUL, fontWeight: '800', fontSize: 14 },

  valorInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8EEF9',
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  valorPrefix: { fontSize: 16, fontWeight: '700', color: '#6B87B0', marginRight: 6 },
  valorInput: { flex: 1, paddingVertical: 13, fontSize: 16, color: TEXTO },

  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B87B0',
    letterSpacing: 0.3,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: TEXTO,
    borderWidth: 2,
    borderColor: '#E8EEF9',
  },
  erroText: { color: '#EF4444', fontSize: 13, fontWeight: '600', marginTop: 8 },
  btnPrimario: {
    backgroundColor: AMARELO,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  btnPrimarioText: {
    color: AZUL_ESCURO,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  segurancaText: { color: '#6B87B0', fontSize: 12, textAlign: 'center', marginTop: 12 },

  cartaoPreview: { backgroundColor: AZUL, borderRadius: 16, padding: 20, marginBottom: 16, gap: 12 },
  cartaoPreviewBandeira: { fontSize: 28 },
  cartaoPreviewNumero: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 2 },
  cartaoPreviewBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cartaoPreviewNome: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', flex: 1 },
  cartaoPreviewValidade: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },

  confirmacaoContent: { paddingHorizontal: 24, alignItems: 'center' },
  confirmacaoIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  confirmacaoIconText: { color: '#fff', fontSize: 36, fontWeight: '800' },
  confirmacaoTitulo: { color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'center', lineHeight: 32, marginBottom: 8 },
  confirmacaoSubtitulo: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24, maxWidth: '85%' },
  confirmacaoResumo: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 16, width: '100%', gap: 10, marginBottom: 16 },
  confirmacaoResumoTitulo: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  rowLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '500' },
  rowValue: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'right', flex: 1 },

  pixBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 16, width: '100%', alignItems: 'center', gap: 12, marginBottom: 16 },
  qrCodeImagem: { width: 180, height: 180, borderRadius: 12, backgroundColor: '#fff' },
  qrCodePlaceholder: { width: 180, height: 180, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  qrCodePlaceholderText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  pixLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  pixChaveWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingLeft: 14, overflow: 'hidden', width: '100%' },
  pixChave: { color: '#fff', fontSize: 11, fontWeight: '600', flex: 1, paddingVertical: 10 },
  pixCopiarBtn: { backgroundColor: '#00AAFF', paddingHorizontal: 14, paddingVertical: 12 },
  pixCopiarText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  boletoBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 16, width: '100%', gap: 12, marginBottom: 16 },
  boletoLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  boletoLinha: { color: '#fff', fontSize: 12, fontWeight: '600', lineHeight: 18, letterSpacing: 0.5 },
  boletoCopiarBtn: { backgroundColor: '#00AAFF', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  boletoCopiarText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  boletoInfoText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 17 },

  btnNova: { backgroundColor: '#00AAFF', borderRadius: 30, paddingHorizontal: 28, paddingVertical: 14, alignSelf: 'stretch', alignItems: 'center', marginBottom: 10, marginTop: 8 },
  btnNovaText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  btnVoltar: { borderRadius: 30, paddingHorizontal: 28, paddingVertical: 14, alignSelf: 'stretch', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },
  btnVoltarText: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
});
