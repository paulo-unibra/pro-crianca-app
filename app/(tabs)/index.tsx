import React, { useMemo } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInscricoes } from '@/contexts/InscricoesContext';

type CourseItem = {
  id: string;
  title: string;
  subtitle: string;
  imageSource: ImageSourcePropType;
};

const COURSE_IMAGE_MAP: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1759143103113-6696d40598bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  2: 'https://images.unsplash.com/photo-1703301287688-c9a306ebed99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  3: 'https://images.unsplash.com/photo-1762475833776-fd57865db4d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  4: 'https://images.unsplash.com/photo-1758874961449-37e171a41223?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  5: 'https://images.unsplash.com/photo-1767902012345-bd31f0ba76d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
};

const FALLBACK_COURSE_ITEMS: CourseItem[] = [
  {
    id: '1',
    title: 'Música e Arte',
    subtitle: 'Desperte talentos',
    imageSource: require('@/assets/images/hero-crianca.jpg'),
  },
  {
    id: '2',
    title: 'Reforço Escolar',
    subtitle: 'Aprender com apoio',
    imageSource: require('@/assets/images/hero-crianca.jpg'),
  },
  {
    id: '3',
    title: 'Tecnologia',
    subtitle: 'Inclusão digital',
    imageSource: require('@/assets/images/hero-crianca.jpg'),
  },
];

