import React from 'react';
import { Ionicons } from '@expo/vector-icons';
//  from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const steps = [
  { step: '1', icon: '', title: 'Brush Properly', detail: 'Use a soft-bristled toothbrush. Brush gently for 2 minutes, twice a day  morning and night. Use small circular motions and angle the brush at 45 to the gumline.' },
  { step: '2', icon: '', title: 'Floss Daily', detail: 'Floss between each tooth at least once a day to remove plaque and food particles that your brush cannot reach. Use a C-shape motion around each tooth.' },
  { step: '3', icon: '', title: 'Rinse with Mouthwash', detail: 'Use an antiseptic mouthwash (e.g., Chlorhexidine 0.2% or alcohol-free Listerine) for 30 seconds after brushing. Do not eat or drink for 30 minutes after rinsing.' },
  { step: '4', icon: '', title: 'Clean Your Tongue', detail: 'Use a tongue scraper or the back of your toothbrush to clean your tongue gently every morning. This reduces bad breath and harmful bacteria.' },
  { step: '5', icon: '', title: 'Self-Examine Monthly', detail: 'Stand in front of a mirror with good lighting. Check your lips, gums, inner cheeks, tongue (top and bottom), and roof of mouth. Look for any white/red patches, ulcers, or swelling that does not heal in 2 weeks.' },
  { step: '6', icon: '', title: 'Professional Cleaning', detail: 'Visit your dentist every 6 months for professional scaling and polishing. This removes hardened tartar that cannot be removed by brushing alone.' },
  { step: '7', icon: '', title: 'Stay Hydrated', detail: 'Drink at least 8 glasses of water daily. Dry mouth reduces saliva, which protects teeth and oral mucosa. Avoid caffeine and alcohol which cause dehydration.' },
  { step: '8', icon: '', title: 'Avoid Harmful Habits', detail: 'Stop tobacco use (smoking, chewing, gutka, paan) and limit alcohol. These are the top two risk factors for oral cancer. Seek help from a cessation centre if needed.' },
];

const oralCancerSigns = [
  'A sore or ulcer in the mouth that does not heal within 2 weeks',
  'White or red patch on the gums, tongue, or inner cheek',
  'Unexplained bleeding in the mouth',
  'Difficulty chewing, swallowing, or speaking',
  'A lump or swelling on the lip, cheek, or neck',
  'Numbness or pain in the mouth without clear cause',
];

export default function OralHygieneScreen({ navigation }) {
  return (
    <LinearGradient colors={['#0A0E1A', '#0D1B3E', '#0A0E1A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#4F8EF7" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Oral Hygiene Guide</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          <Text style={styles.subtitle}>Follow these 8 steps every day for optimal oral health</Text>

          {steps.map((s, i) => (
            <View key={i} style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNum}>{s.step}</Text>
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>{s.icon}  {s.title}</Text>
                <Text style={styles.stepDetail}>{s.detail}</Text>
              </View>
            </View>
          ))}

          <View style={styles.warnCard}>
            <Text style={styles.warnTitle}>  Warning Signs  See a Doctor If You Notice:</Text>
            {oralCancerSigns.map((sign, i) => (
              <View key={i} style={styles.signRow}>
                <Text style={styles.signBullet}></Text>
                <Text style={styles.signText}>{sign}</Text>
              </View>
            ))}
          </View>

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
  content:    { paddingHorizontal: 20, paddingBottom: 40 },
  subtitle:   { color: '#8A9BB5', fontSize: 13, marginBottom: 20, lineHeight: 20 },
  stepCard: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
  },
  stepBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#4F8EF7', alignItems: 'center',
    justifyContent: 'center', marginRight: 12, marginTop: 2,
  },
  stepNum:    { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  stepBody:   { flex: 1 },
  stepTitle:  { color: '#FFFFFF', fontWeight: '700', fontSize: 14, marginBottom: 6 },
  stepDetail: { color: '#8A9BB5', fontSize: 13, lineHeight: 20 },
  warnCard: {
    backgroundColor: 'rgba(255,71,87,0.08)', borderRadius: 14,
    padding: 16, marginTop: 10,
    borderWidth: 1, borderColor: 'rgba(255,71,87,0.25)',
  },
  warnTitle:  { color: '#FF6B7A', fontWeight: '700', fontSize: 13, marginBottom: 12 },
  signRow:    { flexDirection: 'row', marginBottom: 8 },
  signBullet: { color: '#FF6B7A', marginRight: 8, fontSize: 16 },
  signText:   { color: '#C8D8F0', fontSize: 13, lineHeight: 19, flex: 1 },
});
