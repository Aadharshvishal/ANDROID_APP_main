import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const { workerId, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, highRisk: 0, suspicious: 0, normal: 0 });

  useFocusEffect(
    useCallback(() => {
      const loadStats = async () => {
        try {
          const stored = await AsyncStorage.getItem('@oscc_scan_history');
          if (stored) {
            const history = JSON.parse(stored);
            setStats({
              total:     history.length,
              highRisk:  history.filter(h => h.risk_level === 'High Risk').length,
              suspicious:history.filter(h => h.risk_level === 'Suspicious').length,
              normal:    history.filter(h => h.risk_level === 'Normal').length,
            });
          }
        } catch (e) { console.error('Dashboard stats error', e); }
      };
      loadStats();
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.workerName}>Dr. {workerId}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Dashboard title */}
          <Text style={styles.sectionTitle}>Clinical Dashboard</Text>

          {/* Total patients big card */}
          <View style={styles.totalCard}>
            <View>
              <Text style={styles.totalNum}>{stats.total}</Text>
              <Text style={styles.totalLabel}>Total Patients Screened</Text>
            </View>
            <View style={styles.totalIconCircle}>
              <Ionicons name="people-circle" size={32} color="#1565C0" />
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderLeftColor: '#DC2626' }]}>
              <Text style={[styles.statValue, { color: '#DC2626' }]}>{stats.highRisk}</Text>
              <Text style={styles.statLabel}>High Risk</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#D97706' }]}>
              <Text style={[styles.statValue, { color: '#D97706' }]}>{stats.suspicious}</Text>
              <Text style={styles.statLabel}>Suspicious</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#16A34A' }]}>
              <Text style={[styles.statValue, { color: '#16A34A' }]}>{stats.normal}</Text>
              <Text style={styles.statLabel}>Normal</Text>
            </View>
          </View>

          {/* Primary CTA */}
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Consent')}
          >
            <Ionicons name="expand-outline" size={24} color="#FFFFFF" style={{ marginRight: 10 }} />
            <Text style={styles.ctaText}>Start New Patient Screening</Text>
          </TouchableOpacity>

          {/* Quick access row */}
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.rowBtns}>
            <TouchableOpacity style={styles.halfBtn} onPress={() => navigation.navigate('History')} activeOpacity={0.8}>
              <View style={[styles.halfBtnIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="folder-open-outline" size={24} color="#1565C0" />
              </View>
              <Text style={styles.halfBtnText}>Patient Records</Text>
              <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.halfBtn} onPress={() => navigation.navigate('HospitalFinder')} activeOpacity={0.8}>
              <View style={[styles.halfBtnIcon, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="medical-outline" size={24} color="#DC2626" />
              </View>
              <Text style={styles.halfBtnText}>Find Hospitals</Text>
              <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Tools */}
          <Text style={styles.sectionTitle}>Clinical Tools</Text>
          <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('Risk')}>
            <View style={[styles.listIconBox, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="clipboard-outline" size={20} color="#16A34A" />
            </View>
            <Text style={styles.listItemText}>Patient Risk Questionnaire</Text>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('Specialists')}>
            <View style={[styles.listIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="people-outline" size={20} color="#1565C0" />
            </View>
            <Text style={styles.listItemText}>Specialist Referral Guide</Text>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('ChangePin')}>
            <View style={[styles.listIconBox, { backgroundColor: '#F8FAFC' }]}>
              <Ionicons name="key-outline" size={20} color="#64748B" />
            </View>
            <Text style={styles.listItemText}>Change Account PIN</Text>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const CARD_SHADOW = {
  shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  greeting:   { color: '#94A3B8', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  workerName: { color: '#1A2B4A', fontSize: 20, fontWeight: '800', marginTop: 2 },
  logoutBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#FECACA' },
  logoutText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },

  content: { padding: 20, paddingBottom: 40 },

  sectionTitle: { color: '#475569', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12, marginTop: 8 },

  totalCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    ...CARD_SHADOW,
  },
  totalNum:       { color: '#1565C0', fontSize: 48, fontWeight: '900', lineHeight: 52 },
  totalLabel:     { color: '#64748B', fontSize: 13, fontWeight: '500', marginTop: 2 },
  totalIconCircle:{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard:  {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14,
    borderLeftWidth: 4, ...CARD_SHADOW,
  },
  statValue: { fontSize: 26, fontWeight: '800', marginBottom: 2 },
  statLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },

  ctaButton: {
    backgroundColor: '#1565C0', borderRadius: 14, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, shadowColor: '#1565C0', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  rowBtns: { gap: 10, marginBottom: 20 },
  halfBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', ...CARD_SHADOW,
  },
  halfBtnIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  halfBtnText: { flex: 1, color: '#1A2B4A', fontSize: 14, fontWeight: '600' },

  listItem: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10, ...CARD_SHADOW,
  },
  listIconBox:  { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  listItemText: { flex: 1, color: '#1A2B4A', fontSize: 14, fontWeight: '600' },
});
