import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const STORAGE_KEY = '@oscc_scan_history';

export const saveHistoryEntry = async (result, imageUri, patientId, caseNotes) => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const history = existing ? JSON.parse(existing) : [];
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      patientId: patientId || "Unknown",
      caseNotes: caseNotes || "",
      risk_level: result.risk_level,
      confidence: result.confidence,
      recommendation: result.recommendation,
      raw_score: result.raw_score,
      imageUri,
    };
    history.unshift(entry); // newest first
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save scan history:', e);
  }
};

const RISK_COLOR = {
  'High Risk':   '#DC2626',
  'Suspicious':  '#D97706',
  'Normal':      '#16A34A',
};

const RISK_BG = {
  'High Risk':   '#FEF2F2',
  'Suspicious':  '#FFFBEB',
  'Normal':      '#F0FDF4',
};

const RISK_ICON = {
  'High Risk':  'alert-circle',
  'Suspicious': 'warning',
  'Normal':     'checkmark-circle',
};

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      setHistory(stored ? JSON.parse(stored) : []);
    } catch (e) {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    Alert.alert('Clear All History?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem(STORAGE_KEY);
          setHistory([]);
        }
      },
    ]);
  };

  const deleteEntry = (id) => {
    Alert.alert('Delete this scan?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const updated = history.filter(h => h.id !== id);
          setHistory(updated);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      },
    ]);
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getTrend = () => {
    if (history.length < 2) return null;
    const latest = history[0].raw_score;
    const prev   = history[1].raw_score;
    if (latest > prev + 0.05) return { arrow: 'trending-up', text: 'Risk increasing', color: '#FF4757' };
    if (latest < prev - 0.05) return { arrow: 'trending-down', text: 'Risk decreasing', color: '#2ECC71' };
    return { arrow: 'remove', text: 'Risk stable', color: '#FFB347' };
  };

  const exportCSV = async () => {
    try {
      if (history.length === 0) {
        return Alert.alert('No Records', 'There are no patient records to export yet.');
      }

      // Build the CSV string
      let csv = 'Patient ID,Scan Date,Risk Level,AI Confidence (%),Clinical Notes\n';
      history.forEach(item => {
        const pId   = (item.patientId || 'Unknown').replace(/,/g, ' ');
        const date  = formatDate(item.date).replace(/,/g, ' ');
        const risk  = item.risk_level || 'Unknown';
        const conf  = item.confidence || 0;
        const notes = item.caseNotes
          ? '"' + item.caseNotes.replace(/"/g, "''") + '"'
          : 'None';
        csv += `${pId},${date},${risk},${conf}%,${notes}\n`;
      });

      // Write to device storage
      const path = FileSystem.documentDirectory + 'OSCC_Report.csv';
      await FileSystem.writeAsStringAsync(path, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(path, {
          mimeType: 'text/csv',
          dialogTitle: 'Share Patient Report',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Alert.alert(
          'Sharing Not Available',
          'Your device does not support file sharing. The CSV was saved to: ' + path
        );
      }
    } catch (err) {
      console.error('[CSV Export Error]', err);
      Alert.alert(
        'Export Failed',
        'Could not generate the report. Error: ' + err.message
      );
    }
  };

  const trend = getTrend();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1565C0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Patient Records</Text>
          {history.length > 0 ? (
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <TouchableOpacity style={styles.exportBtnBox} onPress={exportCSV}>
                <Ionicons name="download-outline" size={14} color="#16A34A" />
                <Text style={styles.exportBtn}>CSV</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearBtnBox} onPress={clearHistory}>
                <Text style={styles.clearBtn}>Clear</Text>
              </TouchableOpacity>
            </View>
          ) : <View style={{ width: 40 }} />}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Trend Indicator */}
          {trend && (
            <View style={[styles.trendCard, { borderLeftColor: trend.color }]}>
              <Ionicons name={trend.arrow} size={28} color={trend.color} style={{ marginRight: 12 }} />
              <View>
                <Text style={styles.trendLabel}>Trend vs Last Scan</Text>
                <Text style={[styles.trendText, { color: trend.color }]}>{trend.text}</Text>
              </View>
            </View>
          )}

          {/* Stats Row */}
          {history.length > 0 && (
            <View style={styles.statsRow}>
              {[
                { label: 'Total', value: history.length, color: '#1565C0', bg: '#EFF6FF' },
                { label: 'High Risk', value: history.filter(h => h.risk_level === 'High Risk').length, color: '#DC2626', bg: '#FEF2F2' },
                { label: 'Normal', value: history.filter(h => h.risk_level === 'Normal').length, color: '#16A34A', bg: '#F0FDF4' },
              ].map((s, i) => (
                <View key={i} style={[styles.statCard, { backgroundColor: s.bg }]}>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* History List */}
          {loading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : history.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="folder-open-outline" size={52} color="#CBD5E1" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>No records yet.</Text>
              <Text style={styles.emptySub}>Complete a scan to see patient records here.</Text>
            </View>
          ) : (
            history.map((item, i) => (
              <TouchableOpacity
                key={item.id}
                style={styles.histCard}
                onPress={() => {
                  navigation.navigate('Result', {
                    result: {
                      risk_level: item.risk_level,
                      confidence: item.confidence,
                      recommendation: item.recommendation,
                      raw_score: item.raw_score,
                    },
                    imageUri: item.imageUri,
                    patientId: item.patientId,
                    savedNotes: item.caseNotes,
                    isHistorical: true,
                  });
                }}
                onLongPress={() => deleteEntry(item.id)}
                activeOpacity={0.8}
              >
                {/* Risk color bar */}
                <View style={[styles.riskBar, { backgroundColor: RISK_COLOR[item.risk_level] }]} />
                {/* Thumbnail */}
                <View style={styles.histLeft}>
                  {item.imageUri ? (
                    <Image source={{ uri: item.imageUri }} style={styles.thumb} />
                  ) : (
                    <View style={[styles.thumb, styles.thumbPlaceholder]}>
                      <Ionicons name="image-outline" size={22} color="#CBD5E1" />
                    </View>
                  )}
                </View>
                {/* Content */}
                <View style={styles.histBody}>
                  <View style={styles.histTop}>
                    <View style={[styles.riskPill, { backgroundColor: RISK_BG[item.risk_level] }]}>
                      <Ionicons name={RISK_ICON[item.risk_level] || 'help-circle'} size={13} color={RISK_COLOR[item.risk_level]} />
                      <Text style={[styles.histRisk, { color: RISK_COLOR[item.risk_level] }]}>
                        {item.risk_level}
                      </Text>
                    </View>
                    {i === 0 && <View style={styles.latestBadge}><Text style={styles.latestText}>NEW</Text></View>}
                  </View>
                  <Text style={styles.histPatient}>{item.patientId || 'Unknown'}</Text>
                  <Text style={styles.histConf}>{item.confidence}% AI confidence</Text>
                  <Text style={styles.histDate}>{formatDate(item.date)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              </TouchableOpacity>
            ))
          )}

          {history.length > 0 && (
            <Text style={styles.hint}>Long-press any entry to delete</Text>
          )}
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  backBtn:     { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: '#1A2B4A', fontSize: 17, fontWeight: '700' },
  exportBtnBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#BBF7D0' },
  clearBtnBox:  { backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' },
  clearBtn:    { color: '#DC2626', fontWeight: '700', fontSize: 13 },
  exportBtn:   { color: '#16A34A', fontWeight: '700', fontSize: 13 },
  content:     { padding: 20, paddingBottom: 40 },

  trendCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 14,
    padding: 14, marginBottom: 14, borderLeftWidth: 4, ...CARD_SHADOW,
  },
  trendLabel: { color: '#64748B', fontSize: 12 },
  trendText:  { fontWeight: '700', fontSize: 15, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', ...CARD_SHADOW,
  },
  statValue: { fontWeight: '800', fontSize: 22, marginBottom: 2 },
  statLabel: { color: '#64748B', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },

  histCard: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderRadius: 14, marginBottom: 10, overflow: 'hidden',
    alignItems: 'center', ...CARD_SHADOW,
  },
  riskBar:  { width: 5, alignSelf: 'stretch' },
  histLeft: { padding: 12 },
  thumb: { width: 54, height: 54, borderRadius: 10 },
  thumbPlaceholder: {
    backgroundColor: '#F0F4F8', alignItems: 'center', justifyContent: 'center',
  },
  histBody:   { flex: 1, paddingVertical: 12 },
  histTop:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  riskPill:   { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  histRisk:   { fontWeight: '700', fontSize: 13 },
  latestBadge:{ backgroundColor: '#1565C0', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  latestText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  histPatient:{ color: '#1A2B4A', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  histConf:   { color: '#64748B', fontSize: 12, marginBottom: 1 },
  histDate:   { color: '#94A3B8', fontSize: 11 },

  emptyBox:  { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  emptySub:  { color: '#CBD5E1', fontSize: 13, marginTop: 6, textAlign: 'center' },
  hint:      { color: '#CBD5E1', fontSize: 12, textAlign: 'center', marginTop: 12 },
});
