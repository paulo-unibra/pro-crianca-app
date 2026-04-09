import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar as RNStatusBar,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MPC } from '@/constants/theme';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 44;

// ─── Dados dos cursos ─────────────────────────────────────────────────────────

type Curso = {
  id: string;
  icon: string;
  nome: string;
  faixaEtaria: string;
  unidade: string;
  categoria: string;
};

const CURSOS: Curso[] = [
  {
    id: '1',
    icon: '🎵',
    nome: 'Canto e Coral',
    faixaEtaria: '7 a 15 anos',
    unidade: 'Coelhos',
    categoria: 'Cultura',
  },
  {
    id: '2',
    icon: '🎻',
    nome: 'Orquestra de Cordas',
    faixaEtaria: '12 a 17 anos',
    unidade: 'Recife Antigo',
    categoria: 'Cultura',
  },
  {
    id: '3',
    icon: '💼',
    nome: 'Profissionalizante',
    faixaEtaria: '7 a 18 anos',
    unidade: 'Piedade',
    categoria: 'Empregabilidade',
  },
  {
    id: '4',
    icon: '🎨',
    nome: 'Artes Visuais',
    faixaEtaria: '4 a 14 anos',
    unidade: 'Coelhos e Piedade',
    categoria: 'Cultura',
  },
  {
    id: '5',
    icon: '🪈',
    nome: 'Flauta Doce e Musicalização',
    faixaEtaria: '7 a 16 anos',
    unidade: 'Piedade',
    categoria: 'Cultura',
  },
  {
    id: '6',
    icon: '💃',
    nome: 'Dança Popular e Ballet',
    faixaEtaria: '7 a 17 anos',
    unidade: 'Coelhos',
    categoria: 'Cultura',
  },
  {
    id: '7',
    icon: '🩰',
    nome: 'Ballet',
    faixaEtaria: '5 a 16 anos',
    unidade: 'Piedade',
    categoria: 'Cultura',
  },
  {
    id: '8',
    icon: '🥁',
    nome: 'Percussão',
    faixaEtaria: '10 a 25 anos',
    unidade: 'Recife Antigo',
    categoria: 'Cultura',
  },
  {
    id: '9',
    icon: '📖',
    nome: 'Letramento',
    faixaEtaria: '6 a 17 anos',
    unidade: 'Coelhos e Piedade',
    categoria: 'Apoio',
  },
  {
    id: '10',
    icon: '🥋',
    nome: 'Judô',
    faixaEtaria: '6 a 22 anos',
    unidade: 'Coelhos e Piedade',
    categoria: 'Esportes',
  },
];

const CATEGORIAS = ['Todos', 'Cultura', 'Esportes', 'Empregabilidade', 'Apoio'];

const CATEGORIA_COR: Record<string, string> = {
  Cultura: '#7C4DFF',
  Esportes: '#F7941D',
  Empregabilidade: '#00AAFF',
  Apoio: '#4CAF50',
};

// ─── Componente de card de curso ──────────────────────────────────────────────

