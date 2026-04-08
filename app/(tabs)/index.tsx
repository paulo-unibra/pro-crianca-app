import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  ImageBackground,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MPC } from '@/constants/theme';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.62;
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 44;

function DecorativeShape() {
  return (
    <View style={styles.decorShape} pointerEvents="none">
      <View style={styles.decorArc} />
      <View style={styles.decorLine} />
    </View>
  );
}

export default function HomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#5B2FBE' }}>
      <StatusBar style="light" translucent />

      {/* Header flutuante */}
      <View style={styles.floatingHeader} pointerEvents="box-none">
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
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

      {/* Hero — foto fullscreen */}
      <ImageBackground
        source={require('@/assets/images/hero-crianca.jpg')}
        style={styles.heroImage}
        resizeMode="cover">
        <View style={styles.heroGradientTop} />
      </ImageBackground>

      {/* Seção roxa */}
      <View style={[styles.purpleSection, { paddingBottom: insets.bottom + 32 }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
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
  logoImage: {
    width: 90,
    height: 52,
    borderRadius: 8,
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

  purpleSection: {
    flex: 1,
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
});
