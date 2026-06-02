import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const hospitalTypes = [
  { icon: 'medkit-outline',    title: 'Cancer Hospitals Near Me',   subtitle: 'Find Oncology / Cancer Treatment Centres',     query: 'cancer hospital near me',              color: '#DC2626' },
  { icon: 'person-outline',    title: 'Oral Medicine Specialist',   subtitle: 'Find Oral Medicine Clinics & Oral Surgeons',    query: 'oral medicine specialist near me',      color: '#1565C0' },
  { icon: 'ear-outline',       title: 'ENT Surgeon (Head & Neck)',  subtitle: 'Find Head & Neck Surgery Specialists',          query: 'ENT head neck surgeon near me',         color: '#D97706' },
  { icon: 'medical-outline',   title: 'Dental & Biopsy Clinic',    subtitle: 'Clinics offering oral biopsy services',         query: 'dental biopsy clinic near me',          color: '#059669' },
  { icon: 'business-outline',  title: 'Government Cancer Centre',  subtitle: 'Free / subsidised cancer treatment',            query: 'government cancer centre near me',      color: '#7C3AED' },
  { icon: 'flask-outline',     title: 'Pathology Lab',             subtitle: 'For cytology, biopsy, and blood tests',        query: 'pathology lab near me',                 color: '#0891B2' },
];

const topHospitals = [
  { name: 'Tata Memorial Hospital',      city: 'Mumbai',           phone: '022-24177000' },
  { name: 'AIIMS Oncology Dept',         city: 'New Delhi',        phone: '011-26588500' },
  { name: 'Kidwai Memorial Institute',   city: 'Bengaluru',        phone: '080-26094000' },
  { name: 'Adyar Cancer Institute',      city: 'Chennai',          phone: '044-22350241' },
  { name: 'Regional Cancer Centre',      city: 'Thiruvananthapuram', phone: '0471-2442541' },
];

export default function HospitalFinderScreen({ navigation }) {
  const openMaps = (query) => {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Could not open Google Maps. Please install it.')
    );
  };

  const callHospital = (phone, name) => {
    Alert.alert(`Call ${name}?`, `This will dial ${phone}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1565C0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find Hospitals</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.intro}>
            Tap any card to open Google Maps and find the nearest specialist or hospital.
          </Text>

          <Text style={styles.sectionLabel}>Search Nearby</Text>
          {hospitalTypes.map((h, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.mapCard, { borderLeftColor: h.color }]}
              onPress={() => openMaps(h.query)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconCircle, { backgroundColor: h.color + '15' }]}>
                <Ionicons name={h.icon} size={22} color={h.color} />
              </View>
              <View style={styles.mapBody}>
                <Text style={[styles.mapTitle, { color: h.color }]}>{h.title}</Text>
                <Text style={styles.mapSub}>{h.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          ))}

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Top Cancer Hospitals in India</Text>
          {topHospitals.map((h, i) => (
            <TouchableOpacity
              key={i}
              style={styles.hospitalCard}
              onPress={() => callHospital(h.phone, h.name)}
              activeOpacity={0.75}
            >
              <View style={styles.hospitalLeft}>
                <Text style={styles.hospitalName}>{h.name}</Text>
                <Text style={styles.hospitalCity}>{h.city}</Text>
              </View>
              <View style={styles.phoneBox}>
                <Ionicons name="call-outline" size={14} color="#1565C0" />
                <Text style={styles.phoneNum}>{h.phone}</Text>
              </View>
            </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  backBtn:     { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: '#1A2B4A', fontSize: 17, fontWeight: '700' },
  content:     { padding: 20, paddingBottom: 40 },
  intro:       { color: '#64748B', fontSize: 13, marginBottom: 16, lineHeight: 20 },
  sectionLabel:{ color: '#475569', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  divider:     { height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 },

  mapCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderLeftWidth: 4, ...CARD_SHADOW,
  },
  iconCircle: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  mapBody:    { flex: 1 },
  mapTitle:   { fontWeight: '700', fontSize: 14, marginBottom: 2 },
  mapSub:     { color: '#64748B', fontSize: 12 },

  hospitalCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 12, padding: 14, marginBottom: 10, ...CARD_SHADOW,
  },
  hospitalLeft: { flex: 1 },
  hospitalName: { color: '#1A2B4A', fontWeight: '700', fontSize: 14, marginBottom: 3 },
  hospitalCity: { color: '#64748B', fontSize: 12 },
  phoneBox:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  phoneNum:     { color: '#1565C0', fontSize: 12, fontWeight: '600' },
});
