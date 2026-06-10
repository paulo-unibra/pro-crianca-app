import React, { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  formatDias,
  formatTurnoHorario,
  shiftLabel,
  type Curso,
  type Turno,
  type Unidade,
  useInscricoes,
} from '@/contexts/InscricoesContext';

const AZUL = '#1565C0';
const AMARELO = '#FFD600';
const BG = '#F4F7FF';
const TEXTO = '#1A2D5A';
const SUBTEXTO = '#6B87B0';

const COURSE_IMAGE_MAP: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1759143103113-6696d40598bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  2: 'https://images.unsplash.com/photo-1703301287688-c9a306ebed99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  3: 'https://images.unsplash.com/photo-1762475833776-fd57865db4d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  4: 'https://images.unsplash.com/photo-1758874961449-37e171a41223?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  5: 'https://images.unsplash.com/photo-1767902012345-bd31f0ba76d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
};

const TAG_COLORS = [
  { bg: '#EFF6FF', text: '#3B82F6' },
  { bg: '#FDF2F8', text: '#EC4899' },
  { bg: '#ECFDF5', text: '#10B981' },
  { bg: '#F5F3FF', text: '#8B5CF6' },
  { bg: '#FFFBEB', text: '#F59E0B' },
];

function pickParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getCourseImage(courseId: number) {
  return COURSE_IMAGE_MAP[courseId] ?? COURSE_IMAGE_MAP[1];
}

function getTagColor(label?: string) {
  if (!label) return TAG_COLORS[0];
  const hash = label
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return TAG_COLORS[hash % TAG_COLORS.length];
}

function HeroTop({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.heroActions, { paddingTop: insets.top + 10 }]}> 
      <TouchableOpacity
        style={styles.circleButton}
        onPress={onBack}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Ionicons name="chevron-back" size={22} color={AZUL} />
      </TouchableOpacity>
    </View>
  );
}