function getCourseImage(courseId: number) {
  return COURSE_IMAGE_MAP[courseId] ?? COURSE_IMAGE_MAP[1];
}

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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cursos, authToken, usuario, logout } = useInscricoes();
  const autenticado = Boolean(authToken);
  const primeiroNome = usuario?.nome?.split(' ')[0] ?? '';

  const featuredCourses = useMemo(() => {
    if (cursos.length === 0) {
      return FALLBACK_COURSE_ITEMS;
    }

    return cursos.slice(0, 3).map((course) => ({
      id: String(course.id),
      title: course.title,
      subtitle: course.workload ? `${course.workload}h de atividades` : 'Formação gratuita',
      imageSource: { uri: getCourseImage(course.id) } as ImageSourcePropType,
    }));
  }, [cursos]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(98, insets.bottom + 88) }}>
        <View style={[styles.topSection, { paddingTop: insets.top + 10 }]}> 
          <View style={styles.topCircleLarge} pointerEvents="none" />
          <View style={styles.topCircleSmall} pointerEvents="none" />

          <View style={styles.topHeaderRow}>
            <Image
              source={require('@/assets/images/logo-branca.png')}
              resizeMode="contain"
              style={styles.headerLogo}
            />
            {autenticado ? (
              <TouchableOpacity
                style={styles.notificationButton}
                activeOpacity={0.8}
                onPress={() => {
                  Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Sair',
                      style: 'destructive',
                      onPress: () => logout(),
                    },
                  ]);
                }}>
                <Ionicons name="log-out-outline" size={18} color="#E5F3FF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.notificationButton}
                activeOpacity={0.8}
                onPress={() => router.push('/login' as any)}>
                <Ionicons name="log-in-outline" size={18} color="#E5F3FF" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.welcomeText}>
            {autenticado ? `Bem-vindo, ${primeiroNome}! 👋` : 'Bem-vindo(a)! 👋'}
          </Text>
          <Text style={styles.heroHeadline}>Cada doação transforma{'\n'}uma vida! 💛</Text>

          <ImageBackground
            source={require('@/assets/images/hero-crianca.jpg')}
            resizeMode="cover"
            style={styles.heroCard}
            imageStyle={styles.heroCardImage}>
            <View style={styles.heroCardShade} />
            <View style={styles.heroCardContent}>
              <Text style={styles.heroCardCaption}>Juntos pelo futuro das crianças</Text>
              <TouchableOpacity
                style={styles.heroDonateButton}
                activeOpacity={0.85}
                onPress={() => router.push('/doacao' as any)}>
                <Ionicons name="heart" size={16} color="#1B67C8" />
                <Text style={styles.heroDonateText}>Doar agora</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.pageBody}>
          <TouchableOpacity
            style={styles.ctaBanner}
            activeOpacity={0.9}
            onPress={() => router.push('/doacao' as any)}>
            <View style={styles.ctaCircle} pointerEvents="none" />
            <View style={styles.ctaTextWrap}>
              <Text style={styles.ctaTitle}>Faça a diferença{'\n'}hoje mesmo!</Text>
              <Text style={styles.ctaSubtext}>Sua doação chega direto{'\n'}para as crianças</Text>
            </View>
            <View style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Doe já</Text>
              <Ionicons name="arrow-forward" size={15} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.coursesHeader}>
            <View style={styles.coursesTitleWrap}>
              <Ionicons name="book-outline" size={18} color="#1B67C8" />
              <Text style={styles.coursesTitle}>Atividades em Destaque</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/cursos' as any)}>
              <Text style={styles.viewAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.coursesList}>
            {featuredCourses.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.courseCard}
                activeOpacity={0.88}
                onPress={() =>
                  router.push({
                    pathname: '/curso/[id]',
                    params: { id: item.id },
                  } as any)
                }>
                <Image source={item.imageSource} style={styles.courseImage} resizeMode="cover" />
                <View style={styles.courseOverlay} />
                <View style={styles.courseTextWrap}>
                  <Text style={styles.courseTitle}>{item.title}</Text>
                  <Text style={styles.courseSubtitle}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={[styles.bottomBarOuter, { paddingBottom: Math.max(insets.bottom, 8) }]}> 
        <View style={styles.bottomBar}>
          <TabButton icon="home" label="Início" active onPress={() => router.push('/' as any)} />
          <TabButton
            icon="heart-outline"
            label="Doar"
            onPress={() => router.push('/doacao' as any)}
          />
          <TabButton icon="book-outline" label="Cursos" onPress={() => router.push('/cursos' as any)} />
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EEF2F8',
  },

  topSection: {
    backgroundColor: '#1B67C8',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 18,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  topCircleLarge: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(111, 196, 255, 0.14)',
    right: -46,
    top: -26,
  },
  topCircleSmall: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 219, 92, 0.16)',
    right: 16,
    top: 18,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLogo: {
    width: 126,
    height: 44,
    marginLeft: -40,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  welcomeText: {
    fontSize: 13,
    color: '#E7F3FF',
    marginBottom: 6,
  },
  heroHeadline: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 27,
    marginBottom: 18,
  },
  heroCard: {
    width: '100%',
    height: 206,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroCardImage: {
    borderRadius: 24,
  },
  heroCardShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22, 79, 149, 0.35)',
  },
  heroCardContent: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    zIndex: 2,
  },
  heroCardCaption: {
    color: '#EAF5FF',
    fontSize: 12,
    marginBottom: 12,
  },
  heroDonateButton: {
    backgroundColor: '#FFD500',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  heroDonateText: {
    color: '#1B67C8',
    fontSize: 14,
    fontWeight: '800',
  },

  pageBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  ctaBanner: {
    backgroundColor: '#FFD500',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    marginBottom: 18,
  },
  ctaCircle: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(27, 103, 200, 0.14)',
    right: -28,
    top: -12,
  },
  ctaTextWrap: {
    zIndex: 1,
  },
  ctaTitle: {
    color: '#1B67C8',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 19,
    marginBottom: 4,
  },
  ctaSubtext: {
    color: '#1B67C8',
    fontSize: 12,
    lineHeight: 16,
  },
  ctaButton: {
    backgroundColor: '#1B67C8',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    zIndex: 1,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  coursesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  coursesTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coursesTitle: {
    color: '#1A5CB0',
    fontSize: 15,
    fontWeight: '800',
  },
  viewAllText: {
    color: '#1A5CB0',
    fontSize: 12,
    fontWeight: '700',
  },
  coursesList: {
    gap: 12,
    paddingBottom: 8,
  },
  courseCard: {
    width: 162,
    height: 110,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: '#D4DCEC',
  },
  courseImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  courseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 39, 75, 0.22)',
  },
  courseTextWrap: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  courseTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  courseSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    marginTop: 2,
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
});
