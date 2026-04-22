import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar as RNStatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MPC } from '@/constants/theme';
import { useInscricoes } from '@/contexts/InscricoesContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000/api';
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 44;

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Doacao = {
  id: number;
  amount: string;
  payment_method: 'pix' | 'boleto' | 'credit_card';
  status: string;
  created_at: string;
  paid_at: string | null;
  pix_qr_code: string | null;
  pix_qr_code_url: string | null;
  boleto_url: string | null;
  boleto_barcode: string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const METODO_LABEL: Record<string, string> = {
  pix: 'PIX',
  boleto: 'Boleto',
  credit_card: 'Cartão de Crédito',
};

const METODO_ICONE: Record<string, string> = {
  pix: '⚡',
  boleto: '🏦',
  credit_card: '💳',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  failed: 'Falhou',
  cancelled: 'Cancelado',
  refunded: 'Estornado',
  chargedback: 'Contestado',
};

const STATUS_COLOR: Record<string, string> = {
  pending: '#F7941D',
  paid: '#4CAF50',
  failed: '#e53935',
  cancelled: '#9E9E9E',
  refunded: '#9E9E9E',
  chargedback: '#e53935',
};

function formatData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function formatValor(amount: string): string {
  return parseFloat(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Card de doação ───────────────────────────────────────────────────────────

function CardDoacao({ doacao }: { doacao: Doacao }) {
  const status = doacao.status ?? 'pending';
  const statusColor = STATUS_COLOR[status] ?? '#9E9E9E';
  const statusLabel = STATUS_LABEL[status] ?? status;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardIcone}>{METODO_ICONE[doacao.payment_method] ?? '💰'}</Text>
          <View>
            <Text style={styles.cardMetodo}>{METODO_LABEL[doacao.payment_method] ?? doacao.payment_method}</Text>
            <Text style={styles.cardData}>{formatData(doacao.created_at)}</Text>
          </View>
        </View>
        <View>
          <Text style={styles.cardValor}>{formatValor(doacao.amount)}</Text>
          <View style={[styles.cardStatusBadge, { backgroundColor: statusColor + '22' }]}>
            <Text style={[styles.cardStatusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
      </View>

      {doacao.paid_at && (
        <Text style={styles.cardPago}>✓ Pago em {formatData(doacao.paid_at)}</Text>
      )}
    </View>
  );
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function MinhasDoacoesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { authToken } = useInscricoes();

  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const buscarDoacoes = useCallback(async () => {
    if (!authToken) return;
    setErro('');
    try {
      const res = await fetch(`${API_BASE_URL}/donations`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Erro ao carregar doações.');
      setDoacoes(Array.isArray(json) ? json : []);
    } catch (e: any) {
      setErro(e.message ?? 'Não foi possível carregar suas doações.');
    }
  }, [authToken]);

  useEffect(() => {
    buscarDoacoes().finally(() => setCarregando(false));
  }, [buscarDoacoes]);

  async function onRefresh() {
    setRefreshing(true);
    await buscarDoacoes();
    setRefreshing(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: MPC.azulEscuro }}>
      <StatusBar style="light" translucent />

      {/* Header */}
      <View style={[styles.header, { paddingTop: STATUSBAR_HEIGHT + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Voltar</Text>
        </TouchableOpacity>
        <Image
          source={require('@/assets/images/logo-branca.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Título */}
      <View style={styles.tituloWrap}>
        <Text style={styles.titulo}>Minhas Doações</Text>
        <Text style={styles.subtitulo}>Histórico de todas as suas contribuições</Text>
      </View>

      {/* Conteúdo */}
      {carregando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color={MPC.branco} />
        </View>
      ) : erro ? (
        <View style={styles.centrado}>
          <Text style={styles.erroText}>{erro}</Text>
          <TouchableOpacity style={styles.btnTentar} onPress={buscarDoacoes}>
            <Text style={styles.btnTentarText}>TENTAR NOVAMENTE</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.lista,
            { paddingBottom: insets.bottom + 32 },
            doacoes.length === 0 && styles.listaVazia,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={MPC.branco}
              colors={[MPC.branco]}
            />
          }>
          {doacoes.length === 0 ? (
            <View style={styles.centrado}>
              <Text style={styles.vazioIcone}>💝</Text>
              <Text style={styles.vazioTitulo}>Nenhuma doação ainda</Text>
              <Text style={styles.vazioSub}>Que tal fazer sua primeira contribuição?</Text>
              <TouchableOpacity
                style={styles.btndoar}
                onPress={() => router.push('/doacao' as any)}>
                <Text style={styles.btnDoarText}>QUERO AJUDAR</Text>
              </TouchableOpacity>
            </View>
          ) : (
            doacoes.map((d) => <CardDoacao key={d.id} doacao={d} />)
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: { padding: 4 },
  backBtnText: {
    color: MPC.branco,
    fontSize: 15,
    fontWeight: '600',
  },
  logoImage: { width: 90, height: 50 },

  tituloWrap: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  titulo: {
    color: MPC.branco,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitulo: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 4,
  },

  lista: {
    paddingHorizontal: 16,
    gap: 12,
  },
  listaVazia: {
    flex: 1,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcone: { fontSize: 28 },
  cardMetodo: {
    color: MPC.branco,
    fontSize: 15,
    fontWeight: '700',
  },
  cardData: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    marginTop: 2,
  },
  cardValor: {
    color: MPC.branco,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'right',
  },
  cardStatusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  cardStatusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardPago: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },

  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  erroText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  btnTentar: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  btnTentarText: {
    color: MPC.branco,
    fontWeight: '700',
    fontSize: 13,
  },

  vazioIcone: { fontSize: 48 },
  vazioTitulo: {
    color: MPC.branco,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  vazioSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    textAlign: 'center',
  },
  btndoar: {
    marginTop: 8,
    backgroundColor: '#00AAFF',
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  btnDoarText: {
    color: MPC.branco,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