function MetaCard({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.metaCard}>
      <Ionicons name={icon} size={16} color={AZUL} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function EmptyDetail({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptyStateSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export default function CursoDetalheScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const idParam = pickParam(params.id);

  const { cursos, loadingCursos, errorCursos, unidadesDoCurso, turnosDoCursoNaUnidade, inscricoes } = useInscricoes();

  const courseId = Number(idParam);
  const curso = cursos.find((item) => item.id === courseId);

  const [loadingMeta, setLoadingMeta] = useState(false);
  const [erroMeta, setErroMeta] = useState<string | null>(null);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [turnosPorUnidade, setTurnosPorUnidade] = useState<Record<number, Turno[]>>({});

  useEffect(() => {
    let mounted = true;

    async function carregarMeta(cursoAlvo: Curso) {
      setLoadingMeta(true);
      setErroMeta(null);

      try {
        const units = await unidadesDoCurso(cursoAlvo.id);
        if (!mounted) return;

        setUnidades(units);

        const byUnit = await Promise.all(
          units.map(async (unidade) => {
            try {
              const turnos = await turnosDoCursoNaUnidade(cursoAlvo.id, unidade.id);
              return [unidade.id, turnos] as [number, Turno[]];
            } catch {
              return [unidade.id, []] as [number, Turno[]];
            }
          }),
        );

        if (!mounted) return;

        const map: Record<number, Turno[]> = {};
        byUnit.forEach(([unitId, turnos]) => {
          map[unitId] = turnos;
        });
        setTurnosPorUnidade(map);
      } catch {
        if (mounted) {
          setUnidades([]);
          setTurnosPorUnidade({});
          setErroMeta('Nao foi possivel carregar os detalhes deste curso.');
        }
      } finally {
        if (mounted) setLoadingMeta(false);
      }
    }

    if (curso) {
      carregarMeta(curso);
    }

    return () => {
      mounted = false;
    };
  }, [curso, turnosDoCursoNaUnidade, unidadesDoCurso]);

  const totalTurnos = useMemo(() => {
    let total = 0;
    Object.values(turnosPorUnidade).forEach((turnos) => {
      total += turnos.length;
    });
    return total;
  }, [turnosPorUnidade]);

  const totalVagas = useMemo(() => {
    let total = 0;
    Object.values(turnosPorUnidade).forEach((turnos) => {
      turnos.forEach((turno) => {
        total += turno.max_students;
      });
    });
    return total;
  }, [turnosPorUnidade]);

  const primeiroTurno = useMemo(() => {
    for (let i = 0; i < unidades.length; i += 1) {
      const unit = unidades[i];
      const turnos = turnosPorUnidade[unit.id] ?? [];
      if (turnos.length > 0) return turnos[0];
    }
    return null;
  }, [turnosPorUnidade, unidades]);

  const primeiraUnidade = unidades[0];
  const tagLabel = primeiraUnidade?.name ?? 'Curso';
  const tagColor = getTagColor(tagLabel);

  const hasDisponibilidade = totalTurnos > 0;

  const inscricaoAtiva = inscricoes.find(
    (i) => i.curso.id === courseId && (i.status === 'pendente' || i.status === 'confirmada')
  );
  const jaInscrito = Boolean(inscricaoAtiva);

  if (!idParam || Number.isNaN(courseId)) {
    return (
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <EmptyDetail
          title="Curso invalido"
          subtitle="Nao foi possivel identificar qual curso voce quer abrir."
        />
        <View style={styles.footerSimple}>
          <TouchableOpacity style={styles.outlineButton} onPress={() => router.replace('/cursos' as any)}>
            <Text style={styles.outlineButtonText}>Voltar para cursos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loadingCursos && !curso) {
    return (
      <View style={styles.screenCentered}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={AZUL} />
        <Text style={styles.loadingText}>Carregando curso...</Text>
      </View>
    );
  }

  if (!curso) {
    return (
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <EmptyDetail title="Curso nao encontrado" subtitle={errorCursos ?? undefined} />
        <View style={styles.footerSimple}>
          <TouchableOpacity style={styles.outlineButton} onPress={() => router.replace('/cursos' as any)}>
            <Text style={styles.outlineButtonText}>Voltar para cursos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.heroWrap}>
          <Image source={{ uri: getCourseImage(curso.id) }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlayTop} />
          <View style={styles.heroOverlayBottom} />

          <HeroTop onBack={() => router.back()} />

          <View style={styles.heroBottom}>
            <View style={[styles.heroTag, { backgroundColor: tagColor.bg }]}> 
              <Text style={[styles.heroTagText, { color: tagColor.text }]}>{tagLabel}</Text>
            </View>

            <View style={[styles.heroAvailability, hasDisponibilidade ? styles.heroAvailabilityOn : styles.heroAvailabilityOff]}>
              <Text style={styles.heroAvailabilityText}>
                {hasDisponibilidade ? 'Vagas disponiveis' : 'Sem turmas no momento'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.contentWrap}>
          <Text style={styles.title}>{curso.title}</Text>
          <Text style={styles.subtitle}>Conheca mais sobre este curso e garanta sua pre-inscricao.</Text>

          <View style={styles.metaGrid}>
            <MetaCard
              icon="time-outline"
              label="Carga horaria"
              value={curso.workload ? `${curso.workload}h` : 'Sob consulta'}
            />
            <MetaCard
              icon="business-outline"
              label="Unidades"
              value={`${unidades.length || 0}`}
            />
            <MetaCard
              icon="people-outline"
              label="Vagas totais"
              value={totalVagas > 0 ? String(totalVagas) : '--'}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre o curso</Text>
            <Text style={styles.sectionText}>
              {curso.description ?? 'Descricao em atualizacao. Consulte nossa equipe para mais detalhes.'}
            </Text>
          </View>

          <View style={[styles.section, styles.infoPanel]}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={AZUL} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Horario</Text>
                <Text style={styles.infoValue}>
                  {primeiroTurno
                    ? `${shiftLabel[primeiroTurno.shift]} · ${formatTurnoHorario(primeiroTurno)}`
                    : 'Disponivel apos escolha da unidade'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="map-outline" size={18} color={AZUL} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Local</Text>
                <Text style={styles.infoValue}>
                  {primeiraUnidade
                    ? [primeiraUnidade.address, primeiraUnidade.neighborhood, primeiraUnidade.city]
                        .filter(Boolean)
                        .join(' · ') || primeiraUnidade.name
                    : 'Sem unidades cadastradas'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Unidades atendidas</Text>
            {loadingMeta ? (
              <View style={styles.inlineLoader}>
                <ActivityIndicator size="small" color={AZUL} />
                <Text style={styles.inlineLoaderText}>Carregando unidades...</Text>
              </View>
            ) : erroMeta ? (
              <Text style={styles.sectionMuted}>{erroMeta}</Text>
            ) : unidades.length === 0 ? (
              <Text style={styles.sectionMuted}>Nenhuma unidade disponivel para este curso.</Text>
            ) : (
              unidades.map((unidade) => (
                <View key={unidade.id} style={styles.unitCard}>
                  <Text style={styles.unitName}>{unidade.name}</Text>
                  <Text style={styles.unitAddress}>
                    {[unidade.address, unidade.neighborhood, unidade.city].filter(Boolean).join(' · ') ||
                      'Endereco em atualizacao'}
                  </Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Turnos disponiveis</Text>
            {loadingMeta ? (
              <View style={styles.inlineLoader}>
                <ActivityIndicator size="small" color={AZUL} />
                <Text style={styles.inlineLoaderText}>Carregando turnos...</Text>
              </View>
            ) : hasDisponibilidade ? (
              unidades.map((unidade) => {
                const turnos = turnosPorUnidade[unidade.id] ?? [];
                if (turnos.length === 0) return null;

                return (
                  <View key={unidade.id} style={styles.shiftBlock}>
                    <Text style={styles.shiftUnit}>{unidade.name}</Text>
                    <View style={styles.shiftChipsWrap}>
                      {turnos.map((turno) => (
                        <View key={turno.id} style={styles.shiftChip}>
                          <Text style={styles.shiftChipText}>
                            {shiftLabel[turno.shift]} · {formatTurnoHorario(turno)}
                          </Text>
                          {turno.days_of_week.length > 0 ? (
                            <Text style={styles.shiftChipDays}>{formatDias(turno.days_of_week)}</Text>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.sectionMuted}>Ainda nao ha turnos ativos para este curso.</Text>
            )}
          </View>

          {jaInscrito ? (
            <View style={styles.enrolledBanner}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={styles.enrolledBannerText}>
                Você já está inscrito neste curso
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.enrollButton, !hasDisponibilidade && styles.enrollButtonDisabled]}
              disabled={!hasDisponibilidade}
              onPress={() =>
                router.push({
                  pathname: '/cursos',
                  params: { inscrever: '1', cursoId: String(curso.id) },
                } as any)
              }>
              <Text
                style={[
                  styles.enrollButtonText,
                  !hasDisponibilidade && styles.enrollButtonTextDisabled,
                ]}>
                {hasDisponibilidade ? 'Quero me inscrever' : 'Sem turmas disponiveis'}
              </Text>
              {hasDisponibilidade ? <Ionicons name="sparkles" size={16} color={AZUL} /> : null}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  screenCentered: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: SUBTEXTO,
    fontSize: 13,
  },

  heroWrap: {
    height: 250,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlayTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21,101,192,0.40)',
  },
  heroOverlayBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  heroActions: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  heroTag: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroAvailability: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroAvailabilityOn: {
    backgroundColor: '#22C55E',
  },
  heroAvailabilityOff: {
    backgroundColor: '#F59E0B',
  },
  heroAvailabilityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  contentWrap: {
    marginTop: -12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: BG,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  title: {
    color: TEXTO,
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 31,
    marginBottom: 5,
  },
  subtitle: {
    color: SUBTEXTO,
    fontSize: 13,
    lineHeight: 18,
  },

  metaGrid: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 8,
  },
  metaCard: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAF0FA',
    minHeight: 86,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 6,
  },
  metaLabel: {
    color: '#8CA6CC',
    fontSize: 10,
  },
  metaValue: {
    color: TEXTO,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  section: {
    marginTop: 18,
  },
  sectionTitle: {
    color: TEXTO,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  sectionText: {
    color: SUBTEXTO,
    fontSize: 13,
    lineHeight: 20,
  },
  sectionMuted: {
    color: '#8CA6CC',
    fontSize: 12,
    lineHeight: 18,
  },

  infoPanel: {
    borderRadius: 16,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#DDE7FA',
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  infoLabel: {
    color: '#8CA6CC',
    fontSize: 11,
    marginBottom: 2,
  },
  infoValue: {
    color: TEXTO,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  inlineLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  inlineLoaderText: {
    color: SUBTEXTO,
    fontSize: 12,
  },

  unitCard: {
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAF0FA',
    padding: 12,
    marginBottom: 8,
  },
  unitName: {
    color: TEXTO,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  unitAddress: {
    color: SUBTEXTO,
    fontSize: 12,
    lineHeight: 17,
  },

  shiftBlock: {
    marginBottom: 10,
  },
  shiftUnit: {
    color: TEXTO,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  shiftChipsWrap: {
    gap: 6,
  },
  shiftChip: {
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAF0FA',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  shiftChipText: {
    color: TEXTO,
    fontSize: 12,
    fontWeight: '600',
  },
  shiftChipDays: {
    color: SUBTEXTO,
    fontSize: 11,
    marginTop: 2,
  },

  enrolledBanner: {
    marginTop: 14,
    borderRadius: 16,
    minHeight: 54,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#86EFAC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  enrolledBannerText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '700',
  },

  enrollButton: {
    marginTop: 14,
    borderRadius: 16,
    minHeight: 54,
    backgroundColor: AMARELO,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  enrollButtonDisabled: {
    backgroundColor: '#D1DAEA',
  },
  enrollButtonText: {
    color: AZUL,
    fontSize: 15,
    fontWeight: '800',
  },
  enrollButtonTextDisabled: {
    color: '#7E90AE',
  },

  emptyState: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyStateTitle: {
    color: TEXTO,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    color: SUBTEXTO,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  footerSimple: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  outlineButton: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: AZUL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: AZUL,
    fontSize: 13,
    fontWeight: '700',
  },
});
