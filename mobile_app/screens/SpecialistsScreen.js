import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const specialists = [
  { icon: 'person-outline',       title: 'Oral Medicine Specialist', role: 'Diagnoses diseases of the mouth, teeth, and jaw',            when: 'First point of contact for any oral lesion or suspicious patch', tip: 'Ask for an oral cytology or biopsy referral' },
  { icon: 'search-outline',       title: 'Oral Pathologist',         role: 'Examines tissue samples to detect cancerous cells',          when: 'After a biopsy has been taken by your dentist or surgeon',       tip: 'Get results within 5-7 working days' },
  { icon: 'body-outline',         title: 'Head & Neck Oncologist',   role: 'Specialises in cancer of the oral cavity and throat',        when: 'If OSCC or suspicious malignancy is confirmed',                  tip: 'Ask about surgery, radiation, and chemotherapy options' },
  { icon: 'medkit-outline',       title: 'Medical Oncologist',       role: 'Manages chemotherapy and targeted drug therapy',             when: 'For advanced or metastatic oral cancer treatment',               tip: 'Discuss side effects and supportive care plans' },
  { icon: 'pulse-outline',        title: 'Radiation Oncologist',     role: 'Plans and delivers targeted radiation therapy',              when: 'As primary or adjuvant treatment after surgery',                 tip: 'Ask about IMRT (Intensity-Modulated Radiation Therapy)' },
  { icon: 'git-network-outline',  title: 'Genetic Counsellor',       role: 'Assesses hereditary cancer risk factors',                    when: 'If there is a family history of oral or head/neck cancers',      tip: 'Request BRCA and HPV genetic screening' },
];

export default function SpecialistsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1565C0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find a Specialist</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.intro}>
            Know which doctor to consult based on your risk level and symptoms.
          </Text>

          {specialists.map((s, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardIconCol}>
                <View style={styles.iconCircle}>
                  <Ionicons name={s.icon} size={22} color="#1565C0" />
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <Text style={styles.cardRole}>{s.role}</Text>
                <View style={styles.whenBadge}>
                  <Text style={styles.whenText}>When: {s.when}</Text>
                </View>
                <View style={styles.tipRow}>
                  <Ionicons name="chevron-forward" size={12} color="#D97706" />
                  <Text style={styles.tipText}>{s.tip}</Text>
                </View>
              </View>
            </View>
          ))}
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
  container:   { flex: 1, backgroundColor: '#F0F4F8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  backBtn:     { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: '#1A2B4A', fontSize: 17, fontWeight: '700' },
  content:     { padding: 20, paddingBottom: 40 },
  intro:       { color: '#64748B', fontSize: 13, lineHeight: 20, marginBottom: 16 },

  card: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderRadius: 16, padding: 16, marginBottom: 12, ...CARD_SHADOW,
  },
  cardIconCol: { marginRight: 14 },
  iconCircle:  { width: 48, height: 48, borderRadius: 14, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  cardBody:    { flex: 1 },
  cardTitle:   { color: '#1A2B4A', fontWeight: '700', fontSize: 15, marginBottom: 3 },
  cardRole:    { color: '#64748B', fontSize: 12, lineHeight: 17, marginBottom: 10 },
  whenBadge:   { backgroundColor: '#EFF6FF', borderRadius: 8, padding: 8, marginBottom: 8, borderWidth: 1, borderColor: '#BFDBFE' },
  whenText:    { color: '#1565C0', fontSize: 12, lineHeight: 17 },
  tipRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tipText:     { color: '#D97706', fontSize: 12, lineHeight: 17, flex: 1 },
});
