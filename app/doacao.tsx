import React, { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useInscricoes } from '@/contexts/InscricoesContext';

const AZUL = '#1B67C8';
const AZUL_ESCURO = '#1565C0';
const AMARELO = '#FFD600';
const BG = '#F4F7FF';
const TEXTO = '#1A2D5A';
const SUBTEXTO = '#6B87B0';
const VERDE = '#00C896';
const STORAGE_KEY = '@mpc_doacao_dados';
const PERFIS_STORAGE_KEY = '@mpc_doacao_perfis';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000/api';

type MetodoPagamento = 'pix' | 'boleto' | 'credit_card' | 'neo_energia' | 'compesa';
type MetodoApi = 'pix' | 'boleto' | 'credit_card';
type Step = 'formulario' | 'cartao' | 'processando' | 'confirmacao';

interface MetodoOption {
  id: MetodoPagamento;
  label: string;
  icon: string;
  description: string;
  apiMethod: MetodoApi;
  accentColor: string;
}

const METODOS: MetodoOption[] = [
  {
    id: 'pix',
    label: 'PIX',
    icon: '⚡',
    description: 'Transferência instantânea, rápida e segura.',
    apiMethod: 'pix',
    accentColor: VERDE,
  },
  {
    id: 'boleto',
    label: 'Boleto',
    icon: '🏦',
    description: 'Pague em banco, lotérica ou app.',
    apiMethod: 'boleto',
    accentColor: AZUL,
  },
  {
    id: 'credit_card',
    label: 'Cartão',
    icon: '💳',
    description: 'Visa, Mastercard, Elo e outras bandeiras.',
    apiMethod: 'credit_card',
    accentColor: AZUL,
  },
  {
    id: 'neo_energia',
    label: 'Neo-Energia',
    icon: '⚡',
    description: 'Doação via conta de energia (processada como PIX).',
    apiMethod: 'pix',
    accentColor: VERDE,
  },
  {
    id: 'compesa',
    label: 'Compesa',
    icon: '💧',
    description: 'Doação via conta de água (processada como PIX).',
    apiMethod: 'pix',
    accentColor: VERDE,
  },
];

interface DadosDoador {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
}

interface PerfilSalvo {
  id: string;
  dados: DadosDoador;
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
  valor?: string;
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

function formatCpf(text: string) {
  const d = text.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
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
  if (d.length >= 3) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCPF(cpf: string) {
  return cpf.replace(/\D/g, '').length === 11;
}

function validatePhone(phone: string) {
  return phone.replace(/\D/g, '').length >= 10;
}

function parseAmount(input: string) {
  const normalized = input.replace(',', '.');
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : NaN;
}

function Header({ onBack }: { onBack?: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}> 
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.backBtn} />
      )}
      <Image
        source={require('@/assets/images/logo-branca.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
      <View style={styles.backBtn} />
    </View>
  );
}

function ProgressHeader({ onBack }: { onBack: () => void }) {
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
            <Ionicons name="checkmark" size={14} color={AZUL_ESCURO} />
          </View>
          <Text style={[styles.progressStepLabel, styles.progressStepLabelActive]}>Formulário</Text>
        </View>

        <View style={[styles.progressLine, styles.progressLineDone]} />

        <View style={styles.progressStepWrap}>
          <View style={[styles.progressStepCircle, styles.progressStepCircleActive]}>
            <Text style={styles.progressStepNumberActive}>2</Text>
          </View>
          <Text style={[styles.progressStepLabel, styles.progressStepLabelActive]}>Pagamento</Text>
        </View>
      </View>

      <Text style={styles.progressCaption}>Etapa 2 de 2</Text>
    </View>
  );
}

