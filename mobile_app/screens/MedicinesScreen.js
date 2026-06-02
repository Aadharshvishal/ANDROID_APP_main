import React from 'react';
import { Ionicons } from '@expo/vector-icons';
//  from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const medicines = [
  {
    category: 'Antifungal / Antiseptic Mouthwash',
    color: '#4F8EF7',
    items: [
      { name: 'Chlorhexidine 0.2%', use: 'Reduces oral bacteria and inflammation', dose: 'Rinse 10ml for 30 sec, twice daily' },
      { name: 'Nystatin Oral Suspension', use: 'Treats oral candidiasis (fungal infection)', dose: '5ml swish and swallow, 4x daily' },
    ],
  },
  {
    category: 'Pain Management',
    color: '#FF6B7A',
    items: [
      { name: 'Ibuprofen 400mg', use: 'Anti-inflammatory pain relief for oral sores', dose: '1 tablet after food, 3x daily (max 5 days)' },
      { name: 'Lidocaine Gel 2%', use: 'Topical numbing for painful ulcers', dose: 'Apply small amount to lesion with fingertip, 3x daily' },
    ],
  },
  {
    category: 'Vitamins & Supplements',
    color: '#2ECC71',
    items: [
      { name: 'Vitamin B Complex', use: 'Supports mucosal healing and nerve health', dose: '1 tablet daily with food' },
      { name: 'Zinc (50mg)', use: 'Boosts immune response and tissue repair', dose: '1 tablet daily' },
      { name: 'Vitamin C (500mg)', use: 'Antioxidant, supports collagen and immunity', dose: '1 tablet daily after food' },
    ],
  },
  {
    category: 'Lesion Healing Gels',
    color: '#FFB347',
    items: [
      { name: 'Triamcinolone Acetonide 0.1% Paste', use: 'Reduces inflammation of oral ulcers', dose: 'Apply thin layer on lesion, 23x daily after meals' },
      { name: 'Amlexanox 5% Paste', use: 'Promotes healing of aphthous ulcers', dose: 'Apply to lesion 4x daily until healed' },
    ],
  },
];

export default function MedicinesScreen({ navigation }) {
  return (
    <LinearGradient colors={['#0A0E1A', '#0D1B3E', '#0A0E1A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#4F8EF7" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medicines & Treatment</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}> Medical Disclaimer</Text>
            <Text style={styles.warningText}>
              These are general informational medicines only. Always consult your doctor before taking any medication.
            </Text>
          </View>

          {medicines.map((group, gi) => (
            <View key={gi} style={styles.group}>
              <View style={[styles.groupHeader, { borderLeftColor: group.color }]}>
                <Text style={[styles.groupTitle, { color: group.color }]}>{group.category}</Text>
              </View>
              {group.items.map((m, mi) => (
                <View key={mi} style={styles.medCard}>
                  <Text style={styles.medName}> {m.name}</Text>
                  <Text style={styles.medUse}>{m.use}</Text>
                  <View style={styles.doseBox}>
                    <Text style={styles.doseLabel}>Dosage: </Text>
                    <Text style={styles.doseText}>{m.dose}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea:  { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  backBtn:     { width: 40, height: 40, justifyContent: 'center' },
  backArrow:   { color: '#4F8EF7', fontSize: 20, fontWeight: '700' },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  warningBox: {
    backgroundColor:'rgba(255,179,71,0.1)', borderRadius: 12,
    padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,179,71,0.3)',
  },
  warningTitle: { color: '#FFB347', fontWeight: '700', fontSize: 13, marginBottom: 4 },
  warningText:  { color: '#8A9BB5', fontSize: 12, lineHeight: 18 },
  group:        { marginBottom: 20 },
  groupHeader:  { borderLeftWidth: 4, paddingLeft: 10, marginBottom: 10 },
  groupTitle:   { fontWeight: '700', fontSize: 14 },
  medCard: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  medName:   { color: '#FFFFFF', fontWeight: '700', fontSize: 14, marginBottom: 4 },
  medUse:    { color: '#8A9BB5', fontSize: 13, lineHeight: 19, marginBottom: 8 },
  doseBox:   { flexDirection: 'row', flexWrap: 'wrap' },
  doseLabel: { color: '#4F8EF7', fontWeight: '700', fontSize: 12 },
  doseText:  { color: '#C8D8F0', fontSize: 12, lineHeight: 18, flex: 1 },
});