function CursoCard({
  curso,
  selecionado,
  onPress,
}: {
  curso: Curso;
  selecionado: boolean;
  onPress: () => void;
}) {
  const cor = CATEGORIA_COR[curso.categoria] ?? '#5B2FBE';
  return (
    <TouchableOpacity
      style={[styles.cursoCard, selecionado && { borderColor: cor, borderWidth: 2.5 }]}
      onPress={onPress}
      activeOpacity={0.8}>
      {/* Indicador selecionado */}
      {selecionado && (
        <View style={[styles.cursoCheck, { backgroundColor: cor }]}>
          <Text style={styles.cursoCheckText}>✓</Text>
        </View>
      )}

      <View style={[styles.cursoIconWrap, { backgroundColor: cor + '18' }]}>
        <Text style={styles.cursoIcon}>{curso.icon}</Text>
      </View>

      <Text style={styles.cursoNome}>{curso.nome}</Text>

      <View style={[styles.cursoBadge, { backgroundColor: cor + '18' }]}>
        <Text style={[styles.cursoBadgeText, { color: cor }]}>{curso.categoria}</Text>
      </View>

      <View style={styles.cursoInfo}>
        <Text style={styles.cursoInfoText}>👥 {curso.faixaEtaria}</Text>
        <Text style={styles.cursoInfoText}>📍 {curso.unidade}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function InscricaoScreen() {
  const insets = useSafeAreaInsets();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todos');
  const [cursoSelecionado, setCursoSelecionado] = useState<string | null>(null);
  const [step, setStep] = useState<'cursos' | 'form' | 'sucesso'>('cursos');
  const [form, setForm] = useState({
    nome: '',
    idade: '',
    responsavel: '',
    telefone: '',
    email: '',
  });

  const cursosFiltrados =
    categoriaSelecionada === 'Todos'
      ? CURSOS
      : CURSOS.filter((c) => c.categoria === categoriaSelecionada);

  const cursoEscolhido = CURSOS.find((c) => c.id === cursoSelecionado);

  function handleAvancar() {
    if (!cursoSelecionado) {
      Alert.alert('Atenção', 'Selecione um curso para continuar.');
      return;
    }
    setStep('form');
  }

  function handleEnviar() {
    if (!form.nome || !form.idade || !form.responsavel || !form.telefone) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }
    setStep('sucesso');
  }

  // ── Tela de sucesso ──
  if (step === 'sucesso') {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
        <StatusBar style="light" translucent />
        <View style={styles.header}>
          <Image source={require('@/assets/images/logo-branca.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <View style={styles.sucessoWrap}>
          <View style={styles.sucessoIcon}>
            <Text style={{ fontSize: 48 }}>🎉</Text>
          </View>
          <Text style={styles.sucessoTitulo}>Inscrição enviada!</Text>
          <Text style={styles.sucessoTexto}>
            Recebemos sua inscrição para{'\n'}
            <Text style={{ color: '#00AAFF', fontWeight: '800' }}>{cursoEscolhido?.nome}</Text>.
            {'\n\n'}Em breve nossa equipe entrará em contato pelo telefone informado.
          </Text>
          <TouchableOpacity
            style={styles.btnPrimario}
            onPress={() => {
              setStep('cursos');
              setCursoSelecionado(null);
              setForm({ nome: '', idade: '', responsavel: '', telefone: '', email: '' });
            }}>
            <Text style={styles.btnPrimarioText}>FAZER NOVA INSCRIÇÃO</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Formulário ──
  if (step === 'form') {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <StatusBar style="light" translucent />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep('cursos')}>
            <Text style={styles.backBtnText}>← Voltar</Text>
          </TouchableOpacity>
          <Image source={require('@/assets/images/logo-branca.png')} style={styles.logoImage} resizeMode="contain" />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.formScroll, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Curso selecionado */}
          <View style={styles.cursoSelecionadoCard}>
            <Text style={styles.cursoSelecionadoLabel}>Curso selecionado</Text>
            <Text style={styles.cursoSelecionadoNome}>
              {cursoEscolhido?.icon} {cursoEscolhido?.nome}
            </Text>
            <Text style={styles.cursoSelecionadoInfo}>
              📍 {cursoEscolhido?.unidade} · 👥 {cursoEscolhido?.faixaEtaria}
            </Text>
          </View>

          {/* Título */}
          <Text style={styles.formTitulo}>Dados do beneficiário</Text>
          <Text style={styles.formSubtitulo}>
            Preencha os dados de quem vai participar da atividade.
          </Text>

          {/* Campos */}
          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Nome completo *</Text>
            <TextInput
              style={styles.campoInput}
              placeholder="Nome da criança ou jovem"
              placeholderTextColor="#aaa"
              value={form.nome}
              onChangeText={(v) => setForm({ ...form, nome: v })}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Idade *</Text>
            <TextInput
              style={styles.campoInput}
              placeholder="Ex: 10"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={form.idade}
              onChangeText={(v) => setForm({ ...form, idade: v })}
            />
          </View>

          <Text style={styles.formTitulo}>Dados do responsável</Text>

          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Nome do responsável *</Text>
            <TextInput
              style={styles.campoInput}
              placeholder="Nome completo do responsável"
              placeholderTextColor="#aaa"
              value={form.responsavel}
              onChangeText={(v) => setForm({ ...form, responsavel: v })}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Telefone / WhatsApp *</Text>
            <TextInput
              style={styles.campoInput}
              placeholder="(81) 99999-9999"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
              value={form.telefone}
              onChangeText={(v) => setForm({ ...form, telefone: v })}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.campoLabel}>E-mail</Text>
            <TextInput
              style={styles.campoInput}
              placeholder="email@exemplo.com"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(v) => setForm({ ...form, email: v })}
            />
          </View>

          <Text style={styles.obrigatorio}>* Campos obrigatórios</Text>

          <TouchableOpacity style={styles.btnPrimario} onPress={handleEnviar}>
            <Text style={styles.btnPrimarioText}>ENVIAR INSCRIÇÃO</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Lista de cursos ──
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar style="light" translucent />

      {/* Header */}
      <View style={styles.header}>
        <Image source={require('@/assets/images/logo-branca.png')} style={styles.logoImage} resizeMode="contain" />
      </View>

      {/* Título da tela */}
      <View style={styles.telaHeader}>
        <Text style={styles.telaOverline}>MOVIMENTO PRÓ CRIANÇA</Text>
        <Text style={styles.telaTitulo}>Inscrição{'\n'}nos Cursos</Text>
        <Text style={styles.telaSubtitulo}>
          Atividades gratuitas para crianças, adolescentes e jovens de Recife e Jaboatão.
        </Text>
      </View>

      {/* Filtro de categorias */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtroScroll}>
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filtroChip,
              categoriaSelecionada === cat && styles.filtroChipAtivo,
            ]}
            onPress={() => setCategoriaSelecionada(cat)}>
            <Text
              style={[
                styles.filtroChipText,
                categoriaSelecionada === cat && styles.filtroChipTextAtivo,
              ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid de cursos */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.cursosGrid}
        showsVerticalScrollIndicator={false}>
        {cursosFiltrados.map((curso) => (
          <CursoCard
            key={curso.id}
            curso={curso}
            selecionado={cursoSelecionado === curso.id}
            onPress={() =>
              setCursoSelecionado(cursoSelecionado === curso.id ? null : curso.id)
            }
          />
        ))}
      </ScrollView>

      {/* Botão avançar */}
      <View style={[styles.footerBtn, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.btnPrimario, !cursoSelecionado && styles.btnDesativado]}
          onPress={handleAvancar}
          activeOpacity={cursoSelecionado ? 0.8 : 1}>
          <Text style={styles.btnPrimarioText}>
            {cursoSelecionado
              ? `CONTINUAR COM ${cursoEscolhido?.nome.toUpperCase()}`
              : 'SELECIONE UM CURSO'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5B2FBE',
  },

  // ── Header ────────────────────────────────────
  header: {
    paddingTop: STATUSBAR_HEIGHT + 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoImage: {
    width: 130,
    height: 75,
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 12,
  },
  backBtnText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Título da tela ────────────────────────────
  telaHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  telaOverline: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  telaTitulo: {
    color: MPC.branco,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 36,
  },
  telaSubtitulo: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },

  // ── Filtro ────────────────────────────────────
  filtroScroll: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filtroChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  filtroChipAtivo: {
    backgroundColor: MPC.branco,
    borderColor: MPC.branco,
  },
  filtroChipText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
  },
  filtroChipTextAtivo: {
    color: '#5B2FBE',
    fontWeight: '800',
  },

  // ── Grid de cursos ────────────────────────────
  cursosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
    paddingBottom: 16,
  },
  cursoCard: {
    backgroundColor: MPC.branco,
    borderRadius: 16,
    padding: 14,
    width: '47%',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  cursoCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  cursoCheckText: {
    color: MPC.branco,
    fontSize: 12,
    fontWeight: '900',
  },
  cursoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cursoIcon: {
    fontSize: 22,
  },
  cursoNome: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 6,
    lineHeight: 17,
  },
  cursoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 8,
  },
  cursoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cursoInfo: {
    gap: 2,
  },
  cursoInfoText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },

  // ── Botão footer ──────────────────────────────
  footerBtn: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#5B2FBE',
  },
  btnPrimario: {
    backgroundColor: '#00AAFF',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  btnDesativado: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  btnPrimarioText: {
    color: MPC.branco,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // ── Formulário ────────────────────────────────
  formScroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  cursoSelecionadoCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cursoSelecionadoLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cursoSelecionadoNome: {
    color: MPC.branco,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  cursoSelecionadoInfo: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  formTitulo: {
    color: MPC.branco,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    marginTop: 8,
  },
  formSubtitulo: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  campo: {
    marginBottom: 14,
  },
  campoLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  campoInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: MPC.branco,
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  obrigatorio: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 20,
  },

  // ── Sucesso ───────────────────────────────────
  sucessoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  sucessoIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sucessoTitulo: {
    color: MPC.branco,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  sucessoTexto: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
