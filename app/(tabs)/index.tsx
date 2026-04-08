import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  ImageBackground,
  Image,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MPC } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const HERO_HEIGHT = height * 0.62;

// ─── Dados ───────────────────────────────────────────────────────────────────

type ActivityItem = {
  icon: string;
  category: string;
  title: string;
  items: string[];
};

type DonationOption = {
  title: string;
  subtitle: string;
  minValue: string;
  description: string;
  url: string;
};

type Testimonial = {
  name: string;
  role: string;
  text: string;
  initials: string;
};

const ACTIVITIES: ActivityItem[] = [
  {
    icon: '🥋',
    category: 'Esportes',
    title: 'Esportes',
    items: ['Judô'],
  },
  {
    icon: '🎨',
    category: 'Cultura',
    title: 'Cultura',
    items: [
      'Artes Visuais',
      'Artesanato',
      'Coral',
      'Cordas',
      'Dança Clássica',
      'Dança Popular',
      'Flauta Doce',
      'Percussão',
    ],
  },
  {
    icon: '📚',
    category: 'Apoio',
    title: 'Componentes de Apoio',
    items: ['Letramento', 'Formação Religiosa', 'Ser e Conviver (Psicossocial)'],
  },
  {
    icon: '💻',
    category: 'Empregabilidade',
    title: 'Empregabilidade',
    items: [
      'Informática',
      'Robótica',
      'Programador Web',
      'Marketing e Vendas',
      'Produção Gráfica',
    ],
  },
];

const DONATION_OPTIONS: DonationOption[] = [
  {
    title: 'Conta de Energia',
    subtitle: 'CELPE / NEOENERGIA',
    minValue: 'A partir de R$ 2,00/mês',
    description: 'Comodidade e segurança para fazer sua doação',
    url: 'https://movimentoprocrianca.org.br/v2/doar-na-conta-de-energia/',
  },
  {
    title: 'Conta de Água',
    subtitle: 'COMPESA',
    minValue: 'A partir de R$ 2,00/mês',
    description: 'É prático, fácil e seguro doar através da sua conta',
    url: 'https://movimentoprocrianca.org.br/v2/doacao-pela-compesa/',
  },
  {
    title: 'Cartão, Boleto ou PIX',
    subtitle: 'QUALQUER BANCO',
    minValue: 'A partir de R$ 10,00/mês',
    description: 'Segurança em primeiro lugar. Doe via PIX, boleto ou cartão',
    url: 'https://movimentoprocrianca.org.br/v2/doar-com-cartao',
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Rubens Marinho',
    role: 'Ex-beneficiário do Coletivo Jovem',
    initials: 'RM',
    text: '"O MPC foi fundamental para o início da minha carreira. Hoje sou repórter da TV Guararapes. Sempre serei grato ao MPC pela oportunidade."',
  },
  {
    name: 'Ismael dos Santos Silva',
    role: 'Beneficiário de Percussão',
    initials: 'IS',
    text: '"A percussão me ajudou a socializar e ser responsável. Fui aprovado no Conservatório Pernambucano de Música graças ao MPC."',
  },
  {
    name: 'Saulo Cabral',
    role: 'Diretor-Presidente da Neoenergia PE',
    initials: 'SC',
    text: '"Contribuir com o Movimento Pró-Criança é motivo de orgulho. São iniciativas que nos fazem acreditar em um futuro melhor."',
  },
];

// ─── Elemento decorativo SVG-like (forma cyan) ────────────────────────────────

function DecorativeShape() {
  return (
    <View style={styles.decorShape} pointerEvents="none">
      {/* Arco externo */}
      <View style={styles.decorArc} />
      {/* Linha interna */}
      <View style={styles.decorLine} />
    </View>
  );
}

// ─── Componentes ─────────────────────────────────────────────────────────────

