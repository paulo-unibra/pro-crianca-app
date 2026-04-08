/**
 * Cores do Movimento Pró Criança
 * Baseado na identidade visual do site movimentoprocrianca.org.br
 */

import { Platform } from 'react-native';

export const MPC = {
  azulEscuro: '#003F7D',
  azulMedio: '#005BAA',
  azulClaro: '#1976D2',
  laranja: '#F7941D',
  laranjaEscuro: '#E07A00',
  verde: '#4CAF50',
  branco: '#FFFFFF',
  cinzaClaro: '#F5F5F5',
  cinzaMedio: '#E0E0E0',
  cinzaTexto: '#555555',
  cinzaEscuro: '#333333',
  preto: '#111111',
};

const tintColorLight = MPC.azulEscuro;
const tintColorDark = MPC.laranja;

export const Colors = {
  light: {
    text: MPC.cinzaEscuro,
    background: MPC.branco,
    tint: tintColorLight,
    icon: MPC.azulMedio,
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    cardBackground: MPC.cinzaClaro,
    border: MPC.cinzaMedio,
    primary: MPC.azulEscuro,
    accent: MPC.laranja,
  },
  dark: {
    text: '#ECEDEE',
    background: '#0a1628',
    tint: tintColorDark,
    icon: MPC.azulClaro,
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    cardBackground: '#1a2a3a',
    border: '#2a3a4a',
    primary: MPC.azulClaro,
    accent: MPC.laranja,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
