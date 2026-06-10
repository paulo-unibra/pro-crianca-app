import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000/api';

const AZUL = '#1565C0';
const AMARELO = '#FFD600';
const BG = '#F4F7FF';
const TEXTO = '#1A2D5A';
const SUBTEXTO = '#6B87B0';

const VOLUNTEER_IMAGE =
  'https://images.unsplash.com/photo-1709375635395-7774ae07995a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900';

const FALLBACK_IMPACTS = [
  { value: '1.200+', label: 'Crianças/ano', icon: '👧', color: '#1565C0' },
  { value: '8', label: 'Cursos grátis', icon: '📚', color: '#1976D2' },
  { value: 'R$120k', label: 'Doações no ano', icon: '💛', color: '#F59E0B' },
  { value: '15+', label: 'Anos de impacto', icon: '⭐', color: '#8B5CF6' },
  { value: '50+', label: 'Voluntários', icon: '🤝', color: '#10B981' },
  { value: '95%', label: 'Aprovação famílias', icon: '❤️', color: '#EF4444' },
];

const IMPACT_COLORS = ['#1565C0', '#1976D2', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444'];

function TestimonialCard({
  name,
  role,
  text,
  avatar,
}: {
  name: string;
  role: string;
  text: string;
  avatar: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 110;
  const displayText = expanded || !isLong ? text : `${text.slice(0, 110)}...`;

  return (
    <View style={styles.testimonialCard}>
      <View style={styles.testimonialTopRow}>
        <View style={styles.testimonialAvatarWrap}>
          <Text style={styles.testimonialAvatar}>{avatar}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.testimonialName}>{name}</Text>
          <Text style={styles.testimonialRole}>{role}</Text>
        </View>
      </View>

      <View style={styles.starsRow}>
        <Ionicons name="star" size={12} color={AMARELO} />
        <Ionicons name="star" size={12} color={AMARELO} />
        <Ionicons name="star" size={12} color={AMARELO} />
        <Ionicons name="star" size={12} color={AMARELO} />
        <Ionicons name="star" size={12} color={AMARELO} />
      </View>

      <Text style={styles.testimonialText}>`{displayText}`</Text>

      {isLong ? (
        <TouchableOpacity style={styles.moreButton} onPress={() => setExpanded((old) => !old)}>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={12} color={AZUL} />
          <Text style={styles.moreButtonText}>{expanded ? 'Ver menos' : 'Ver mais'}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [erroTestimonials, setErroTestimonials] = useState<string | null>(null);

  const [pillars, setPillars] = useState<any[]>([]);
  const [impacts, setImpacts] = useState<any[]>([]);
  const [journeys, setJourneys] = useState<any[]>([]);
  const [aboutUs, setAboutUs] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;

    async function carregar() {
      setLoadingTestimonials(true);
      setErroTestimonials(null);
      try {
        const [testRes, pillarsRes, impactsRes, journeysRes, aboutRes] = await Promise.all([
          fetch(`${API_BASE_URL}/testimonials`),
          fetch(`${API_BASE_URL}/pillars`),
          fetch(`${API_BASE_URL}/impacts`),
          fetch(`${API_BASE_URL}/journeys`),
          fetch(`${API_BASE_URL}/about-us`),
        ]);

        if (mounted) {
          if (testRes.ok) setTestimonials(await testRes.json());
          if (pillarsRes.ok) setPillars(await pillarsRes.json());
          if (impactsRes.ok) setImpacts(await impactsRes.json());
          if (journeysRes.ok) setJourneys(await journeysRes.json());
          if (aboutRes.ok) {
            const aboutData = await aboutRes.json();
            if (aboutData) setAboutUs(aboutData);
          }
        }
      } catch {
        if (mounted) setErroTestimonials('Nao foi possivel carregar os depoimentos.');
      } finally {
        if (mounted) setLoadingTestimonials(false);
      }
    }

    carregar();
    return () => { mounted = false; };
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(98, insets.bottom + 90) }}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}> 
          <View style={styles.headerCircle} pointerEvents="none" />

          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerIconWrap}>
              <Ionicons name="heart" size={16} color={AZUL} />
            </View>
          </View>

          <Text style={styles.headerTitle}>Quem Somos</Text>
          <Text style={styles.headerSubtitle}>Conheça nossa história e impacto social</Text>
        </View>

        <View style={styles.pageBody}>
          <View style={styles.aboutCard}>
            <View style={styles.aboutImageWrap}>
              <Image source={{ uri: VOLUNTEER_IMAGE }} style={styles.aboutImage} resizeMode="cover" />
              <View style={styles.aboutImageOverlay} />
              <View style={styles.sinceBadge}>
                <Text style={styles.sinceBadgeText}>Desde 2009</Text>
              </View>
            </View>

            <View style={styles.aboutContent}>
              <Text style={styles.aboutTitle}>Movimento Pró Criança</Text>
              <Text style={styles.aboutText}>
                {aboutUs?.content || 'Somos um movimento social sem fins lucrativos fundado em 2009, com o objetivo de garantir acesso à educação, cultura e desenvolvimento integral para crianças e adolescentes em situação de vulnerabilidade social. Acreditamos que toda criança merece uma infância digna, cheia de oportunidades e repleta de sorrisos.'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Nossos Pilares</Text>
          <View style={styles.pillarsList}>
            {(pillars.length > 0 ? pillars : [
              { icon: '🎯', title: 'Missão', text: 'Transformar vidas por meio da educação, cultura e esporte.', background: '#EEF4FF', border: '#1565C0' },
              { icon: '🌟', title: 'Visão', text: 'Ser referência nacional em proteção e desenvolvimento infantil.', background: '#FFFBEB', border: '#F59E0B' },
              { icon: '💛', title: 'Valores', text: 'Transparência, amor, respeito, inclusão e compromisso.', background: '#ECFDF5', border: '#10B981' },
            ]).map((item) => (
              <View
                key={item.title}
                style={[
                  styles.pillarCard,
                  { backgroundColor: item.background, borderLeftColor: item.border },
                ]}>
                <Text style={styles.pillarIcon}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pillarTitle}>{item.title}</Text>
                  <Text style={styles.pillarText}>{item.text}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.sectionTitleRow}>
            <Ionicons name="trophy-outline" size={16} color={AMARELO} />
            <Text style={styles.sectionTitleNoMargin}>Nosso Impacto</Text>
          </View>
          <View style={styles.impactGrid}>
            {(impacts.length > 0 ? impacts : FALLBACK_IMPACTS).map((item: any, idx: number) => (
              <View key={item.label || idx} style={styles.impactCard}>
                <Text style={styles.impactIcon}>{item.icon}</Text>
                <Text style={[styles.impactValue, { color: item.color || IMPACT_COLORS[idx % IMPACT_COLORS.length] }]}>{item.metric || item.value}</Text>
                <Text style={styles.impactLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Nossa Jornada</Text>
          <View style={styles.timelineWrap}>
            <View style={styles.timelineLine} />
            {(journeys.length > 0 ? journeys : [
              { year: '2009', title: 'Fundação', description: 'Fundação do movimento por um grupo de educadores.' },
              { year: '2012', title: 'Expansão Inicial', description: 'Primeiro centro de atividades inaugurado no Recife.' },
              { year: '2016', title: 'Crescimento', description: 'Expansão para novas unidades e mais cursos gratuitos.' },
              { year: '2020', title: 'Inovação', description: 'Lançamento de ações online durante a pandemia.' },
              { year: '2024', title: 'Consolidação', description: 'Mais de 1.200 crianças atendidas por ano.' },
            ]).map((item: any, index, arr) => {
              const isLast = index === arr.length - 1;
              return (
                <View key={item.id || item.year} style={styles.timelineItem}>
                  <View style={[styles.timelineDot, isLast && styles.timelineDotLast]}>
                    <Text style={[styles.timelineDotText, isLast && styles.timelineDotTextLast]}>
                      {item.year.slice(2)}
                    </Text>
                  </View>

                  <View style={{ flex: 1, paddingBottom: 2 }}>
                    <Text style={styles.timelineYear}>{item.year}</Text>
                    <Text style={styles.timelineEvent}>{item.title ? `${item.title}: ${item.description}` : item.event}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.sectionTitleRow}>
            <Ionicons name="star" size={16} color={AMARELO} />
            <Text style={styles.sectionTitleNoMargin}>Depoimentos</Text>
          </View>
        </View>

        {loadingTestimonials ? (
          <View style={styles.testimonialsLoader}>
            <ActivityIndicator size="small" color={AZUL} />
            <Text style={styles.testimonialsLoaderText}>Carregando depoimentos...</Text>
          </View>
        ) : erroTestimonials ? (
          <Text style={styles.testimonialsError}>{erroTestimonials}</Text>
        ) : testimonials.length === 0 ? (
          <Text style={styles.testimonialsError}>Nenhum depoimento no momento.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsScroll}>
            {testimonials.map((item) => (
              <TestimonialCard
                key={item.id}
                name={item.name}
                role={item.role}
                text={item.text}
                avatar={item.avatar}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.pageBody}>
          <View style={styles.ctaCard}>
            <View style={styles.ctaCircleTop} pointerEvents="none" />
            <View style={styles.ctaCircleBottom} pointerEvents="none" />

            <Text style={styles.ctaEmoji}>💛</Text>
            <Text style={styles.ctaTitle}>Seja parte dessa história!</Text>
            <Text style={styles.ctaText}>
              Sua doação transforma vidas e garante que mais crianças tenham acesso a um futuro
              melhor.
            </Text>

            <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/doacao' as any)}>
              <Text style={styles.ctaButtonText}>Quero doar agora</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Fale Conosco</Text>

            {[
              { icon: 'mail-outline', text: 'contato@movimentoprocrianca.org.br' },
              { icon: 'call-outline', text: '(11) 9 9999-0000' },
              { icon: 'location-outline', text: 'Rua das Flores, 123 - São Paulo/SP' },
              { icon: 'globe-outline', text: 'www.movimentoprocrianca.org.br' },
            ].map((item) => (
              <TouchableOpacity
                key={item.text}
                style={styles.contactRow}
                onPress={() => {
                  if (item.icon === 'mail-outline') {
                    Linking.openURL(`mailto:${item.text}`);
                  } else if (item.icon === 'call-outline') {
                    Linking.openURL('tel:+5511999990000');
                  } else if (item.icon === 'globe-outline') {
                    Linking.openURL('https://www.movimentoprocrianca.org.br');
                  }
                }}>
                <Ionicons name={item.icon as any} size={14} color={AZUL} />
                <Text style={styles.contactText}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBarOuter, { paddingBottom: Math.max(insets.bottom, 8) }]}> 
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.tabButton} onPress={() => router.push('/' as any)}>
            <Ionicons name="home-outline" size={23} color="#A0A8BB" />
            <Text style={styles.tabLabel}>Início</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabButton} onPress={() => router.push('/doacao' as any)}>
            <Ionicons name="heart-outline" size={23} color="#A0A8BB" />
            <Text style={styles.tabLabel}>Doar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabButton} onPress={() => router.push('/cursos' as any)}>
            <Ionicons name="book-outline" size={23} color="#A0A8BB" />
            <Text style={styles.tabLabel}>Cursos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabButton} onPress={() => router.push('/explore' as any)}>
            <Ionicons name="information-circle" size={23} color={AZUL} />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Sobre</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    backgroundColor: AZUL,
    paddingHorizontal: 18,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    right: -34,
    top: -30,
    backgroundColor: 'rgba(255,214,0,0.14)',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AMARELO,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
  },

  pageBody: {
    paddingHorizontal: 16,
  },

  aboutCard: {
    marginTop: -14,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: AZUL,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  aboutImageWrap: {
    height: 180,
    position: 'relative',
  },
  aboutImage: {
    width: '100%',
    height: '100%',
  },
  aboutImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21,101,192,0.48)',
  },
  sinceBadge: {
    position: 'absolute',
    left: 14,
    bottom: 12,
    borderRadius: 999,
    backgroundColor: AMARELO,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sinceBadgeText: {
    color: AZUL,
    fontSize: 11,
    fontWeight: '800',
  },
  aboutContent: {
    padding: 16,
  },
  aboutTitle: {
    color: TEXTO,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  aboutText: {
    color: SUBTEXTO,
    fontSize: 13,
    lineHeight: 20,
  },

  sectionTitle: {
    marginTop: 18,
    marginBottom: 10,
    color: AZUL,
    fontSize: 17,
    fontWeight: '800',
  },
  sectionTitleNoMargin: {
    color: AZUL,
    fontSize: 17,
    fontWeight: '800',
  },
  sectionTitleRow: {
    marginTop: 18,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  pillarsList: {
    gap: 8,
  },
  pillarCard: {
    borderRadius: 14,
    borderLeftWidth: 3,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  pillarIcon: {
    fontSize: 21,
    marginTop: 1,
  },
  pillarTitle: {
    color: TEXTO,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  pillarText: {
    color: SUBTEXTO,
    fontSize: 12,
    lineHeight: 17,
  },

  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  impactCard: {
    width: '31%',
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AZUL,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  impactIcon: {
    fontSize: 20,
    marginBottom: 3,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  impactLabel: {
    color: '#9BACC8',
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 12,
  },

  timelineWrap: {
    position: 'relative',
    paddingLeft: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: 16,
    top: 2,
    bottom: 2,
    width: 2,
    backgroundColor: '#E8EEF9',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  timelineDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: AZUL,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineDotLast: {
    backgroundColor: AMARELO,
  },
  timelineDotText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  timelineDotTextLast: {
    color: AZUL,
  },
  timelineYear: {
    color: AZUL,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 1,
  },
  timelineEvent: {
    color: SUBTEXTO,
    fontSize: 12,
    lineHeight: 17,
  },

  testimonialsLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  testimonialsLoaderText: {
    color: SUBTEXTO,
    fontSize: 12,
  },
  testimonialsError: {
    color: '#8CA6CC',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  testimonialsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 2,
    gap: 10,
  },
  testimonialCard: {
    width: 260,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 14,
    shadowColor: AZUL,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  testimonialTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  testimonialAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialAvatar: {
    fontSize: 22,
  },
  testimonialName: {
    color: TEXTO,
    fontSize: 12,
    fontWeight: '700',
  },
  testimonialRole: {
    color: '#9BACC8',
    fontSize: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
    marginBottom: 6,
  },
  testimonialText: {
    color: SUBTEXTO,
    fontSize: 12,
    lineHeight: 18,
  },
  moreButton: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  moreButtonText: {
    color: AZUL,
    fontSize: 11,
    fontWeight: '700',
  },

  ctaCard: {
    marginTop: 18,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: AZUL,
    alignItems: 'center',
    overflow: 'hidden',
  },
  ctaCircleTop: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,214,0,0.16)',
  },
  ctaCircleBottom: {
    position: 'absolute',
    left: -14,
    bottom: -16,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  ctaEmoji: {
    fontSize: 30,
    marginBottom: 4,
  },
  ctaTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  ctaText: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 14,
  },
  ctaButton: {
    borderRadius: 14,
    backgroundColor: AMARELO,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaButtonText: {
    color: AZUL,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  contactCard: {
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 14,
    shadowColor: AZUL,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  contactTitle: {
    color: TEXTO,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contactText: {
    color: SUBTEXTO,
    fontSize: 12,
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
    color: AZUL,
    fontWeight: '700',
  },
});
