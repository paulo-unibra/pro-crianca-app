import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ApiError,
  formatDias,
  formatTurnoHorario,
  shiftLabel,
  type Curso,
  type Inscricao,
  type Turno,
  type Unidade,
  useInscricoes,
} from '@/contexts/InscricoesContext';

function TabButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tabButton} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name={icon} size={23} color={active ? '#1B67C8' : '#A0A8BB'} />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const AZUL = '#1565C0';
const AMARELO = '#FFD600';
const BG = '#F4F7FF';
const TEXTO = '#1A2D5A';
const SUBTEXTO = '#6B87B0';

const FALLBACK_COURSE_IMAGE = 'https://images.unsplash.com/photo-1759143103113-6696d40598bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900';

const UNIT_BADGE_COLORS = [
  { bg: '#EFF6FF', text: '#3B82F6' },
  { bg: '#FDF2F8', text: '#EC4899' },
  { bg: '#ECFDF5', text: '#10B981' },
  { bg: '#F5F3FF', text: '#8B5CF6' },
  { bg: '#FFFBEB', text: '#F59E0B' },
];

type Step = 'catalogo' | 'selecionarUnidade' | 'selecionarTurno' | 'dados' | 'enviando' | 'protocolo';

function pickParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getCourseImage(course: { image?: string | null }) {
  return course.image || FALLBACK_COURSE_IMAGE;
}

function getUnitBadgeColor(unitName?: string) {
  if (!unitName) return UNIT_BADGE_COLORS[0];
  const hash = unitName
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return UNIT_BADGE_COLORS[hash % UNIT_BADGE_COLORS.length];
}

function LoadingBox({ mensagem }: { mensagem: string }) {
  return (
    <View style={styles.centeredBox}>
      <ActivityIndicator size="large" color={AZUL} />
      <Text style={styles.loadingText}>{mensagem}</Text>
    </View>
  );
}