function ActivityCard({ activity }: { activity: ActivityItem }) {
  return (
    <View style={styles.activityCard}>
      <View style={styles.activityCardHeader}>
        <Text style={styles.activityIcon}>{activity.icon}</Text>
        <Text style={styles.activityCategory}>{activity.category}</Text>
      </View>
      <Text style={styles.activityTitle}>{activity.title}</Text>
      <View style={styles.activityItems}>
        {activity.items.slice(0, 5).map((item, i) => (
          <View key={i} style={styles.activityItem}>
            <View style={styles.activityDot} />
            <Text style={styles.activityItemText}>{item}</Text>
          </View>
        ))}
        {activity.items.length > 5 && (
          <Text style={styles.activityMore}>+{activity.items.length - 5} mais...</Text>
        )}
      </View>
    </View>
  );
}

function DonationCard({ option }: { option: DonationOption }) {
  return (
    <View style={styles.donationCard}>
      <View style={styles.donationCardTop}>
        <Text style={styles.donationTitle}>{option.title}</Text>
        <Text style={styles.donationSubtitle}>{option.subtitle}</Text>
      </View>
      <View style={styles.donationCardBody}>
        <Text style={styles.donationValue}>{option.minValue}</Text>
        <Text style={styles.donationDescription}>{option.description}</Text>
        <TouchableOpacity
          style={styles.donationButton}
          onPress={() => Linking.openURL(option.url)}>
          <Text style={styles.donationButtonText}>Quero doar →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <View style={styles.testimonialCard}>
      <Text style={styles.testimonialQuote}>"</Text>
      <Text style={styles.testimonialText}>{testimonial.text}</Text>
      <View style={styles.testimonialAuthor}>
        <View style={styles.testimonialAvatar}>
          <Text style={styles.testimonialInitials}>{testimonial.initials}</Text>
        </View>
        <View>
          <Text style={styles.testimonialName}>{testimonial.name}</Text>
          <Text style={styles.testimonialRole}>{testimonial.role}</Text>
        </View>
      </View>
    </View>
  );
}

