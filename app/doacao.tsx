import React, { useState, useEffect } from 'react';
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
  Alert,
  Clipboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MPC } from '@/constants/theme';

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 44;
const ROXO = '#5B2FBE';
const CIANO = '#00AAFF';
const STORAGE_KEY = '@mpc_doacao_dados';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type MetodoPagamento = 'boleto' | 'pix' | 'cartao' | 'energia';

type Step = 'metodo' | 'dados' | 'cartao' | 'confirmacao';

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

// ─── Helpers de formatação ────────────────────────────────────────────────────

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

function formatCartaoNumero(text: string) {
  const digits = text.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatValidade(text: string) {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

// ─── Componente Header ────────────────────────────────────────────────────────

function Header({ titulo, onBack }: { titulo: string; onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backArrow}>←</Text>
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

// ─── Tela 1: Escolha do método de pagamento ───────────────────────────────────

function TelaMetodo({ onSelect }: { onSelect: (m: MetodoPagamento) => void }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const metodos: {
    id: MetodoPagamento;
    icone: string;
    titulo: string;
    descricao: string;
    desabilitado?: boolean;
    badge?: string;
  }[] = [
    {
      id: 'pix',
      icone: '⚡',
      titulo: 'PIX',
      descricao: 'Transferência instantânea, rápida e segura',
    },
    {
      id: 'boleto',
      icone: '🏦',
      titulo: 'Boleto Bancário',
      descricao: 'Pague em qualquer banco ou lotérica',
    },
    {
      id: 'cartao',
      icone: '💳',
      titulo: 'Cartão de Crédito',
      descricao: 'Visa, Mastercard, Elo e outras bandeiras',
    },
    {
      id: 'energia',
      icone: '⚡',
      titulo: 'Conta de Energia',
      descricao: 'Em breve — doação na fatura de energia',
      desabilitado: true,
      badge: 'EM BREVE',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: ROXO }}>
      <StatusBar style="light" translucent />
      <Header titulo="" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[styles.metodoContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}>
        {/* Hero texto */}
        <View style={styles.metodoHero}>
          <Text style={styles.metodoOverline}>MOVIMENTO PRÓ CRIANÇA</Text>
          <Text style={styles.metodoTitulo}>Faça a diferença{'\n'}na vida de uma{'\n'}criança</Text>
          <Text style={styles.metodoSubtitulo}>
            Sua doação apoia atividades gratuitas para crianças e jovens em situação de
            vulnerabilidade no Recife.
          </Text>
        </View>

        {/* Escolha o método */}
        <Text style={styles.metodosLabel}>Escolha a forma de doação</Text>

        {metodos.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.metodoCard, m.desabilitado && styles.metodoCardDesabilitado]}
            onPress={() => !m.desabilitado && onSelect(m.id)}
            activeOpacity={m.desabilitado ? 1 : 0.75}
            disabled={m.desabilitado}>
            <View style={[styles.metodoIconWrap, m.desabilitado && { opacity: 0.4 }]}>
              <Text style={styles.metodoIcone}>{m.icone}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.metodoCardTitulo, m.desabilitado && { opacity: 0.5 }]}>
                  {m.titulo}
                </Text>
                {m.badge && (
                  <View style={styles.metoedoBadge}>
                    <Text style={styles.metodoBadgeText}>{m.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.metodoCardDesc, m.desabilitado && { opacity: 0.5 }]}>
                {m.descricao}
              </Text>
            </View>
            {!m.desabilitado && <Text style={styles.metodoArrow}>›</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Tela 2a: Dados pessoais (Boleto / PIX) ──────────────────────────────────

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
  const [erro, setErro] = useState('');

  // Carrega dados salvos do localStorage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw) as DadosDoador;
          setForm(saved);
        }
      })
      .catch(() => {});
  }, []);

  function handleContinuar() {
    if (!form.nome.trim()) return setErro('Informe o nome completo.');
    if (!form.email.trim() || !form.email.includes('@')) return setErro('Informe um e-mail válido.');
    if (form.telefone.replace(/\D/g, '').length < 10) return setErro('Informe um telefone válido.');
    if (form.cpf.replace(/\D/g, '').length < 11) return setErro('Informe um CPF válido.');

    setErro('');
    // Salva no AsyncStorage para próxima vez
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(form)).catch(() => {});
    onContinuar(form);
  }

  const tituloMetodo = metodo === 'pix' ? 'PIX' : 'Boleto';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F5F5F5' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header titulo="" onBack={onBack} />

      <ScrollView
        contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Banner do método */}
        <View style={[styles.metodoBanner, { backgroundColor: metodo === 'pix' ? '#00C896' : '#021DAA' }]}>
          <Text style={styles.metodoBannerIcone}>{metodo === 'pix' ? '⚡' : '🏦'}</Text>
          <View>
            <Text style={styles.metodoBannerLabel}>DOAÇÃO VIA</Text>
            <Text style={styles.metodoBannerTitulo}>{tituloMetodo}</Text>
          </View>
        </View>

        <Text style={styles.formTitulo}>Seus dados</Text>
        <Text style={styles.formSubtitulo}>
          Precisamos das suas informações para gerar{metodo === 'pix' ? ' o QR Code' : ' o boleto'}.
        </Text>

        <Text style={styles.inputLabel}>Nome completo *</Text>
        <TextInput
          style={styles.input}
          value={form.nome}
          onChangeText={(v) => setForm({ ...form, nome: v })}
          placeholder="Seu nome completo"
          placeholderTextColor="#aaa"
          autoCapitalize="words"
        />

        <Text style={styles.inputLabel}>E-mail *</Text>
        <TextInput
          style={styles.input}
          value={form.email}
          onChangeText={(v) => setForm({ ...form, email: v })}
          placeholder="seu@email.com"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Telefone / WhatsApp *</Text>
        <TextInput
          style={styles.input}
          value={form.telefone}
          onChangeText={(v) => setForm({ ...form, telefone: formatTelefone(v) })}
          placeholder="(81) 99999-9999"
          placeholderTextColor="#aaa"
          keyboardType="phone-pad"
        />

        <Text style={styles.inputLabel}>CPF *</Text>
        <TextInput
          style={styles.input}
          value={form.cpf}
          onChangeText={(v) => setForm({ ...form, cpf: formatCpf(v) })}
          placeholder="000.000.000-00"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
        />

        {erro ? <Text style={styles.erroText}>{erro}</Text> : null}

        <TouchableOpacity style={styles.btnPrimario} onPress={handleContinuar}>
          <Text style={styles.btnPrimarioText}>CONTINUAR</Text>
        </TouchableOpacity>

        <Text style={styles.segurancaText}>🔒 Seus dados são protegidos e criptografados</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Tela 2b: Dados do cartão de crédito ─────────────────────────────────────