function ErrorBox({ mensagem, onRetry }: { mensagem: string; onRetry?: () => void }) {
  return (
    <View style={styles.centeredBox}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>{mensagem}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function CatalogoCursos({ onOpenCourse }: { onOpenCourse: (curso: Curso) => void }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cursos, loadingCursos, errorCursos, recarregarCursos, listarUnidades, unidadesDoCurso } =
    useInscricoes();

  const [search, setSearch] = useState('');
  const [activeUnitId, setActiveUnitId] = useState<'all' | number>('all');
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [courseUnits, setCourseUnits] = useState<Record<number, Unidade[]>>({});
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function carregarCategorias() {
      if (cursos.length === 0) {
        setUnidades([]);
        setCourseUnits({});
        return;
      }

      setLoadingCategorias(true);

      try {
        const [allUnits, byCourse] = await Promise.all([
          listarUnidades(),
          Promise.all(
            cursos.map(async (curso) => {
              try {
                const units = await unidadesDoCurso(curso.id);
                return [curso.id, units] as [number, Unidade[]];
              } catch {
                return [curso.id, []] as [number, Unidade[]];
              }
            }),
          ),
        ]);

        if (!mounted) return;

        const byCourseMap: Record<number, Unidade[]> = {};
        byCourse.forEach(([courseId, units]) => {
          byCourseMap[courseId] = units;
        });

        setUnidades(allUnits);
        setCourseUnits(byCourseMap);
      } finally {
        if (mounted) setLoadingCategorias(false);
      }
    }

    carregarCategorias();

    return () => {
      mounted = false;
    };
  }, [cursos, listarUnidades, unidadesDoCurso]);

  const categorias = useMemo(() => {
    const base = [{ id: 'all' as const, name: 'Todas unidades' }];
    const ordenadas = [...unidades].sort((a, b) => a.name.localeCompare(b.name));
    return [...base, ...ordenadas.map((u) => ({ id: u.id, name: u.name }))];
  }, [unidades]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return cursos.filter((course) => {
      const matchSearch =
        term.length === 0 ||
        course.title.toLowerCase().includes(term) ||
        (course.description ?? '').toLowerCase().includes(term);

      const units = courseUnits[course.id] ?? [];
      const matchUnit = activeUnitId === 'all' || units.some((unit) => unit.id === activeUnitId);

      return matchSearch && matchUnit;
    });
  }, [activeUnitId, courseUnits, cursos, search]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent />

      <View style={[styles.catalogHeader, { paddingTop: insets.top + 12 }]}> 
        <View style={styles.catalogTitleRow}>
          <View style={styles.catalogIconWrap}>
            <Ionicons name="book-outline" size={16} color={AZUL} />
          </View>
          <Text style={styles.catalogTitle}>Nossos Cursos</Text>
        </View>

        <Text style={styles.catalogSubtitle}>Formacao gratuita para criancas e adolescentes</Text>

        <View style={styles.catalogSearchWrap}>
          <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.75)" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar curso..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            style={styles.catalogSearchInput}
          />
        </View>
      </View>

      <View style={styles.categoriesWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}>
          {categorias.map((categoria) => {
            const isActive = categoria.id === activeUnitId;
            return (
              <TouchableOpacity
                key={String(categoria.id)}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setActiveUnitId(categoria.id)}>
                <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                  {categoria.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.catalogListContent, { paddingBottom: insets.bottom + 88 }]}
        showsVerticalScrollIndicator={false}>
        {loadingCursos || loadingCategorias ? (
          <LoadingBox mensagem="Carregando cursos..." />
        ) : errorCursos ? (
          <ErrorBox mensagem={errorCursos} onRetry={recarregarCursos} />
        ) : filtered.length === 0 ? (
          <View style={styles.centeredBox}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Nenhum curso encontrado</Text>
            <Text style={styles.emptySubtext}>Tente outro termo ou outra unidade.</Text>
          </View>
        ) : (
          filtered.map((course) => {
            const units = courseUnits[course.id] ?? [];
            const firstUnit = units[0]?.name ?? 'Sem unidade';
            const unitColor = getUnitBadgeColor(firstUnit);

            return (
              <TouchableOpacity
                key={course.id}
                style={styles.catalogCard}
                activeOpacity={0.9}
                onPress={() => onOpenCourse(course)}>
                <View style={styles.catalogImageWrap}>
                  <Image
                    source={{ uri: getCourseImage(course) }}
                    style={styles.catalogImage}
                    resizeMode="cover"
                  />
                  <View style={styles.catalogImageOverlay} />
                  <View
                    style={[
                      styles.catalogTag,
                      { backgroundColor: unitColor.bg, borderColor: unitColor.bg },
                    ]}>
                    <Text style={[styles.catalogTagText, { color: unitColor.text }]}>{firstUnit}</Text>
                  </View>
                </View>

                <View style={styles.catalogCardBody}>
                  <Text style={styles.catalogCardTitle}>{course.title}</Text>
                  <Text style={styles.catalogCardDesc} numberOfLines={3}>
                    {course.description ?? 'Detalhes disponiveis na pagina do curso.'}
                  </Text>

                  <View style={styles.catalogMetaRow}>
                    <View style={styles.catalogMetaItem}>
                      <Ionicons name="time-outline" size={12} color="#9BACC8" />
                      <Text style={styles.catalogMetaText}>
                        {course.workload ? `${course.workload}h` : 'Carga horaria sob consulta'}
                      </Text>
                    </View>

                    <View style={styles.catalogMetaDot} />

                    <View style={styles.catalogMetaItem}>
                      <Ionicons name="business-outline" size={12} color="#9BACC8" />
                      <Text style={styles.catalogMetaText}>
                        {units.length} unidade{units.length === 1 ? '' : 's'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.catalogActionBtn}>
                    <Text style={styles.catalogActionBtnText}>Saiba mais</Text>
                    <Ionicons name="chevron-forward" size={16} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View style={[styles.bottomBarOuter, { paddingBottom: Math.max(insets.bottom, 8) }]}> 
        <View style={styles.bottomBar}>
          <TabButton icon="home" label="Início" onPress={() => router.push('/' as any)} />
          <TabButton
            icon="heart-outline"
            label="Doar"
            onPress={() => router.push('/doacao' as any)}
          />
          <TabButton icon="book-outline" label="Cursos" active onPress={() => router.push('/cursos' as any)} />
          <TabButton
            icon="information-circle-outline"
            label="Sobre"
            onPress={() => router.push('/explore' as any)}
          />
        </View>
      </View>
    </View>
  );
}

function HeaderFluxo({ title, onBack }: { title: string; onBack?: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerFluxo, { paddingTop: insets.top + 12 }]}> 
      {onBack ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.backButton} />
      )}
      <Text style={styles.headerFluxoTitle}>{title}</Text>
      <View style={styles.backButton} />
    </View>
  );
}

function TelaSelecionarUnidade({
  curso,
  onBack,
  onSelect,
}: {
  curso: Curso;
  onBack: () => void;
  onSelect: (unidade: Unidade) => void;
}) {
  const insets = useSafeAreaInsets();
  const { unidadesDoCurso } = useInscricoes();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [unidades, setUnidades] = useState<Unidade[]>([]);

  useEffect(() => {
    let mounted = true;

    async function carregar() {
      setLoading(true);
      setErro(null);
      try {
        const data = await unidadesDoCurso(curso.id);
        if (mounted) setUnidades(data);
      } catch {
        if (mounted) setErro('Nao foi possivel carregar as unidades deste curso.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    carregar();

    return () => {
      mounted = false;
    };
  }, [curso.id, unidadesDoCurso]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent />
      <HeaderFluxo title="Escolha a unidade" onBack={onBack} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.flowContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>Passo 1 de 3</Text>
        <Text style={styles.stepTitle}>{curso.title}</Text>
        <Text style={styles.stepSubtext}>Selecione a unidade onde deseja realizar a pre-inscricao.</Text>

        {loading ? (
          <LoadingBox mensagem="Carregando unidades..." />
        ) : erro ? (
          <ErrorBox mensagem={erro} />
        ) : unidades.length === 0 ? (
          <ErrorBox mensagem="Nenhuma unidade oferece este curso no momento." />
        ) : (
          unidades.map((unidade) => (
            <TouchableOpacity
              key={unidade.id}
              style={styles.optionCard}
              onPress={() => onSelect(unidade)}>
              <View style={styles.optionIconWrap}>
                <Ionicons name="business-outline" size={18} color={AZUL} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>{unidade.name}</Text>
                {(unidade.address || unidade.neighborhood) ? (
                  <Text style={styles.optionDesc}>
                    {[unidade.address, unidade.neighborhood].filter(Boolean).join(' · ')}
                  </Text>
                ) : null}
                {unidade.city ? <Text style={styles.optionMeta}>{unidade.city}</Text> : null}
                {unidade.phone ? <Text style={styles.optionMeta}>Tel: {unidade.phone}</Text> : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9BACC8" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function TelaSelecionarTurno({
  curso,
  unidade,
  onBack,
  onSelect,
}: {
  curso: Curso;
  unidade: Unidade;
  onBack: () => void;
  onSelect: (turno: Turno) => void;
}) {
  const insets = useSafeAreaInsets();
  const { turnosDoCursoNaUnidade } = useInscricoes();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);

  useEffect(() => {
    let mounted = true;

    async function carregar() {
      setLoading(true);
      setErro(null);
      try {
        const data = await turnosDoCursoNaUnidade(curso.id, unidade.id);
        if (mounted) setTurnos(data);
      } catch {
        if (mounted) setErro('Nao foi possivel carregar os turnos desta unidade.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    carregar();

    return () => {
      mounted = false;
    };
  }, [curso.id, unidade.id, turnosDoCursoNaUnidade]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent />
      <HeaderFluxo title="Escolha o turno" onBack={onBack} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.flowContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>Passo 2 de 3</Text>
        <Text style={styles.stepTitle}>{curso.title}</Text>
        <Text style={styles.stepSubtext}>Unidade: {unidade.name}</Text>

        {loading ? (
          <LoadingBox mensagem="Carregando turnos..." />
        ) : erro ? (
          <ErrorBox mensagem={erro} />
        ) : turnos.length === 0 ? (
          <ErrorBox mensagem="Nenhum turno disponivel para esta unidade." />
        ) : (
          turnos.map((turno) => (
            <TouchableOpacity key={turno.id} style={styles.optionCard} onPress={() => onSelect(turno)}>
              <View style={styles.optionIconWrap}>
                <Ionicons name="time-outline" size={18} color={AZUL} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>{shiftLabel[turno.shift]}</Text>
                <Text style={styles.optionDesc}>{formatTurnoHorario(turno)}</Text>
                {turno.days_of_week.length > 0 ? (
                  <Text style={styles.optionMeta}>{formatDias(turno.days_of_week)}</Text>
                ) : null}
                {turno.description ? <Text style={styles.optionMeta}>{turno.description}</Text> : null}
                <Text style={styles.optionVagas}>{turno.max_students} vagas</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9BACC8" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

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
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erroLocal, setErroLocal] = useState('');

  function handleConfirmar() {
    if (!nome.trim()) return setErroLocal('Informe o nome completo.');
    if (cpf.replace(/\D/g, '').length < 11) return setErroLocal('CPF invalido.');
    if (telefone.replace(/\D/g, '').length < 10) return setErroLocal('Telefone invalido.');
    if (senha.length > 0 && senha.length < 6) {
      return setErroLocal('A senha deve ter pelo menos 6 caracteres.');
    }
    if (senha !== confirmarSenha) return setErroLocal('As senhas nao coincidem.');

    setErroLocal('');
    onConfirmar(nome.trim(), cpf, telefone, senha);
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" translucent />
      <HeaderFluxo title="Dados pessoais" onBack={onBack} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.flowContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>Passo 3 de 3</Text>
        <Text style={styles.stepTitle}>Confirme seus dados</Text>
        <Text style={styles.stepSubtext}>Usaremos essas informacoes para concluir a pre-inscricao.</Text>

        <Text style={styles.inputLabel}>Nome completo *</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Maria da Silva"
          placeholderTextColor="#9BACC8"
          autoCapitalize="words"
        />

        <Text style={styles.inputLabel}>CPF *</Text>
        <TextInput
          style={styles.input}
          value={cpf}
          onChangeText={(v) => setCpf(formatCpf(v))}
          placeholder="000.000.000-00"
          placeholderTextColor="#9BACC8"
          keyboardType="numeric"
        />

        <Text style={styles.inputLabel}>Telefone / WhatsApp *</Text>
        <TextInput
          style={styles.input}
          value={telefone}
          onChangeText={(v) => setTelefone(formatTelefone(v))}
          placeholder="(81) 99999-9999"
          placeholderTextColor="#9BACC8"
          keyboardType="phone-pad"
        />

        <View style={styles.passwordSection}>
          <Text style={styles.passwordTitle}>Criar acesso (opcional)</Text>
          <Text style={styles.passwordSubtext}>
            Com uma senha, voce podera acompanhar suas inscricoes pelo app futuramente.
          </Text>
        </View>

        <Text style={styles.inputLabel}>Senha</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={senha}
            onChangeText={setSenha}
            placeholder="Minimo 6 caracteres"
            placeholderTextColor="#9BACC8"
            secureTextEntry={!mostrarSenha}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setMostrarSenha((old) => !old)}>
            <Ionicons name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'} size={18} color="#6B87B0" />
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Confirmar senha</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            placeholder="Repita a senha"
            placeholderTextColor="#9BACC8"
            secureTextEntry={!mostrarConfirmarSenha}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setMostrarConfirmarSenha((old) => !old)}>
            <Ionicons
              name={mostrarConfirmarSenha ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="#6B87B0"
            />
          </TouchableOpacity>
        </View>

        {erroLocal || erroEnvio ? <Text style={styles.inlineError}>{erroLocal || erroEnvio}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryButton, enviando && { opacity: 0.6 }]}
          onPress={handleConfirmar}
          disabled={enviando}>
          {enviando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Confirmar pre-inscricao</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function LinhaResumo({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.resumeRow}>
      <Text style={styles.resumeLabel}>{label}</Text>
      <Text style={styles.resumeValue}>{value}</Text>
    </View>
  );
}

function TelaProtocolo({
  inscricao,
  onVoltar,
}: {
  inscricao: Inscricao;
  onVoltar: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.protocolScreen}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 28,
          paddingBottom: insets.bottom + 28,
          paddingHorizontal: 24,
        }}>
        <View style={styles.protocolIconWrap}>
          <Ionicons name="checkmark" size={36} color="#fff" />
        </View>

        <Text style={styles.protocolTitle}>Pre-inscricao realizada!</Text>

        <View style={styles.protocolNumberBox}>
          <Text style={styles.protocolNumberLabel}>Numero do protocolo</Text>
          <Text style={styles.protocolNumber}>{inscricao.protocolo}</Text>
        </View>

        <View style={styles.protocolResumeBox}>
          <Text style={styles.protocolResumeTitle}>Resumo</Text>
          <LinhaResumo label="Curso" value={inscricao.curso.title} />
          <LinhaResumo label="Unidade" value={inscricao.unidade.name} />
          <LinhaResumo
            label="Turno"
            value={`${shiftLabel[inscricao.turno.shift]} · ${formatTurnoHorario(inscricao.turno)}`}
          />
          {inscricao.turno.days_of_week.length > 0 ? (
            <LinhaResumo label="Dias" value={formatDias(inscricao.turno.days_of_week)} />
          ) : null}
          <LinhaResumo label="Aluno" value={inscricao.nomeAluno} />
          <LinhaResumo label="CPF" value={inscricao.cpf} />
          <LinhaResumo label="Telefone" value={inscricao.telefone} />
        </View>

        <View style={styles.protocolInfoBox}>
          <Text style={styles.protocolInfoTitle}>Proximo passo</Text>
          <Text style={styles.protocolInfoText}>
            Compareca a {inscricao.unidade.name} com documento de identificacao, CPF e comprovante
            de residencia para confirmar sua matricula.
          </Text>
        </View>

        <TouchableOpacity style={styles.protocolButton} onPress={onVoltar}>
          <Text style={styles.protocolButtonText}>Voltar para cursos</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default function CursosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    inscrever?: string | string[];
    cursoId?: string | string[];
  }>();

  const inscreverParam = pickParam(params.inscrever);
  const cursoIdParam = pickParam(params.cursoId);

  const { cursos, loadingCursos, adicionarInscricao, enviando, erroEnvio, authToken, usuario } =
    useInscricoes();

  const [step, setStep] = useState<Step>('catalogo');
  const [cursoSel, setCursoSel] = useState<Curso | null>(null);
  const [unidadeSel, setUnidadeSel] = useState<Unidade | null>(null);
  const [turnoSel, setTurnoSel] = useState<Turno | null>(null);
  const [inscricaoFinal, setInscricaoFinal] = useState<Inscricao | null>(null);
  const invalidParamHandledRef = useRef(false);

  const resetFluxo = useCallback(() => {
    setCursoSel(null);
    setUnidadeSel(null);
    setTurnoSel(null);
    setInscricaoFinal(null);
  }, []);

  const voltarCatalogo = useCallback(() => {
    resetFluxo();
    setStep('catalogo');
    if (inscreverParam || cursoIdParam) {
      router.replace('/cursos' as any);
    }
  }, [cursoIdParam, inscreverParam, resetFluxo, router]);

  useEffect(() => {
    if (inscreverParam !== '1') {
      invalidParamHandledRef.current = false;
      return;
    }
    if (!cursoIdParam || loadingCursos) return;

    const id = Number(cursoIdParam);
    if (!Number.isFinite(id)) {
      if (!invalidParamHandledRef.current) {
        invalidParamHandledRef.current = true;
        Alert.alert('Curso invalido', 'Nao foi possivel identificar o curso selecionado.');
      }
      voltarCatalogo();
      return;
    }

    const curso = cursos.find((item) => item.id === id);
    if (!curso) {
      if (!invalidParamHandledRef.current) {
        invalidParamHandledRef.current = true;
        Alert.alert('Curso indisponivel', 'Este curso nao esta disponivel no momento.');
      }
      voltarCatalogo();
      return;
    }

    invalidParamHandledRef.current = false;
    setCursoSel(curso);
    setUnidadeSel(null);
    setTurnoSel(null);
    setInscricaoFinal(null);
    setStep('selecionarUnidade');
  }, [cursoIdParam, cursos, inscreverParam, loadingCursos, voltarCatalogo]);

  function abrirDetalheDoCurso(curso: Curso) {
    router.push({ pathname: '/curso/[id]', params: { id: String(curso.id) } } as any);
  }

  async function enviarInscricaoComDados(turno: Turno, nome: string, cpf: string, telefone: string, senha?: string) {
    if (!cursoSel || !unidadeSel) return;

    const nova = await adicionarInscricao({
      curso: cursoSel,
      unidade: unidadeSel,
      turno,
      nomeAluno: nome,
      cpf,
      telefone,
      senha,
    });

    setInscricaoFinal(nova);
    setStep('protocolo');
  }

  async function handleConfirmarDados(nome: string, cpf: string, telefone: string, senha: string) {
    if (!turnoSel) return;

    try {
      await enviarInscricaoComDados(turnoSel, nome, cpf, telefone, senha || undefined);
    } catch (e: unknown) {
      if (e instanceof ApiError && e.code === 'account_exists') {
        Alert.alert('Conta ja existente', `${e.message}\n\nFaca login para continuar.`, [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Fazer login', onPress: () => router.push('/login' as any) },
        ]);
      }
    }
  }

  async function handleTurnoSelecionado(turno: Turno) {
    setTurnoSel(turno);

    if (!cursoSel || !unidadeSel) return;

    if (authToken && usuario) {
      setStep('enviando');
      try {
        await enviarInscricaoComDados(
          turno,
          usuario.nome,
          usuario.cpf,
          usuario.telefone ?? '',
          undefined,
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Nao foi possivel concluir sua inscricao.';
        Alert.alert('Erro ao inscrever', msg);
        setStep('selecionarTurno');
      }
      return;
    }

    setStep('dados');
  }

  if (step === 'catalogo') {
    return <CatalogoCursos onOpenCourse={abrirDetalheDoCurso} />;
  }

  if (!cursoSel) {
    return <CatalogoCursos onOpenCourse={abrirDetalheDoCurso} />;
  }

  if (step === 'selecionarUnidade') {
    return (
      <TelaSelecionarUnidade
        curso={cursoSel}
        onBack={voltarCatalogo}
        onSelect={(unidade) => {
          setUnidadeSel(unidade);
          setStep('selecionarTurno');
        }}
      />
    );
  }

  if (!unidadeSel) {
    return (
      <TelaSelecionarUnidade
        curso={cursoSel}
        onBack={voltarCatalogo}
        onSelect={(unidade) => {
          setUnidadeSel(unidade);
          setStep('selecionarTurno');
        }}
      />
    );
  }

  if (step === 'selecionarTurno') {
    return (
      <TelaSelecionarTurno
        curso={cursoSel}
        unidade={unidadeSel}
        onBack={() => setStep('selecionarUnidade')}
        onSelect={handleTurnoSelecionado}
      />
    );
  }

  if (step === 'enviando') {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" translucent />
        <HeaderFluxo title="Enviando inscricao" onBack={undefined} />
        <LoadingBox mensagem="Concluindo sua pre-inscricao..." />
      </View>
    );
  }

  if (step === 'dados') {
    return (
      <TelaDados
        onBack={() => setStep('selecionarTurno')}
        onConfirmar={handleConfirmarDados}
        enviando={enviando}
        erroEnvio={erroEnvio}
      />
    );
  }

  if (step === 'protocolo' && inscricaoFinal) {
    return <TelaProtocolo inscricao={inscricaoFinal} onVoltar={voltarCatalogo} />;
  }

  if (loadingCursos) {
    return (
      <View style={styles.screen}>
        <LoadingBox mensagem="Carregando cursos..." />
      </View>
    );
  }

  return <CatalogoCursos onOpenCourse={abrirDetalheDoCurso} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },

  centeredBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    color: SUBTEXTO,
    fontSize: 13,
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: 34,
  },
  errorText: {
    color: SUBTEXTO,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
  },
  retryButton: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: AZUL,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    color: TEXTO,
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtext: {
    color: SUBTEXTO,
    fontSize: 12,
  },

  catalogHeader: {
    backgroundColor: AZUL,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  catalogTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  catalogIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AMARELO,
  },
  catalogTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  catalogSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  catalogSearchWrap: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catalogSearchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    paddingVertical: 0,
  },
  categoriesWrap: {
    marginTop: -10,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 2,
    gap: 6,
  },
  categoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E8EEF9',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryChipActive: {
    borderColor: AZUL,
    backgroundColor: AZUL,
  },
  categoryChipText: {
    color: '#6B87B0',
    fontSize: 11,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  catalogListContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 14,
  },
  catalogCard: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: AZUL,
    shadowOpacity: 0.11,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  catalogImageWrap: {
    height: 150,
    position: 'relative',
  },
  catalogImage: {
    width: '100%',
    height: '100%',
  },
  catalogImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 22, 44, 0.22)',
  },
  catalogTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  catalogTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  catalogCardBody: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  catalogCardTitle: {
    color: TEXTO,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  catalogCardDesc: {
    color: SUBTEXTO,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  catalogMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  catalogMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  catalogMetaText: {
    color: '#9BACC8',
    fontSize: 11,
  },
  catalogMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#DDE7FA',
  },
  catalogActionBtn: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: AZUL,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  catalogActionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  headerFluxo: {
    backgroundColor: AZUL,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  headerFluxoTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  flowContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  stepLabel: {
    color: '#8CA6CC',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  stepTitle: {
    color: TEXTO,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  stepSubtext: {
    color: SUBTEXTO,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  optionCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAF0FA',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    color: TEXTO,
    fontSize: 14,
    fontWeight: '700',
  },
  optionDesc: {
    color: SUBTEXTO,
    fontSize: 12,
    marginTop: 2,
  },
  optionMeta: {
    color: '#9BACC8',
    fontSize: 11,
    marginTop: 2,
  },
  optionVagas: {
    color: '#22C55E',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '700',
  },

  inputLabel: {
    color: '#6B87B0',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E8EEF9',
    borderRadius: 14,
    minHeight: 50,
    paddingHorizontal: 14,
    fontSize: 14,
    color: TEXTO,
    backgroundColor: '#fff',
  },
  passwordSection: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8EEF9',
  },
  passwordTitle: {
    color: TEXTO,
    fontSize: 14,
    fontWeight: '700',
  },
  passwordSubtext: {
    color: SUBTEXTO,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 18,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineError: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  primaryButton: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: AZUL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  bottomBarOuter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DBE3F3',
    paddingTop: 8,
    paddingHorizontal: 10,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 12,
  },
  tabLabel: {
    color: '#A0A8BB',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#1B67C8',
    fontWeight: '700',
  },

  protocolScreen: {
    flex: 1,
    backgroundColor: AZUL,
  },
  protocolIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  protocolTitle: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 20,
  },
  protocolNumberBox: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 16,
  },
  protocolNumberLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  protocolNumber: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  protocolResumeBox: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 14,
    gap: 8,
    marginBottom: 14,
  },
  protocolResumeTitle: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  resumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  resumeLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  resumeValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
  },
  protocolInfoBox: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,214,0,0.35)',
    backgroundColor: 'rgba(255,214,0,0.18)',
    marginBottom: 18,
  },
  protocolInfoTitle: {
    color: AMARELO,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 5,
  },
  protocolInfoText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    lineHeight: 19,
  },
  protocolButton: {
    borderRadius: 24,
    backgroundColor: '#00AAFF',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