function SectionTitle({
  overline,
  title,
  subtitle,
  light = false,
  center = false,
}: {
  overline?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <View style={[styles.sectionTitleWrap, center && { alignItems: 'center' }]}>
      {overline && (
        <Text
          style={[
            styles.sectionOverline,
            light && { color: '#00C8FF' },
            center && { textAlign: 'center' },
          ]}>
          {overline}
        </Text>
      )}
      <Text
        style={[
          styles.sectionTitle,
          light && { color: MPC.branco },
          center && { textAlign: 'center' },
        ]}>
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[
            styles.sectionSubtitle,
            light && { color: 'rgba(255,255,255,0.75)' },
            center && { textAlign: 'center' },
          ]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#5B2FBE' }}>
      <StatusBar style="light" translucent />

      {/* ── HEADER flutuante sobre a foto ── */}
      <View style={styles.floatingHeader} pointerEvents="box-none">
        {/* Logo */}
        <View style={styles.headerLogo}>
          <View style={styles.logoBox}>
            <Text style={styles.logoBoxTop}>MOVIMENTO</Text>
            <Text style={styles.logoBoxPro}>PRÓ</Text>
            <Text style={styles.logoBoxBottom}>CRIANÇA</Text>
          </View>
        </View>

        {/* Hamburger */}
        <TouchableOpacity style={styles.hamburger} onPress={() => setMenuOpen(!menuOpen)}>
          <View style={[styles.hamburgerLine, { width: 22 }]} />
          <View style={[styles.hamburgerLine, { width: 16, alignSelf: 'flex-end' }]} />
          <View style={[styles.hamburgerLine, { width: 22 }]} />
        </TouchableOpacity>
      </View>

      {/* Menu overlay */}
      {menuOpen && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuClose} onPress={() => setMenuOpen(false)}>
            <Text style={styles.menuCloseText}>✕</Text>
          </TouchableOpacity>
          {['HOME', 'QUEM SOMOS', 'ATIVIDADES', 'PROJETOS', 'UNIDADES', 'QUERO AJUDAR'].map(
            (item) => (
              <TouchableOpacity
                key={item}
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  Linking.openURL('https://movimentoprocrianca.org.br/v2/');
                }}>
                <Text style={styles.menuItemText}>{item}</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 0 }}
        showsVerticalScrollIndicator={false}>

        {/* ── HERO — foto fullscreen ── */}
        <ImageBackground
          source={require('@/assets/images/hero-crianca.jpg')}
          style={styles.heroImage}
          resizeMode="cover">
          {/* Gradiente escuro no topo para o header */}
          <View style={styles.heroGradientTop} />
        </ImageBackground>

        {/* ── SEÇÃO ROXA — "50 MIL crianças" ── */}
        <View style={styles.purpleSection}>
          <DecorativeShape />

          <View style={styles.purpleContent}>
            <Text style={styles.purpleOverline}>SÃO MAIS DE</Text>
            <Text style={styles.purpleStat}>50 MIL</Text>
            <Text style={styles.purpleStatSub}>crianças</Text>
            <Text style={styles.purpleDescription}>
              atendidas pelo Movimento Pró Criança desde 1993
            </Text>

            <TouchableOpacity
              style={styles.purpleCTA}
              onPress={() =>
                Linking.openURL('https://movimentoprocrianca.org.br/v2/quero-ajudar/')
              }>
              <Text style={styles.purpleCTAText}>QUERO AJUDAR MAIS CRIANÇAS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── ATIVIDADES ── */}
        <View style={styles.section}>
          <SectionTitle
            overline="ÁREAS DE ATUAÇÃO"
            title="Atividades"
            subtitle="O Movimento Pró-Criança desenvolve atividades em educação complementar em diferentes linguagens."
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 0, gap: 12 }}>
            {ACTIVITIES.map((a, i) => (
              <ActivityCard key={i} activity={a} />
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => Linking.openURL('https://movimentoprocrianca.org.br/v2/atividades/')}>
            <Text style={styles.outlineBtnText}>VER TODAS AS ATIVIDADES</Text>
          </TouchableOpacity>
        </View>

        {/* ── IMPOSTO DE RENDA ── */}
        <View style={styles.sectionBlue}>
          <SectionTitle
            overline="IMPOSTO DE RENDA"
            title={'Transforme seu imposto\nem vidas reais'}
            light
          />
          <Text style={styles.blueSectionText}>
            Destine até{' '}
            <Text style={{ color: '#00C8FF', fontWeight: '800' }}>
              6% do seu imposto de renda
            </Text>{' '}
            para mudar a vida de muitas crianças. É fácil e legal!
          </Text>
          <TouchableOpacity
            style={styles.cyanBtn}
            onPress={() => Linking.openURL('https://movimentoprocrianca.org.br/v2/quero-ajudar/')}>
            <Text style={styles.cyanBtnText}>SAIBA COMO FAZER</Text>
          </TouchableOpacity>
        </View>

        {/* ── COMO DOAR ── */}
        <View style={[styles.section, { backgroundColor: '#F4F6FB' }]}>
          <SectionTitle
            overline="VEJA AS FORMAS DE"
            title="Como Doar"
            subtitle="Escolha a forma mais conveniente para você."
            center
          />
          <View style={{ gap: 12 }}>
            {DONATION_OPTIONS.map((o, i) => (
              <DonationCard key={i} option={o} />
            ))}
          </View>
        </View>

        {/* ── DEPOIMENTOS ── */}
        <View style={styles.section}>
          <SectionTitle
            overline="COMENTÁRIOS"
            title="Depoimentos reais"
            subtitle="O que dizem sobre o nosso trabalho."
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}>
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </ScrollView>
        </View>

        {/* ── APOIADORES ── */}
        <View style={[styles.section, { backgroundColor: '#F4F6FB' }]}>
          <SectionTitle
            overline="QUEM ACREDITA EM NÓS"
            title="Apoiadores"
            center
          />
          <View style={styles.partnersGrid}>
            {[
              'Neoenergia',
              'Compesa',
              'Copergas',
              'Governo PE',
              'Toyota',
              'Coca-Cola',
              'UFPE',
              'UFRPE',
              'UNICAP',
              'Sesc',
              'M Dias Branco',
              'TRF',
            ].map((p, i) => (
              <View key={i} style={styles.partnerChip}>
                <Text style={styles.partnerChipText}>{p}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => Linking.openURL('https://movimentoprocrianca.org.br/v2/')}>
            <Text style={styles.outlineBtnText}>QUERO SER PARCEIRO</Text>
          </TouchableOpacity>
        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer}>
          <View style={styles.footerLogo}>
            <Text style={styles.footerLogoText}>MPC</Text>
          </View>
          <Text style={styles.footerOrgName}>Movimento Pró Criança</Text>
          <Text style={styles.footerTagline}>Transformando vidas desde 1993</Text>

          <View style={{ gap: 10, marginTop: 16 }}>
            <TouchableOpacity
              style={styles.footerRow}
              onPress={() => Linking.openURL('tel:08000218989')}>
              <Text style={styles.footerIcon}>📞</Text>
              <Text style={styles.footerText}>0800 021 8989</Text>
            </TouchableOpacity>
            <View style={styles.footerRow}>
              <Text style={styles.footerIcon}>📍</Text>
              <Text style={styles.footerText}>Rua dos Coelhos, 317 — Boa Vista, Recife-PE</Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.footerIcon}>🕗</Text>
              <Text style={styles.footerText}>Seg–Sex: 8h00 às 16h30</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={() =>
              Linking.openURL(
                'https://api.whatsapp.com/send?phone=558120114332&text=Acessei%20o%20app%20do%20Movimento%20Pr%C3%B3%20Crian%C3%A7a'
              )
            }>
            <Text style={styles.whatsappBtnText}>💬  Fale pelo WhatsApp</Text>
          </TouchableOpacity>

          <Text style={styles.footerCopy}>© 1993–2025 Movimento Pró-Criança</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const STATUSBAR_HEIGHT =
  Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 44;

const styles = StyleSheet.create({
  // ── Floating Header ───────────────────────────
  floatingHeader: {
    position: 'absolute',
    top: STATUSBAR_HEIGHT + 8,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    backgroundColor: '#5B2FBE',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  logoBoxTop: {
    color: MPC.branco,
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1,
  },
  logoBoxPro: {
    color: MPC.laranja,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  logoBoxBottom: {
    color: MPC.branco,
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1,
  },
  hamburger: {
    gap: 5,
    padding: 6,
  },
  hamburgerLine: {
    height: 2.5,
    backgroundColor: MPC.branco,
    borderRadius: 2,
  },

  // ── Menu overlay ──────────────────────────────
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#5B2FBE',
    zIndex: 200,
    paddingTop: STATUSBAR_HEIGHT + 20,
    paddingHorizontal: 28,
    gap: 6,
  },
  menuClose: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    padding: 8,
  },
  menuCloseText: {
    color: MPC.branco,
    fontSize: 22,
    fontWeight: '300',
  },
  menuItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  menuItemText: {
    color: MPC.branco,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // ── Hero ──────────────────────────────────────
  heroImage: {
    width,
    height: HERO_HEIGHT,
  },
  heroGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  // ── Purple Section ────────────────────────────
  purpleSection: {
    backgroundColor: '#5B2FBE',
    paddingTop: 36,
    paddingBottom: 44,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  purpleContent: {
    zIndex: 2,
  },
  purpleOverline: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  purpleStat: {
    color: MPC.branco,
    fontSize: 64,
    fontWeight: '900',
    lineHeight: 68,
  },
  purpleStatSub: {
    color: MPC.branco,
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 52,
    marginTop: -4,
  },
  purpleDescription: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: '70%',
  },
  purpleCTA: {
    marginTop: 24,
    backgroundColor: '#00AAFF',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 30,
    alignSelf: 'flex-start',
  },
  purpleCTAText: {
    color: MPC.branco,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },

  // ── Decor shape ───────────────────────────────
  decorShape: {
    position: 'absolute',
    right: -20,
    bottom: -10,
    width: 180,
    height: 200,
    zIndex: 1,
  },
  decorArc: {
    position: 'absolute',
    right: 10,
    bottom: 20,
    width: 140,
    height: 160,
    borderRadius: 80,
    borderWidth: 16,
    borderColor: '#00C8FF',
    opacity: 0.85,
    transform: [{ rotate: '-20deg' }, { scaleX: 0.7 }],
  },
  decorLine: {
    position: 'absolute',
    right: 55,
    bottom: 40,
    width: 60,
    height: 100,
    borderRadius: 40,
    borderWidth: 10,
    borderColor: '#00C8FF',
    opacity: 0.7,
    transform: [{ rotate: '15deg' }, { scaleX: 0.5 }],
  },

  // ── Section genérica ──────────────────────────
  section: {
    padding: 24,
    backgroundColor: MPC.branco,
    gap: 16,
  },
  sectionBlue: {
    backgroundColor: '#003F7D',
    padding: 24,
    gap: 12,
  },
  sectionTitleWrap: {
    gap: 4,
  },
  sectionOverline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00AAFF',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A2E',
    lineHeight: 32,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 4,
  },

  // ── Blue section ──────────────────────────────
  blueSectionText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    lineHeight: 22,
  },
  cyanBtn: {
    backgroundColor: '#00AAFF',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  cyanBtnText: {
    color: MPC.branco,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },

  // ── Activity Card ─────────────────────────────
  activityCard: {
    backgroundColor: '#F4F6FB',
    borderRadius: 14,
    padding: 16,
    width: 190,
    borderTopWidth: 4,
    borderTopColor: '#5B2FBE',
  },
  activityCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  activityIcon: { fontSize: 22 },
  activityCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5B2FBE',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  activityItems: { gap: 4 },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activityDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: MPC.laranja,
  },
  activityItemText: { fontSize: 12, color: '#555' },
  activityMore: { fontSize: 11, color: '#5B2FBE', fontWeight: '600', marginTop: 4 },

  // ── Donation Card ─────────────────────────────
  donationCard: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: MPC.branco,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  donationCardTop: {
    backgroundColor: '#5B2FBE',
    padding: 16,
  },
  donationTitle: { fontSize: 17, fontWeight: '800', color: MPC.branco },
  donationSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  donationCardBody: { padding: 16, gap: 6 },
  donationValue: { fontSize: 14, fontWeight: '700', color: '#5B2FBE' },
  donationDescription: { fontSize: 13, color: '#666', lineHeight: 18 },
  donationButton: {
    backgroundColor: '#003F7D',
    paddingVertical: 11,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 6,
  },
  donationButtonText: { color: MPC.branco, fontWeight: '700', fontSize: 13 },

  // ── Testimonial Card ──────────────────────────
  testimonialCard: {
    backgroundColor: '#F4F6FB',
    borderRadius: 14,
    padding: 20,
    width: width * 0.76,
    borderLeftWidth: 4,
    borderLeftColor: MPC.laranja,
  },
  testimonialQuote: {
    fontSize: 52,
    color: MPC.laranja,
    fontWeight: '900',
    lineHeight: 44,
    marginBottom: 4,
  },
  testimonialText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  testimonialAuthor: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  testimonialAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#5B2FBE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialInitials: { color: MPC.branco, fontWeight: '700', fontSize: 12 },
  testimonialName: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  testimonialRole: { fontSize: 11, color: '#888', marginTop: 1 },

  // ── Partners ──────────────────────────────────
  partnersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  partnerChip: {
    backgroundColor: MPC.branco,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: '#D0D5E8',
  },
  partnerChipText: { fontSize: 12, color: '#5B2FBE', fontWeight: '600' },

  // ── Outline Button ────────────────────────────
  outlineBtn: {
    borderWidth: 2,
    borderColor: '#5B2FBE',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  outlineBtnText: { color: '#5B2FBE', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },

  // ── Footer ────────────────────────────────────
  footer: {
    backgroundColor: '#1A1A2E',
    padding: 28,
    alignItems: 'center',
    gap: 4,
  },
  footerLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#5B2FBE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  footerLogoText: { color: MPC.branco, fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  footerOrgName: { color: MPC.branco, fontSize: 17, fontWeight: '700' },
  footerTagline: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  footerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, width: '100%' },
  footerIcon: { fontSize: 15 },
  footerText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, flex: 1, lineHeight: 18 },
  whatsappBtn: {
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  whatsappBtnText: { color: MPC.branco, fontWeight: '700', fontSize: 14 },
  footerCopy: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    marginTop: 12,
  },
});