function TelaCartao({
  onBack,
  onContinuar,
}: {
  onBack: () => void;
  onContinuar: (dados: DadosDoador, cartao: DadosCartao) => void;
}) {
  const insets = useSafeAreaInsets();
  const [dadosPessoais, setDadosPessoais] = useState<DadosDoador>({
    nome: '', email: '', telefone: '', cpf: '',
  });
  const [cartao, setCartao] = useState<DadosCartao>({
    numero: '', nome: '', validade: '', cvv: '',
  });
  const [erro, setErro] = useState('');

  // Carrega dados salvos
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw) as DadosDoador;
          setDadosPessoais(saved);
        }
      })
      .catch(() => {});
  }, []);

  function handleContinuar() {
    if (!dadosPessoais.nome.trim()) return setErro('Informe o nome completo.');
    if (!dadosPessoais.email.trim() || !dadosPessoais.email.includes('@'))
      return setErro('Informe um e-mail válido.');
    if (dadosPessoais.telefone.replace(/\D/g, '').length < 10)
      return setErro('Informe um telefone válido.');
    if (dadosPessoais.cpf.replace(/\D/g, '').length < 11) return setErro('Informe um CPF válido.');
    if (cartao.numero.replace(/\D/g, '').length < 16) return setErro('Número do cartão inválido.');
    if (!cartao.nome.trim()) return setErro('Informe o nome no cartão.');
    if (cartao.validade.replace(/\D/g, '').length < 4) return setErro('Validade inválida.');
    if (cartao.cvv.replace(/\D/g, '').length < 3) return setErro('CVV inválido.');

    setErro('');
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dadosPessoais)).catch(() => {});
    onContinuar(dadosPessoais, cartao);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F5F5F5' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header titulo="" onBack={onBack} />

      <ScrollView
        contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={[styles.metodoBanner, { backgroundColor: '#5B2FBE' }]}>
          <Text style={styles.metodoBannerIcone}>💳</Text>
          <View>
            <Text style={styles.metodoBannerLabel}>DOAÇÃO VIA</Text>
            <Text style={styles.metodoBannerTitulo}>Cartão de Crédito</Text>
          </View>
        </View>

        {/* ── Dados pessoais ── */}
        <Text style={styles.sectionTitle}>Dados pessoais</Text>

        <Text style={styles.inputLabel}>Nome completo *</Text>
        <TextInput
          style={styles.input}
          value={dadosPessoais.nome}
          onChangeText={(v) => setDadosPessoais({ ...dadosPessoais, nome: v })}
          placeholder="Seu nome completo"
          placeholderTextColor="#aaa"
          autoCapitalize="words"
        />

        <Text style={styles.inputLabel}>E-mail *</Text>
        <TextInput
          style={styles.input}
          value={dadosPessoais.email}
          onChangeText={(v) => setDadosPessoais({ ...dadosPessoais, email: v })}
          placeholder="seu@email.com"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Telefone / WhatsApp *</Text>
        <TextInput
          style={styles.input}
          value={dadosPessoais.telefone}
          onChangeText={(v) =>
            setDadosPessoais({ ...dadosPessoais, telefone: formatTelefone(v) })
          }
          placeholder="(81) 99999-9999"
          placeholderTextColor="#aaa"
          keyboardType="phone-pad"
        />

        <Text style={styles.inputLabel}>CPF *</Text>
        <TextInput
          style={styles.input}
          value={dadosPessoais.cpf}
          onChangeText={(v) => setDadosPessoais({ ...dadosPessoais, cpf: formatCpf(v) })}
          placeholder="000.000.000-00"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
        />

        {/* ── Dados do cartão ── */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Dados do cartão</Text>

        {/* Preview do cartão */}
        <View style={styles.cartaoPreview}>
          <Text style={styles.cartaoPreviewBandeira}>💳</Text>
          <Text style={styles.cartaoPreviewNumero}>
            {cartao.numero || '•••• •••• •••• ••••'}
          </Text>
          <View style={styles.cartaoPreviewBottom}>
            <Text style={styles.cartaoPreviewNome}>
              {cartao.nome.toUpperCase() || 'NOME NO CARTÃO'}
            </Text>
            <Text style={styles.cartaoPreviewValidade}>{cartao.validade || 'MM/AA'}</Text>
          </View>
        </View>

        <Text style={styles.inputLabel}>Número do cartão *</Text>
        <TextInput
          style={styles.input}
          value={cartao.numero}
          onChangeText={(v) => setCartao({ ...cartao, numero: formatCartaoNumero(v) })}
          placeholder="0000 0000 0000 0000"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
        />

        <Text style={styles.inputLabel}>Nome no cartão *</Text>
        <TextInput
          style={styles.input}
          value={cartao.nome}
          onChangeText={(v) => setCartao({ ...cartao, nome: v })}
          placeholder="Como aparece no cartão"
          placeholderTextColor="#aaa"
          autoCapitalize="characters"
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Validade *</Text>
            <TextInput
              style={styles.input}
              value={cartao.validade}
              onChangeText={(v) => setCartao({ ...cartao, validade: formatValidade(v) })}
              placeholder="MM/AA"
              placeholderTextColor="#aaa"
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
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              secureTextEntry
            />
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

// ─── Tela 3: Confirmação ──────────────────────────────────────────────────────

function TelaConfirmacao({
  metodo,
  dados,
  onNova,
}: {
  metodo: MetodoPagamento;
  dados: DadosDoador;
  onNova: () => void;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Chave PIX fictícia para demonstração
  const PIX_KEY = '00.693.996/0001-56';

  // Linha digitável do boleto fictícia
  const BOLETO_LINHA =
    '03399.07564 83600.040002 01030.000000 6 94950000010000';

  function handleCopiarPix() {
    Clipboard.setString(PIX_KEY);
    Alert.alert('Copiado!', 'Chave PIX copiada para a área de transferência.');
  }

  function handleCopiarBoleto() {
    Clipboard.setString(BOLETO_LINHA);
    Alert.alert('Copiado!', 'Linha digitável copiada.');
  }

  const config: Record<
    MetodoPagamento,
    { cor: string; icone: string; titulo: string; subtitulo: string }
  > = {
    pix: {
      cor: '#00C896',
      icone: '⚡',
      titulo: 'QR Code PIX gerado!',
      subtitulo: 'Escaneie o QR Code ou copie a chave abaixo para concluir sua doação.',
    },
    boleto: {
      cor: '#021DAA',
      icone: '🏦',
      titulo: 'Boleto gerado!',
      subtitulo: 'Pague o boleto até o vencimento no seu banco, lotérica ou app de pagamentos.',
    },
    cartao: {
      cor: ROXO,
      icone: '💳',
      titulo: 'Doação confirmada!',
      subtitulo: 'Sua doação via cartão de crédito foi processada com sucesso.',
    },
    energia: {
      cor: '#F7941D',
      icone: '⚡',
      titulo: 'Em breve!',
      subtitulo: '',
    },
  };

  const c = config[metodo];

  return (
    <View style={{ flex: 1, backgroundColor: c.cor }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[
          styles.confirmacaoContent,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Ícone de sucesso */}
        <View style={styles.confirmacaoIconBox}>
          <Text style={styles.confirmacaoIconText}>
            {metodo === 'cartao' ? '✓' : c.icone}
          </Text>
        </View>

        <Text style={styles.confirmacaoTitulo}>{c.titulo}</Text>
        <Text style={styles.confirmacaoSubtitulo}>{c.subtitulo}</Text>

        {/* Resumo do doador */}
        <View style={styles.confirmacaoResumo}>
          <Text style={styles.confirmacaoResumoTitulo}>DADOS DO DOADOR</Text>
          <RowItem label="Nome" value={dados.nome} />
          <RowItem label="E-mail" value={dados.email} />
          <RowItem label="Telefone" value={dados.telefone} />
          <RowItem label="CPF" value={dados.cpf} />
        </View>

        {/* Instrução específica por método */}
        {metodo === 'pix' && (
          <View style={styles.pixBox}>
            {/* QR Code fictício (placeholder visual) */}
            <View style={styles.qrCodePlaceholder}>
              <Text style={styles.qrCodeText}>QR CODE PIX</Text>
              <View style={styles.qrCodeGrid}>
                {Array.from({ length: 25 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.qrCodeCell,
                      { backgroundColor: (i + Math.floor(i / 5)) % 3 === 0 ? '#1a1a1a' : '#fff' },
                    ]}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.pixLabel}>OU COPIE A CHAVE PIX</Text>
            <View style={styles.pixChaveWrap}>
              <Text style={styles.pixChave}>{PIX_KEY}</Text>
              <TouchableOpacity style={styles.pixCopiarBtn} onPress={handleCopiarPix}>
                <Text style={styles.pixCopiarText}>COPIAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {metodo === 'boleto' && (
          <View style={styles.boletoBox}>
            <Text style={styles.boletoLabel}>LINHA DIGITÁVEL</Text>
            <Text style={styles.boletoLinha}>{BOLETO_LINHA}</Text>
            <TouchableOpacity style={styles.boletoCopiarBtn} onPress={handleCopiarBoleto}>
              <Text style={styles.boletoCopiarText}>COPIAR LINHA DIGITÁVEL</Text>
            </TouchableOpacity>
            <View style={styles.boletoInfo}>
              <Text style={styles.boletoInfoText}>
                ⏰ Vencimento: {new Date(Date.now() + 3 * 86400000).toLocaleDateString('pt-BR')}
              </Text>
              <Text style={styles.boletoInfoText}>
                O boleto pode levar até 2 dias úteis para compensar.
              </Text>
            </View>
          </View>
        )}

        {metodo === 'cartao' && (
          <View style={styles.cartaoSucessoBox}>
            <Text style={styles.cartaoSucessoText}>
              Obrigado, {dados.nome.split(' ')[0]}! Sua doação já está ativa e vai transformar a
              vida de crianças em Recife. 💙
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.btnNova}
          onPress={onNova}>
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
  const [step, setStep] = useState<Step>('metodo');
  const [metodo, setMetodo] = useState<MetodoPagamento | null>(null);
  const [dadosDoador, setDadosDoador] = useState<DadosDoador | null>(null);

  function handleMetodoSelect(m: MetodoPagamento) {
    setMetodo(m);
    if (m === 'cartao') {
      setStep('cartao');
    } else {
      setStep('dados');
    }
  }

  function handleDadosContinuar(dados: DadosDoador) {
    setDadosDoador(dados);
    setStep('confirmacao');
  }

  function handleCartaoContinuar(dados: DadosDoador, _cartao: DadosCartao) {
    setDadosDoador(dados);
    setStep('confirmacao');
  }

  function handleNova() {
    setStep('metodo');
    setMetodo(null);
    setDadosDoador(null);
  }

  switch (step) {
    case 'metodo':
      return <TelaMetodo onSelect={handleMetodoSelect} />;

    case 'dados':
      return (
        <TelaDados
          metodo={metodo!}
          onBack={() => setStep('metodo')}
          onContinuar={handleDadosContinuar}
        />
      );

    case 'cartao':
      return (
        <TelaCartao
          onBack={() => setStep('metodo')}
          onContinuar={handleCartaoContinuar}
        />
      );

    case 'confirmacao':
      return (
        <TelaConfirmacao
          metodo={metodo!}
          dados={dadosDoador!}
          onNova={handleNova}
        />
      );

    default:
      return null;
  }
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Header ────────────────────────────────────
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
  logoImage: {
    width: 110,
    height: 60,
  },

  // ── Tela método ───────────────────────────────
  metodoContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 0,
  },
  metodoHero: {
    paddingVertical: 20,
    gap: 8,
  },
  metodoOverline: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  metodoTitulo: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
  },
  metodoSubtitulo: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: '85%',
  },
  metodosLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 12,
  },
  metodoCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  metodoCardDesabilitado: {
    opacity: 0.6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metodoIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metodoIcone: {
    fontSize: 22,
  },
  metodoCardTitulo: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  metodoCardDesc: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  metoedoBadge: {
    backgroundColor: '#F7941D',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  metodoBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metodoArrow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 22,
    fontWeight: '300',
  },

  // ── Formulário ────────────────────────────────
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  metodoBanner: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  metodoBannerIcone: {
    fontSize: 28,
  },
  metodoBannerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  metodoBannerTitulo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  formTitulo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  formSubtitulo: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
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
    marginTop: 8,
  },
  btnPrimario: {
    backgroundColor: ROXO,
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
  },
  btnPrimarioText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.8,
  },
  segurancaText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },

  // ── Preview do cartão ─────────────────────────
  cartaoPreview: {
    backgroundColor: ROXO,
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

  // ── Confirmação ───────────────────────────────
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

  // ── PIX ───────────────────────────────────────
  pixBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  qrCodePlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  qrCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.5,
  },
  qrCodeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 100,
  },
  qrCodeCell: {
    width: 20,
    height: 20,
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
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  pixCopiarBtn: {
    backgroundColor: CIANO,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pixCopiarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // ── Boleto ────────────────────────────────────
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
    backgroundColor: CIANO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  boletoCopiarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  boletoInfo: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },
  boletoInfoText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    lineHeight: 17,
  },

  // ── Cartão confirmação ────────────────────────
  cartaoSucessoBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 20,
    width: '100%',
    marginBottom: 16,
  },
  cartaoSucessoText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  // ── Botões finais ─────────────────────────────
  btnNova: {
    backgroundColor: CIANO,
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
  },
});
