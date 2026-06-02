import React from 'react';
import { Ionicons } from '@expo/vector-icons';
//  from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const emergencyContacts = [
  { icon: '', name: 'National Cancer Helpline', number: '1800-11-6163', color: '#FF4757', note: 'Free helpline  24/7' },
  { icon: '', name: 'Medical Emergency', number: '108', color: '#FF6B7A', note: 'Ambulance & hospital emergency' },
  { icon: '', name: 'iCall Mental Health Support', number: '9152987821', color: '#7C5CBF', note: 'Emotional support for cancer patients' },
  { icon: '', name: 'Tata Memorial Cancer Centre', number: '022-24177000', color: '#4F8EF7', note: 'Mumbai  leading cancer hospital' },
  { icon: '', name: 'AIIMS Oncology OPD', number: '011-26588500', color: '#2ECC71', note: 'New Delhi  appointment line' },
  { icon: '', name: 'Cancer Patients Aid Association', number: '022-23514200', color: '#FFB347', note: 'Support, guidance, and second opinion' },
];

const faqs = [
  { q: 'What is OSCC?', a: 'Oral Squamous Cell Carcinoma (OSCC) is a type of cancer that starts in the flat cells lining the mouth. It is one of the most common head and neck cancers worldwide.' },
  { q: 'Is OSCC curable?', a: 'Yes, especially when detected early (Stage I or II). Survival rates exceed 80% with early treatment. This app helps with early detection.' },
  { q: 'How fast does OSCC spread?', a: 'OSCC progression varies. Without treatment, it can spread to lymph nodes and distant organs within months to years. Early detection is vital.' },
  { q: 'Can OSCC come back after treatment?', a: 'Recurrence is possible, especially in the first 2 years. Regular follow-ups and oral self-examinations are essential.' },
  { q: 'What causes OSCC?', a: 'Major causes include tobacco use (smoking/chewing), heavy alcohol consumption, HPV infection, and chronic sun exposure on the lips.' },
];

export default function EmergencyScreen({ navigation }) {
  const callNumber = (number, name) => {
    Alert.alert(`Call ${name}?`, `This will dial ${number}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL(`tel:${number}`) },
    ]);
  };

  return (
    <LinearGradient colors={['#0A0E1A', '#0D1B3E', '#0A0E1A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#4F8EF7" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Emergency</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          <Text style={styles.sectionTitle}>  Emergency & Helpline Numbers</Text>
          {emergencyContacts.map((c, i) => (
            <TouchableOpacity key={i} style={styles.contactCard} onPress={() => callNumber(c.number, c.name)} activeOpacity={0.75}>
              <View style={[styles.iconCircle, { backgroundColor: c.color + '22' }]}>
                <Text style={styles.contactIcon}>{c.icon}</Text>
              </View>
              <View style={styles.contactBody}>
                <Text style={styles.contactName}>{c.name}</Text>
                <Text style={[styles.contactNumber, { color: c.color }]}>{c.number}</Text>
                <Text style={styles.contactNote}>{c.note}</Text>
              </View>
              <Text style={styles.callBtn}></Text>
            </TouchableOpacity>
          ))}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>  Frequently Asked Questions</Text>
          {faqs.map((f, i) => (
            <View key={i} style={styles.faqCard}>
              <Text style={styles.faqQ}>Q: {f.q}</Text>
              <Text style={styles.faqA}>A: {f.a}</Text>
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
  backBtn:      { width: 40, height: 40, justifyContent: 'center' },
  backArrow:    { color: '#4F8EF7', fontSize: 20, fontWeight: '700' },
  headerTitle:  { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  content:      { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { color: '#FFFFFF', fontWeight: '700', fontSize: 15, marginBottom: 14, marginTop: 4 },
  contactCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
  },
  iconCircle:    { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  contactIcon:   { fontSize: 22 },
  contactBody:   { flex: 1 },
  contactName:   { color: '#FFFFFF', fontWeight: '700', fontSize: 14, marginBottom: 2 },
  contactNumber: { fontWeight: '800', fontSize: 15, marginBottom: 2 },
  contactNote:   { color: '#8A9BB5', fontSize: 12 },
  callBtn:       { fontSize: 22 },
  divider:       { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 24 },
  faqCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12,
    padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  faqQ: { color: '#4F8EF7', fontWeight: '700', fontSize: 13, marginBottom: 6 },
  faqA: { color: '#8A9BB5', fontSize: 13, lineHeight: 20 },
});