function SelectMetodo({
  value,
  onChange,
}: {
  value: MetodoPagamento;
  onChange: (method: MetodoPagamento) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = METODOS.find((m) => m.id === value) ?? METODOS[0];

  return (
    <View>
      <Text style={styles.fieldLabel}>Forma de doação</Text>
      <TouchableOpacity style={styles.selectTrigger} onPress={() => setOpen((old) => !old)}>
        <View style={styles.selectValueWrap}>
          <Text style={styles.selectValueIcon}>{selected.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectValueLabel}>{selected.label}</Text>
            <Text style={styles.selectValueDesc}>{selected.description}</Text>
          </View>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#6B87B0" />
      </TouchableOpacity>

      {open ? (
        <View style={styles.selectOptions}>
          {METODOS.map((metodo) => {
            const active = metodo.id === value;
            return (
              <TouchableOpacity
                key={metodo.id}
                style={[styles.selectOption, active && styles.selectOptionActive]}
                onPress={() => {
                  onChange(metodo.id);
                  setOpen(false);
                }}>
                <Text style={styles.selectOptionIcon}>{metodo.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.selectOptionLabel, active && styles.selectOptionLabelActive]}>
                    {metodo.label}
                  </Text>
                  <Text style={styles.selectOptionDesc}>{metodo.description}</Text>
                </View>
                {active ? <Ionicons name="checkmark-circle" size={16} color={AZUL} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
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
} & React.ComponentProps<typeof TextInput>) {
  const borderColor = error
    ? '#EF4444'
    : valid && value
      ? '#22C55E'
      : focused
        ? AZUL_ESCURO
        : '#E8EEF9';
  const iconColor = error
    ? '#EF4444'
    : valid && value
      ? '#22C55E'
      : focused
        ? AZUL_ESCURO
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

function TelaFormulario({
  onBack,
  initialMetodo,
  onContinuar,
  erroExterno,
  dadosAutenticado,
  authToken,
}: {
  onBack: () => void;
  initialMetodo: MetodoPagamento;
  onContinuar: (payload: {
    metodo: MetodoPagamento;
    valor: number;
    dados: DadosDoador;
  }) => void;
  erroExterno?: string;
  dadosAutenticado?: DadosDoador | null;
  authToken?: string | null;
}) {
  const insets = useSafeAreaInsets();
  const estaLogado = !!dadosAutenticado && !!authToken;

  const [usandoMeusDados, setUsandoMeusDados] = useState(estaLogado);
  const [metodo, setMetodo] = useState<MetodoPagamento>(initialMetodo);
  const [valorInput, setValorInput] = useState('');
  const [form, setForm] = useState<DadosDoador>({ nome: '', email: '', telefone: '', cpf: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [focusedField, setFocusedField] = useState<keyof DadosDoador | 'valor' | null>(null);
  const [touched, setTouched] = useState<Record<keyof DadosDoador | 'valor', boolean>>({
    valor: false,
    nome: false,
    email: false,
    telefone: false,
    cpf: false,
  });
  const [perfisSalvos, setPerfisSalvos] = useState<PerfilSalvo[]>([]);
  const [perfilSelecionadoId, setPerfilSelecionadoId] = useState<string | null>(null);

  const sugestoes = [10, 25, 50, 100, 200];

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as DadosDoador;
        setForm(parsed);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!estaLogado) return;
    AsyncStorage.getItem(PERFIS_STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        setPerfisSalvos(JSON.parse(raw));
      })
      .catch(() => {});
  }, [estaLogado]);

  useEffect(() => {
    if (!usandoMeusDados && perfilSelecionadoId) {
      const perfil = perfisSalvos.find((p) => p.id === perfilSelecionadoId);
      if (perfil) setForm(perfil.dados);
    }
  }, [perfilSelecionadoId, usandoMeusDados, perfisSalvos]);

  function setField(field: keyof DadosDoador, value: string) {
    let nextValue = value;
    if (field === 'telefone') nextValue = formatTelefone(value);
    if (field === 'cpf') nextValue = formatCpf(value);
    setForm((current) => ({ ...current, [field]: nextValue }));
  }

  function validate(data: DadosDoador, amountText: string): FormErrors {
    const newErrors: FormErrors = {};
    const amount = parseAmount(amountText);

    if (!Number.isFinite(amount) || amount < 1) {
      newErrors.valor = 'Informe um valor mínimo de R$ 1,00';
    }
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

  function isFieldValid(field: keyof DadosDoador | 'valor') {
    if (field === 'valor') {
      const amount = parseAmount(valorInput);
      return Number.isFinite(amount) && amount >= 1;
    }
    if (field === 'nome') return form.nome.trim().length >= 3;
    if (field === 'telefone') return validatePhone(form.telefone);
    if (field === 'cpf') return validateCPF(form.cpf);
    if (field === 'email') return validateEmail(form.email);
    return false;
  }

  async function salvarPerfil(dados: DadosDoador) {
    try {
      const raw = await AsyncStorage.getItem(PERFIS_STORAGE_KEY);
      const perfis: PerfilSalvo[] = raw ? JSON.parse(raw) : [];
      const jaExiste = perfis.find(
        (p) => p.dados.cpf === dados.cpf || p.dados.email === dados.email,
      );
      if (jaExiste) {
        jaExiste.dados = dados;
      } else {
        perfis.push({ id: Date.now().toString(), dados });
      }
      await AsyncStorage.setItem(PERFIS_STORAGE_KEY, JSON.stringify(perfis));
      setPerfisSalvos(perfis);
    } catch {}
  }

  function handleSelecionarSugestao(valor: number) {
    setValorInput(String(valor));
    setTouched((current) => ({ ...current, valor: true }));
  }

  async function handleContinuar() {
    const allTouched = {
      valor: true,
      nome: true,
      email: true,
      telefone: true,
      cpf: true,
    };
    setTouched(allTouched);

    if (usandoMeusDados && dadosAutenticado) {
      const validationErrors = validate(dadosAutenticado, valorInput);
      if (Object.keys(validationErrors).length > 0) return;
      onContinuar({ metodo, valor: parseAmount(valorInput), dados: dadosAutenticado });
      return;
    }

    const validationErrors = validate(form, valorInput);
    if (Object.keys(validationErrors).length > 0) return;

    await salvarPerfil(form);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(form)).catch(() => {});
    onContinuar({ metodo, valor: parseAmount(valorInput), dados: form });
  }

  const selectedMetodo = METODOS.find((item) => item.id === metodo) ?? METODOS[0];

  return (
    <KeyboardAvoidingView
      style={styles.formScreen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" translucent />
      <Header onBack={onBack} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 38 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.formOuterWrap}>
          <View style={styles.formCard}>
            <View style={styles.formIntroRow}>
              <View style={[styles.formIntroIcon, { backgroundColor: selectedMetodo.accentColor }]}> 
                <Text style={styles.formIntroIconText}>{selectedMetodo.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formCardTitle}>Faça uma doação</Text>
                <Text style={styles.formCardSubtitle}>
                  {usandoMeusDados ? 'Confirme seus dados e escolha o pagamento.' : 'Informe seus dados e escolha a forma de pagamento.'}
                </Text>
              </View>
            </View>

            {estaLogado ? (
              <View style={styles.dadosToggleRow}>
                <TouchableOpacity
                  style={[styles.dadosToggleOption, usandoMeusDados && styles.dadosToggleOptionActive]}
                  onPress={() => {
                    setUsandoMeusDados(true);
                    setPerfilSelecionadoId(null);
                  }}>
                  <Ionicons
                    name={usandoMeusDados ? 'checkmark-circle' : 'person-outline'}
                    size={16}
                    color={usandoMeusDados ? AZUL_ESCURO : '#9BACC8'}
                  />
                  <Text
                    style={[
                      styles.dadosToggleText,
                      usandoMeusDados && styles.dadosToggleTextActive,
                    ]}>
                    Meus dados
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dadosToggleOption, !usandoMeusDados && styles.dadosToggleOptionActive]}
                  onPress={() => setUsandoMeusDados(false)}>
                  <Ionicons
                    name={!usandoMeusDados ? 'checkmark-circle' : 'create-outline'}
                    size={16}
                    color={!usandoMeusDados ? AZUL_ESCURO : '#9BACC8'}
                  />
                  <Text
                    style={[
                      styles.dadosToggleText,
                      !usandoMeusDados && styles.dadosToggleTextActive,
                    ]}>
                    Outros dados
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {usandoMeusDados && dadosAutenticado ? (
              <View style={styles.dadosAutenticadoCard}>
                <View style={styles.dadosAutenticadoRow}>
                  <Ionicons name="person-outline" size={16} color={AZUL_ESCURO} />
                  <Text style={styles.dadosAutenticadoValue}>{dadosAutenticado.nome}</Text>
                </View>
                <View style={styles.dadosAutenticadoRow}>
                  <Ionicons name="mail-outline" size={16} color={AZUL_ESCURO} />
                  <Text style={styles.dadosAutenticadoValue}>{dadosAutenticado.email}</Text>
                </View>
                <View style={styles.dadosAutenticadoRow}>
                  <Ionicons name="card-outline" size={16} color={AZUL_ESCURO} />
                  <Text style={styles.dadosAutenticadoValue}>
                    {formatCpf(dadosAutenticado.cpf)}
                  </Text>
                </View>
                {dadosAutenticado.telefone ? (
                  <View style={styles.dadosAutenticadoRow}>
                    <Ionicons name="call-outline" size={16} color={AZUL_ESCURO} />
                    <Text style={styles.dadosAutenticadoValue}>
                      {formatTelefone(dadosAutenticado.telefone)}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {!usandoMeusDados && perfisSalvos.length > 0 ? (
              <View style={styles.perfisList}>
                <Text style={styles.perfisListTitle}>Preencher com dados salvos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.perfisScroll}>
                  {perfisSalvos.map((perfil) => (
                    <TouchableOpacity
                      key={perfil.id}
                      style={[
                        styles.perfilChip,
                        perfilSelecionadoId === perfil.id && styles.perfilChipActive,
                      ]}
                      onPress={() => {
                        setPerfilSelecionadoId(perfil.id);
                        setForm(perfil.dados);
                      }}>
                      <Ionicons name="person-outline" size={13} color={perfilSelecionadoId === perfil.id ? '#fff' : AZUL_ESCURO} />
                      <Text style={[
                        styles.perfilChipText,
                        perfilSelecionadoId === perfil.id && styles.perfilChipTextActive,
                      ]} numberOfLines={1}>{perfil.dados.nome.split(' ')[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.fieldsContainer}>
              <SelectMetodo value={metodo} onChange={setMetodo} />

              <Text style={styles.fieldLabel}>Valor da doação</Text>
              <View style={styles.quickAmountRow}>
                {sugestoes.map((sugestao) => {
                  const active = parseAmount(valorInput) === sugestao;
                  return (
                    <TouchableOpacity
                      key={sugestao}
                      style={[styles.quickAmountButton, active && styles.quickAmountButtonActive]}
                      onPress={() => handleSelecionarSugestao(sugestao)}>
                      <Text
                        style={[
                          styles.quickAmountText,
                          active && styles.quickAmountTextActive,
                        ]}>{`R$ ${sugestao}`}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View
                style={[
                  styles.fieldWrap,
                  {
                    borderColor: touched.valor && errors.valor ? '#EF4444' : '#E8EEF9',
                    backgroundColor: focusedField === 'valor' ? '#EEF4FF' : '#fff',
                  },
                ]}>
                <Text style={styles.amountPrefix}>R$</Text>
                <TextInput
                  value={valorInput}
                  onChangeText={(text) => {
                    setValorInput(text.replace(/[^0-9,\.]/g, ''));
                  }}
                  onFocus={() => {
                    setFocusedField('valor');
                    setTouched((current) => ({ ...current, valor: true }));
                  }}
                  onBlur={() => {
                    setFocusedField(null);
                    validate(form, valorInput);
                  }}
                  placeholder="0,00"
                  placeholderTextColor="#9BACC8"
                  keyboardType="decimal-pad"
                  style={styles.fieldInput}
                />
                {isFieldValid('valor') ? (
                  <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                ) : null}
              </View>
              {touched.valor && errors.valor ? (
                <View style={styles.fieldErrorRow}>
                  <Ionicons name="alert-circle" size={13} color="#EF4444" />
                  <Text style={styles.fieldErrorText}>{errors.valor}</Text>
                </View>
              ) : null}

              {!usandoMeusDados ? (
                <>
                  <DonationInputField
                    label="Nome completo"
                    icon="person-outline"
                    value={form.nome}
                    onChangeText={(v) => setField('nome', v)}
                    onFocus={() => {
                      setFocusedField('nome');
                      setTouched((current) => ({ ...current, nome: true }));
                    }}
                    onBlur={() => {
                      setFocusedField(null);
                      validate(form, valorInput);
                    }}
                    placeholder="Seu nome completo"
                    autoCapitalize="words"
                    valid={isFieldValid('nome')}
                    focused={focusedField === 'nome'}
                    error={touched.nome ? errors.nome : undefined}
                  />

                  <DonationInputField
                    label="Telefone"
                    icon="call-outline"
                    value={form.telefone}
                    onChangeText={(v) => setField('telefone', v)}
                    onFocus={() => {
                      setFocusedField('telefone');
                      setTouched((current) => ({ ...current, telefone: true }));
                    }}
                    onBlur={() => {
                      setFocusedField(null);
                      validate(form, valorInput);
                    }}
                    placeholder="(00) 00000-0000"
                    keyboardType="phone-pad"
                    valid={isFieldValid('telefone')}
                    focused={focusedField === 'telefone'}
                    error={touched.telefone ? errors.telefone : undefined}
                  />

                  <DonationInputField
                    label="CPF"
                    icon="card-outline"
                    value={form.cpf}
                    onChangeText={(v) => setField('cpf', v)}
                    onFocus={() => {
                      setFocusedField('cpf');
                      setTouched((current) => ({ ...current, cpf: true }));
                    }}
                    onBlur={() => {
                      setFocusedField(null);
                      validate(form, valorInput);
                    }}
                    placeholder="000.000.000-00"
                    keyboardType="numeric"
                    valid={isFieldValid('cpf')}
                    focused={focusedField === 'cpf'}
                    error={touched.cpf ? errors.cpf : undefined}
                  />

                  <DonationInputField
                    label="E-mail"
                    icon="mail-outline"
                    value={form.email}
                    onChangeText={(v) => setField('email', v)}
                    onFocus={() => {
                      setFocusedField('email');
                      setTouched((current) => ({ ...current, email: true }));
                    }}
                    onBlur={() => {
                      setFocusedField(null);
                      validate(form, valorInput);
                    }}
                    placeholder="seu@email.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    valid={isFieldValid('email')}
                    focused={focusedField === 'email'}
                    error={touched.email ? errors.email : undefined}
                  />
                </>
              ) : null}
            </View>

            <View style={styles.securityInfoBox}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityInfoText}>
                Seus dados são protegidos e usados apenas para identificação da doação.
              </Text>
            </View>

            {erroExterno ? <Text style={styles.externalErrorText}>{erroExterno}</Text> : null}
          </View>

          <TouchableOpacity style={styles.yellowContinueButton} onPress={handleContinuar}>
            <Text style={styles.yellowContinueText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={18} color={AZUL_ESCURO} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
    <KeyboardAvoidingView
      style={styles.formScreen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <ProgressHeader onBack={onBack} />

      <ScrollView
        contentContainerStyle={[styles.cardContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={[styles.metodoBanner, { backgroundColor: AZUL }]}> 
          <Text style={styles.metodoBannerIcone}>💳</Text>
          <View>
            <Text style={styles.metodoBannerLabel}>DOAÇÃO VIA</Text>
            <Text style={styles.metodoBannerTitulo}>Cartão de Crédito</Text>
          </View>
        </View>

        <View style={styles.cartaoPreview}>
          <Text style={styles.cartaoPreviewBandeira}>💳</Text>
          <Text style={styles.cartaoPreviewNumero}>{cartao.numero || '•••• •••• •••• ••••'}</Text>
          <View style={styles.cartaoPreviewBottom}>
            <Text style={styles.cartaoPreviewNome}>{cartao.nome.toUpperCase() || 'NOME NO CARTÃO'}</Text>
            <Text style={styles.cartaoPreviewValidade}>{cartao.validade || 'MM/AA'}</Text>
          </View>
        </View>

        <Text style={styles.inputLabel}>Número do cartão *</Text>
        <TextInput
          style={styles.input}
          value={cartao.numero}
          onChangeText={(v) => setCartao({ ...cartao, numero: formatCartaoNumero(v) })}
          placeholder="0000 0000 0000 0000"
          placeholderTextColor="#9BACC8"
          keyboardType="numeric"
        />

        <Text style={styles.inputLabel}>Nome no cartão *</Text>
        <TextInput
          style={styles.input}
          value={cartao.nome}
          onChangeText={(v) => setCartao({ ...cartao, nome: v })}
          placeholder="Como aparece no cartão"
          placeholderTextColor="#9BACC8"
          autoCapitalize="characters"
        />

        <View style={styles.cardRowInputs}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Validade *</Text>
            <TextInput
              style={styles.input}
              value={cartao.validade}
              onChangeText={(v) => setCartao({ ...cartao, validade: formatValidade(v) })}
              placeholder="MM/AA"
              placeholderTextColor="#9BACC8"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>CVV *</Text>
            <TextInput
              style={styles.input}
              value={cartao.cvv}
              onChangeText={(v) => setCartao({ ...cartao, cvv: v.replace(/\D/g, '').slice(0, 4) })}
              placeholder="000"
              placeholderTextColor="#9BACC8"
              keyboardType="numeric"
              secureTextEntry
            />
          </View>
        </View>

        {erro ? <Text style={styles.erroText}>{erro}</Text> : null}

        <TouchableOpacity style={styles.btnPrimario} onPress={handleContinuar}>
          <Text style={styles.btnPrimarioText}>Confirmar doação</Text>
        </TouchableOpacity>
        <Text style={styles.segurancaText}>Pagamento seguro - dados criptografados</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function TelaConfirmacao({
  metodo,
  dados,
  valor,
  resultado,
  onNova,
}: {
  metodo: MetodoOption;
  dados: DadosDoador;
  valor: number;
  resultado: ResultadoPagamento;
  onNova: () => void;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { payment } = resultado;

  async function handleCopiarPix() {
    if (payment.qr_code) {
      await Clipboard.setStringAsync(payment.qr_code);
      Alert.alert('Copiado', 'Código PIX copiado para a área de transferência.');
    }
  }

  async function handleCopiarBoleto() {
    if (payment.boleto_barcode) {
      await Clipboard.setStringAsync(payment.boleto_barcode);
      Alert.alert('Copiado', 'Linha digitável copiada.');
    }
  }

  function handleAbrirBoleto() {
    if (payment.boleto_url) {
      Linking.openURL(payment.boleto_url);
    }
  }

  const metodoEfetivo = metodo.apiMethod;
  const corMetodo = metodoEfetivo === 'pix' ? VERDE : AZUL;

  return (
    <View style={{ flex: 1, backgroundColor: corMetodo }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[
          styles.confirmacaoContent,
          { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 30 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.confirmacaoIconBox}>
          <Text style={styles.confirmacaoIconText}>
            {metodoEfetivo === 'credit_card' ? '✓' : metodoEfetivo === 'pix' ? '⚡' : '🏦'}
          </Text>
        </View>

        <Text style={styles.confirmacaoTitulo}>
          {metodoEfetivo === 'pix'
            ? `${metodo.label} gerado!`
            : metodoEfetivo === 'boleto'
              ? 'Boleto gerado!'
              : 'Doação confirmada!'}
        </Text>
        <Text style={styles.confirmacaoSubtitulo}>
          {metodoEfetivo === 'pix'
            ? 'Escaneie o QR Code ou copie o código para concluir sua doação.'
            : metodoEfetivo === 'boleto'
              ? 'Pague o boleto até o vencimento no seu banco, lotérica ou app.'
              : `Obrigado, ${dados.nome.split(' ')[0]}! Sua doação foi processada com sucesso.`}
        </Text>

        <View style={styles.confirmacaoResumo}>
          <Text style={styles.confirmacaoResumoTitulo}>DADOS DA DOAÇÃO</Text>
          <RowItem label="Método" value={metodo.label} />
          <RowItem label="Valor" value={`R$ ${valor.toFixed(2).replace('.', ',')}`} />
          <RowItem label="Nome" value={dados.nome} />
          <RowItem label="E-mail" value={dados.email} />
          <RowItem label="CPF" value={dados.cpf} />
        </View>

        {metodoEfetivo === 'pix' ? (
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
              <Text style={styles.pixChave} numberOfLines={2}>{payment.qr_code ?? '--'}</Text>
              <TouchableOpacity style={styles.pixCopiarBtn} onPress={handleCopiarPix}>
                <Text style={styles.pixCopiarText}>Copiar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {metodoEfetivo === 'boleto' ? (
          <View style={styles.boletoBox}>
            <Text style={styles.boletoLabel}>LINHA DIGITÁVEL</Text>
            <Text style={styles.boletoLinha}>{payment.boleto_barcode ?? '--'}</Text>
            <TouchableOpacity style={styles.boletoCopiarBtn} onPress={handleCopiarBoleto}>
              <Text style={styles.boletoCopiarText}>Copiar linha digitável</Text>
            </TouchableOpacity>
            {payment.boleto_url ? (
              <TouchableOpacity
                style={[styles.boletoCopiarBtn, { backgroundColor: 'rgba(255,255,255,0.24)', marginTop: 8 }]}
                onPress={handleAbrirBoleto}>
                <Text style={styles.boletoCopiarText}>Abrir boleto (PDF)</Text>
              </TouchableOpacity>
            ) : null}
            {payment.due_at ? (
              <Text style={styles.boletoInfoText}>
                Vencimento: {new Date(payment.due_at).toLocaleDateString('pt-BR')}
              </Text>
            ) : null}
          </View>
        ) : null}

        <TouchableOpacity style={styles.btnNova} onPress={onNova}>
          <Text style={styles.btnNovaText}>Fazer nova doação</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnVoltar} onPress={() => router.push('/' as any)}>
          <Text style={styles.btnVoltarText}>Voltar ao início</Text>
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

export default function DoacaoScreen() {
  const router = useRouter();
  const { usuario, authToken } = useInscricoes();

  const [step, setStep] = useState<Step>('formulario');
  const [metodoId, setMetodoId] = useState<MetodoPagamento>('pix');
  const [valor, setValor] = useState<number | null>(null);
  const [dadosDoador, setDadosDoador] = useState<DadosDoador | null>(null);
  const [resultado, setResultado] = useState<ResultadoPagamento | null>(null);
  const [erroProcessamento, setErroProcessamento] = useState('');

  const dadosAutenticado: DadosDoador | null = usuario
    ? {
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
        telefone: usuario.telefone ?? '',
      }
    : null;

  const metodoSelecionado = useMemo(() => {
    return METODOS.find((item) => item.id === metodoId) ?? METODOS[0];
  }, [metodoId]);

  function handleFormularioContinuar(payload: {
    metodo: MetodoPagamento;
    valor: number;
    dados: DadosDoador;
  }) {
    setErroProcessamento('');
    setMetodoId(payload.metodo);
    setValor(payload.valor);
    setDadosDoador(payload.dados);

    if ((METODOS.find((item) => item.id === payload.metodo)?.apiMethod ?? 'pix') === 'credit_card') {
      setStep('cartao');
      return;
    }

    processarPagamento(payload.metodo, payload.valor, payload.dados, null);
  }

  function handleCartaoContinuar(cartao: DadosCartao) {
    if (!dadosDoador || valor === null) return;
    processarPagamento(metodoId, valor, dadosDoador, cartao);
  }

  async function processarPagamento(
    metodoOriginal: MetodoPagamento,
    valorFinal: number,
    dados: DadosDoador,
    cartao: DadosCartao | null,
  ) {
    setStep('processando');
    setErroProcessamento('');

    const metodo = METODOS.find((item) => item.id === metodoOriginal) ?? METODOS[0];

    try {
      const isAnonimo = !authToken;
      const url = isAnonimo ? `${API_BASE_URL}/donations/anonymous` : `${API_BASE_URL}/donations`;

      const body: Record<string, string | number> = {
        amount: valorFinal,
        payment_method: metodo.apiMethod,
        donor_name: dados.nome,
        donor_email: dados.email,
        donor_cpf: dados.cpf.replace(/\D/g, ''),
        donor_phone: dados.telefone.replace(/\D/g, ''),
      };

      if (metodo.apiMethod === 'credit_card' && cartao) {
        body.card_number = cartao.numero.replace(/\D/g, '');
        body.card_holder = cartao.nome;
        body.card_expiry = cartao.validade;
        body.card_cvv = cartao.cvv;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const rawText = await res.text();
      let json: any = {};
      try {
        json = JSON.parse(rawText);
      } catch {
        throw new Error(`Resposta inválida do servidor (${res.status}).`);
      }

      if (!res.ok) {
        throw new Error(json.message ?? `Erro ${res.status} ao processar pagamento.`);
      }

      setResultado(json);
      setStep('confirmacao');
    } catch (e: any) {
      setErroProcessamento(e.message ?? 'Não foi possível processar o pagamento.');
      setStep('formulario');
    }
  }

  function handleNova() {
    setStep('formulario');
    setMetodoId('pix');
    setValor(null);
    setDadosDoador(null);
    setResultado(null);
    setErroProcessamento('');
  }

  if (step === 'processando') {
    return (
      <View style={styles.processingScreen}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.processingText}>Processando pagamento...</Text>
      </View>
    );
  }

  if (step === 'cartao') {
    return <TelaCartao onBack={() => setStep('formulario')} onContinuar={handleCartaoContinuar} />;
  }

  if (step === 'confirmacao' && dadosDoador && resultado && valor !== null) {
    return (
      <TelaConfirmacao
        metodo={metodoSelecionado}
        dados={dadosDoador}
        valor={valor}
        resultado={resultado}
        onNova={handleNova}
      />
    );
  }

  return (
    <TelaFormulario
      onBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/' as any);
        }
      }}
      initialMetodo={metodoId}
      onContinuar={handleFormularioContinuar}
      erroExterno={erroProcessamento}
      dadosAutenticado={dadosAutenticado}
      authToken={authToken}
    />
  );
}

const styles = StyleSheet.create({
  formScreen: {
    flex: 1,
    backgroundColor: BG,
  },
  processingScreen: {
    flex: 1,
    backgroundColor: AZUL,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  processingText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
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
  logoImage: {
    width: 112,
    height: 44,
    marginLeft: -8,
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
  progressStepNumberActive: {
    color: AZUL_ESCURO,
    fontSize: 13,
    fontWeight: '800',
  },
  progressStepLabel: {
    fontSize: 12,
  },
  progressStepLabelActive: {
    color: '#fff',
    fontWeight: '700',
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
    shadowColor: AZUL_ESCURO,
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

  selectTrigger: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8EEF9',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  selectValueIcon: {
    fontSize: 18,
  },
  selectValueLabel: {
    color: TEXTO,
    fontSize: 13,
    fontWeight: '700',
  },
  selectValueDesc: {
    color: '#8CA6CC',
    fontSize: 11,
    marginTop: 1,
  },
  selectOptions: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EEF9',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4FC',
  },
  selectOptionActive: {
    backgroundColor: '#F5F8FF',
  },
  selectOptionIcon: {
    fontSize: 16,
  },
  selectOptionLabel: {
    color: TEXTO,
    fontSize: 13,
    fontWeight: '600',
  },
  selectOptionLabelActive: {
    color: AZUL_ESCURO,
  },
  selectOptionDesc: {
    color: '#8CA6CC',
    fontSize: 11,
  },

  quickAmountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountButton: {
    borderWidth: 1.5,
    borderColor: AZUL,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickAmountButtonActive: {
    backgroundColor: AZUL,
  },
  quickAmountText: {
    color: AZUL,
    fontSize: 12,
    fontWeight: '700',
  },
  quickAmountTextActive: {
    color: '#fff',
  },
  amountPrefix: {
    color: '#6B87B0',
    fontSize: 15,
    fontWeight: '700',
  },

  securityInfoBox: {
    marginTop: 14,
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
  externalErrorText: {
    marginTop: 12,
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
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

  cardContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  metodoBanner: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  metodoBannerIcone: {
    fontSize: 28,
  },
  metodoBannerLabel: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  metodoBannerTitulo: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
  },
  cartaoPreview: {
    backgroundColor: AZUL,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    gap: 12,
  },
  cartaoPreviewBandeira: {
    fontSize: 28,
  },
  cartaoPreviewNumero: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 2,
  },
  cartaoPreviewBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cartaoPreviewNome: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  cartaoPreviewValidade: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  cardRowInputs: {
    flexDirection: 'row',
    gap: 12,
  },

  inputLabel: {
    color: '#6B87B0',
    fontSize: 12,
    fontWeight: '700',
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
  erroText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
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
    textTransform: 'uppercase',
  },
  segurancaText: {
    color: '#6B87B0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },

  confirmacaoContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  confirmacaoIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  confirmacaoIconText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
  },
  confirmacaoTitulo: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 8,
  },
  confirmacaoSubtitulo: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: '85%',
  },
  confirmacaoResumo: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  confirmacaoResumoTitulo: {
    color: 'rgba(255,255,255,0.7)',
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

  pixBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  qrCodeImagem: {
    width: 180,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  qrCodePlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodePlaceholderText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  pixLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  pixChaveWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingLeft: 14,
    overflow: 'hidden',
    width: '100%',
  },
  pixChave: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    paddingVertical: 10,
  },
  pixCopiarBtn: {
    backgroundColor: '#00AAFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pixCopiarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  boletoBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  boletoLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  boletoLinha: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  boletoCopiarBtn: {
    backgroundColor: '#00AAFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  boletoCopiarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  boletoInfoText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    lineHeight: 17,
  },

  btnNova: {
    backgroundColor: '#00AAFF',
    borderRadius: 30,
    paddingHorizontal: 28,
    paddingVertical: 14,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  btnNovaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  btnVoltar: {
    borderRadius: 30,
    paddingHorizontal: 28,
    paddingVertical: 14,
    alignSelf: 'stretch',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  btnVoltarText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  dadosToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F4FC',
    borderRadius: 14,
    padding: 3,
    gap: 3,
    marginBottom: 14,
  },
  dadosToggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  dadosToggleOptionActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dadosToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9BACC8',
  },
  dadosToggleTextActive: {
    color: AZUL_ESCURO,
    fontWeight: '700',
  },

  dadosAutenticadoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D6E8F9',
  },
  dadosAutenticadoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dadosAutenticadoValue: {
    color: TEXTO,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },

  perfisList: {
    marginBottom: 14,
  },
  perfisListTitle: {
    color: SUBTEXTO,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  perfisScroll: {
    marginLeft: -2,
  },
  perfilChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#D6E8F9',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
  },
  perfilChipActive: {
    backgroundColor: AZUL_ESCURO,
    borderColor: AZUL_ESCURO,
  },
  perfilChipText: {
    color: AZUL_ESCURO,
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 100,
  },
  perfilChipTextActive: {
    color: '#fff',
  },
});
