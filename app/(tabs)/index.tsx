import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MPC } from '@/constants/theme';

const { width } = Dimensions.get('window');

// ─── Tipos ───────────────────────────────────────────────────────────────────

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

// ─── Dados ───────────────────────────────────────────────────────────────────

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
    role: 'Diretor-Presidente da Neoenergia Pernambuco',
    initials: 'SC',
    text: '"Contribuir com o Movimento Pró-Criança é motivo de orgulho. São iniciativas como essa que nos fazem acreditar em um futuro melhor."',
  },
];

// ─── Componentes internos ─────────────────────────────────────────────────────

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {/* Logo placeholder (texto) */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoIconText}>MPC</Text>
          </View>
          <View>
            <Text style={styles.logoTitle}>Movimento</Text>
            <Text style={styles.logoSubtitle}>Pró Criança</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.donateButton}
          onPress={() => Linking.openURL('https://movimentoprocrianca.org.br/v2/quero-ajudar/')}>
          <Text style={styles.donateButtonText}>Quero Ajudar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function HeroBanner() {
  return (
    <View style={styles.hero}>
      <View style={styles.heroOverlay}>
        <Text style={styles.heroHighlight}>+50 MIL</Text>
        <Text style={styles.heroTitle}>crianças atendidas{'\n'}desde 1993</Text>
        <Text style={styles.heroSubtitle}>
          Transformando vidas através da educação, cultura, esportes e empregabilidade em
          Pernambuco.
        </Text>
        <TouchableOpacity
          style={styles.heroButton}
          onPress={() => Linking.openURL('https://movimentoprocrianca.org.br/v2/quero-ajudar/')}>
          <Text style={styles.heroButtonText}>QUERO AJUDAR MAIS CRIANÇAS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SectionTitle({
  overline,
  title,
  subtitle,
  light = false,
}: {
  overline?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <View style={styles.sectionTitleContainer}>
      {overline ? (
        <Text style={[styles.sectionOverline, light && { color: MPC.laranja }]}>{overline}</Text>
      ) : null}
      <Text style={[styles.sectionTitle, light && { color: MPC.branco }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sectionSubtitle, light && { color: 'rgba(255,255,255,0.8)' }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function ActivityCard({ activity }: { activity: ActivityItem }) {
  return (
    <View style={styles.activityCard}>
      <View style={styles.activityCardHeader}>
        <Text style={styles.activityIcon}>{activity.icon}</Text>
        <Text style={styles.activityCategory}>{activity.category}</Text>
      </View>
      <Text style={styles.activityTitle}>{activity.title}</Text>
      <View style={styles.activityItems}>
        {activity.items.slice(0, 5).map((item, index) => (
          <View key={index} style={styles.activityItem}>
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

function StatsBanner() {
  return (
    <View style={styles.statsBanner}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>+50 mil</Text>
        <Text style={styles.statLabel}>crianças{'\n'}atendidas</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>30+</Text>
        <Text style={styles.statLabel}>anos de{'\n'}história</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>3</Text>
        <Text style={styles.statLabel}>unidades{'\n'}em PE</Text>
      </View>
    </View>
  );
}

function Imposto() {
  return (
    <View style={styles.impostoSection}>
      <View style={styles.impostoContent}>
        <Text style={styles.impostoLabel}>IMPOSTO DE RENDA</Text>
        <Text style={styles.impostoTitle}>
          Transforme o seu imposto em{' '}
          <Text style={{ color: MPC.laranja }}>vidas transformadas</Text>
        </Text>
        <Text style={styles.impostoText}>
          Você pode destinar até{' '}
          <Text style={styles.impostoHighlight}>6% do seu imposto de renda</Text> para mudar a vida
          de muitas crianças. É fácil e legal!
        </Text>
        <TouchableOpacity
          style={styles.impostoButton}
          onPress={() => Linking.openURL('https://movimentoprocrianca.org.br/v2/quero-ajudar/')}>
          <Text style={styles.impostoButtonText}>SAIBA COMO FAZER</Text>
        </TouchableOpacity>
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
          <Text style={styles.donationButtonText}>Quero doar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <View style={styles.testimonialCard}>
      <Text style={styles.testimonialQuoteIcon}>"</Text>
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

function ContactSection() {
  return (
    <View style={styles.contactSection}>
      <View style={styles.contactLogoContainer}>
        <View style={styles.contactLogo}>
          <Text style={styles.contactLogoText}>MPC</Text>
        </View>
        <Text style={styles.contactOrgName}>Movimento Pró Criança</Text>
        <Text style={styles.contactTagline}>Transformando vidas desde 1993</Text>
      </View>

      <View style={styles.contactInfo}>
        <TouchableOpacity
          style={styles.contactItem}
          onPress={() => Linking.openURL('tel:08000218989')}>
          <Text style={styles.contactIcon}>📞</Text>
          <Text style={styles.contactText}>0800 021 8989</Text>
        </TouchableOpacity>

        <View style={styles.contactItem}>
          <Text style={styles.contactIcon}>📍</Text>
          <Text style={styles.contactText}>Rua dos Coelhos, 317, Boa Vista, Recife-PE</Text>
        </View>

        <View style={styles.contactItem}>
          <Text style={styles.contactIcon}>🕗</Text>
          <Text style={styles.contactText}>Segunda a Sexta: 8h00 - 16h30</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.whatsappButton}
        onPress={() =>
          Linking.openURL(
            'https://api.whatsapp.com/send?phone=558120114332&text=Acessei%20o%20app%20do%20Movimento%20Pr%C3%B3%20Crian%C3%A7a%20e%20gostaria%20de%20algumas%20informa%C3%A7%C3%B5es.'
          )
        }>
        <Text style={styles.whatsappButtonText}>💬 Fale conosco pelo WhatsApp</Text>
      </TouchableOpacity>

      <Text style={styles.footerCopy}>© 1993–2025 Movimento Pró-Criança</Text>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: MPC.branco }}>
      <StatusBar style="light" backgroundColor={MPC.azulEscuro} />
      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <HeroBanner />

        {/* Estatísticas rápidas */}
        <StatsBanner />

        {/* Atividades */}
        <View style={styles.section}>
          <SectionTitle
            overline="ÁREAS DE ATUAÇÃO DO MOVIMENTO PRÓ CRIANÇA"
            title="Atividades"
            subtitle="O Movimento Pró-Criança desenvolve suas atividades em diferentes áreas da educação complementar."
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsScroll}>
            {ACTIVITIES.map((activity, index) => (
              <ActivityCard key={index} activity={activity} />
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() =>
              Linking.openURL('https://movimentoprocrianca.org.br/v2/atividades/')
            }>
            <Text style={styles.outlineButtonText}>VER TODAS AS ATIVIDADES</Text>
          </TouchableOpacity>
        </View>

        {/* Imposto de renda */}
        <Imposto />

        {/* Como Doar */}
        <View style={styles.sectionDark}>
          <SectionTitle
            overline="VEJA DIFERENTES FORMAS DE"
            title="Como Doar"
            subtitle="Escolha a forma mais conveniente para você contribuir com o Movimento Pró Criança."
            light
          />
          <View style={styles.donationCards}>
            {DONATION_OPTIONS.map((option, index) => (
              <DonationCard key={index} option={option} />
            ))}
          </View>
        </View>

        {/* Depoimentos */}
        <View style={styles.section}>
          <SectionTitle
            overline="COMENTÁRIOS"
            title="Depoimentos reais"
            subtitle="O que dizem sobre o nosso trabalho."
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsScroll}>
            {TESTIMONIALS.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </ScrollView>
        </View>

        {/* Apoiadores */}
        <View style={[styles.section, { backgroundColor: MPC.cinzaClaro }]}>
          <SectionTitle
            overline="QUEM ACREDITA EM NOSSO TRABALHO"
            title="Apoiadores"
            subtitle="Empresas e instituições que acreditam na nossa missão."
          />
          <View style={styles.partnersGrid}>
            {[
              'Neoenergia',
              'Compesa',
              'Copergas',
              'Fiori',
              'Governo PE',
              'Toyota',
              'Coca-Cola',
              'UFPE',
              'UNICAP',
              'Sesc',
            ].map((partner, index) => (
              <View key={index} style={styles.partnerChip}>
                <Text style={styles.partnerChipText}>{partner}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => Linking.openURL('https://movimentoprocrianca.org.br/v2/')}>
            <Text style={styles.outlineButtonText}>QUERO SER UM PARCEIRO</Text>
          </TouchableOpacity>
        </View>

        {/* Contato / Footer */}
        <ContactSection />
      </ScrollView>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Header ────────────────────────────────────
  header: {
    backgroundColor: MPC.azulEscuro,
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: MPC.laranja,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconText: {
    color: MPC.branco,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  logoTitle: {
    color: MPC.branco,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  logoSubtitle: {
    color: MPC.laranja,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
  },
  donateButton: {
    backgroundColor: MPC.laranja,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  donateButtonText: {
    color: MPC.branco,
    fontWeight: '700',
    fontSize: 13,
  },

  // ── Scroll ────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  // ── Hero ──────────────────────────────────────
  hero: {
    backgroundColor: MPC.azulEscuro,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  heroOverlay: {
    alignItems: 'flex-start',
  },
  heroHighlight: {
    fontSize: 48,
    fontWeight: '900',
    color: MPC.laranja,
    lineHeight: 52,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: MPC.branco,
    marginTop: 4,
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 12,
    lineHeight: 20,
  },
  heroButton: {
    marginTop: 24,
    backgroundColor: MPC.laranja,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
  },
  heroButtonText: {
    color: MPC.branco,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // ── Stats ─────────────────────────────────────
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: MPC.laranja,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: MPC.branco,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  // ── Section ───────────────────────────────────
  section: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: MPC.branco,
  },
  sectionDark: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: MPC.azulEscuro,
  },
  sectionTitleContainer: {
    marginBottom: 20,
  },
  sectionOverline: {
    fontSize: 11,
    fontWeight: '700',
    color: MPC.azulMedio,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: MPC.azulEscuro,
    lineHeight: 30,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: MPC.cinzaTexto,
    marginTop: 8,
    lineHeight: 20,
  },

  // ── Activity Card ─────────────────────────────
  cardsScroll: {
    marginHorizontal: -4,
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: MPC.cinzaClaro,
    borderRadius: 12,
    padding: 16,
    width: 200,
    marginHorizontal: 6,
    borderTopWidth: 4,
    borderTopColor: MPC.azulMedio,
  },
  activityCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  activityIcon: {
    fontSize: 24,
  },
  activityCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: MPC.azulMedio,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: MPC.azulEscuro,
    marginBottom: 10,
  },
  activityItems: {
    gap: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: MPC.laranja,
  },
  activityItemText: {
    fontSize: 13,
    color: MPC.cinzaTexto,
  },
  activityMore: {
    fontSize: 12,
    color: MPC.azulMedio,
    fontWeight: '600',
    marginTop: 4,
  },

  // ── Imposto ───────────────────────────────────
  impostoSection: {
    backgroundColor: MPC.azulClaro,
    padding: 24,
  },
  impostoContent: {
    gap: 12,
  },
  impostoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: MPC.laranja,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  impostoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: MPC.branco,
    lineHeight: 28,
  },
  impostoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  impostoHighlight: {
    fontWeight: '800',
    color: MPC.laranja,
  },
  impostoButton: {
    backgroundColor: MPC.laranja,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  impostoButtonText: {
    color: MPC.branco,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // ── Donation Card ─────────────────────────────
  donationCards: {
    gap: 12,
  },
  donationCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: MPC.branco,
  },
  donationCardTop: {
    backgroundColor: MPC.laranja,
    padding: 16,
  },
  donationTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: MPC.branco,
  },
  donationSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  donationCardBody: {
    padding: 16,
    gap: 8,
  },
  donationValue: {
    fontSize: 15,
    fontWeight: '700',
    color: MPC.azulEscuro,
  },
  donationDescription: {
    fontSize: 13,
    color: MPC.cinzaTexto,
    lineHeight: 18,
  },
  donationButton: {
    backgroundColor: MPC.azulEscuro,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  donationButtonText: {
    color: MPC.branco,
    fontWeight: '700',
    fontSize: 14,
  },

  // ── Testimonial Card ──────────────────────────
  testimonialCard: {
    backgroundColor: MPC.cinzaClaro,
    borderRadius: 12,
    padding: 20,
    width: width * 0.78,
    marginHorizontal: 6,
    borderLeftWidth: 4,
    borderLeftColor: MPC.laranja,
  },
  testimonialQuoteIcon: {
    fontSize: 48,
    color: MPC.laranja,
    fontWeight: '900',
    lineHeight: 40,
    marginBottom: 4,
  },
  testimonialText: {
    fontSize: 13,
    color: MPC.cinzaEscuro,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MPC.azulEscuro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialInitials: {
    color: MPC.branco,
    fontWeight: '700',
    fontSize: 13,
  },
  testimonialName: {
    fontSize: 13,
    fontWeight: '700',
    color: MPC.azulEscuro,
  },
  testimonialRole: {
    fontSize: 11,
    color: MPC.cinzaTexto,
    marginTop: 1,
  },

  // ── Partners ──────────────────────────────────
  partnersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  partnerChip: {
    backgroundColor: MPC.branco,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: MPC.cinzaMedio,
  },
  partnerChipText: {
    fontSize: 12,
    color: MPC.azulEscuro,
    fontWeight: '600',
  },

  // ── Outline Button ────────────────────────────
  outlineButton: {
    borderWidth: 2,
    borderColor: MPC.azulEscuro,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  outlineButtonText: {
    color: MPC.azulEscuro,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // ── Contact / Footer ──────────────────────────
  contactSection: {
    backgroundColor: MPC.azulEscuro,
    padding: 28,
    gap: 20,
  },
  contactLogoContainer: {
    alignItems: 'center',
    gap: 6,
  },
  contactLogo: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: MPC.laranja,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLogoText: {
    color: MPC.branco,
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 1,
  },
  contactOrgName: {
    color: MPC.branco,
    fontSize: 18,
    fontWeight: '700',
  },
  contactTagline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  contactIcon: {
    fontSize: 16,
  },
  contactText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  whatsappButtonText: {
    color: MPC.branco,
    fontWeight: '700',
    fontSize: 14,
  },
  footerCopy: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 4,
  },
});
