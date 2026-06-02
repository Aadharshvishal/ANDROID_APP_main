import React from 'react';
import { Ionicons } from '@expo/vector-icons';
//  from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const eatFoods = [
  { icon: '', name: 'Leafy Greens & Broccoli', benefit: 'Rich in folate and antioxidants that protect oral cells' },
  { icon: '', name: 'Sweet Potato & Carrots', benefit: 'High in beta-carotene (Vitamin A)  supports mucosal healing' },
  { icon: '', name: 'Berries (Blueberry, Strawberry)', benefit: 'Powerful antioxidants that fight free radical damage' },
  { icon: '', name: 'Fatty Fish (Salmon, Tuna)', benefit: 'Omega-3 fatty acids reduce inflammation' },
  { icon: '', name: 'Garlic & Turmeric', benefit: 'Natural anti-inflammatory and antimicrobial properties' },
  { icon: '', name: 'Eggs & Lean Protein', benefit: 'Supports tissue repair and immune function' },
  { icon: '', name: 'Green Tea', benefit: 'Contains EGCG  a potent anti-cancer compound' },
  { icon: '', name: 'Yoghurt (Probiotic)', benefit: 'Balances oral microbiome, reduces harmful bacteria' },
];

const avoidFoods = [
  { icon: '', name: 'Tobacco (any form)', reason: 'Major carcinogen  strongly linked to OSCC development' },
  { icon: '', name: 'Alcohol', reason: 'Increases cancer risk, especially combined with tobacco' },
  { icon: '', name: 'Spicy & Acidic Foods', reason: 'Irritates oral mucosa and worsens existing lesions' },
  { icon: '', name: 'Sugary Snacks & Drinks', reason: 'Promotes bacterial growth and oral inflammation' },
  { icon: '', name: 'Red & Processed Meats', reason: 'Linked to increased cancer risk when consumed in excess' },
  { icon: '', name: 'Deep Fried / Junk Food', reason: 'High in harmful fats, low in protective nutrients' },
];

export default function DietScreen({ navigation }) {
  return (
    <LinearGradient colors={['#0A0E1A', '#0D1B3E', '#0A0E1A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#4F8EF7" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Diet & Nutrition</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Eat Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}></Text>
            <Text style={[styles.sectionTitle, { color: '#2ECC71' }]}>Foods to Eat</Text>
          </View>
          {eatFoods.map((f, i) => (
            <View key={i} style={[styles.foodCard, styles.eatCard]}>
              <Text style={styles.foodIcon}>{f.icon}</Text>
              <View style={styles.foodBody}>
                <Text style={styles.foodName}>{f.name}</Text>
                <Text style={styles.foodDetail}>{f.benefit}</Text>
              </View>
            </View>
          ))}

          <View style={styles.divider} />

          {/* Avoid Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}></Text>
            <Text style={[styles.sectionTitle, { color: '#FF6B7A' }]}>Foods to Avoid</Text>
          </View>
          {avoidFoods.map((f, i) => (
            <View key={i} style={[styles.foodCard, styles.avoidCard]}>
              <Text style={styles.foodIcon}>{f.icon}</Text>
              <View style={styles.foodBody}>
                <Text style={styles.foodName}>{f.name}</Text>
                <Text style={styles.foodDetail}>{f.reason}</Text>
              </View>
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
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 14, marginTop: 8,
  },
  sectionEmoji: { fontSize: 22, marginRight: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  divider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 24,
  },
  foodCard: {
    flexDirection: 'row', borderRadius: 14,
    padding: 14, marginBottom: 10,
    borderWidth: 1,
  },
  eatCard: {
    backgroundColor: 'rgba(46,204,113,0.07)',
    borderColor: 'rgba(46,204,113,0.2)',
  },
  avoidCard: {
    backgroundColor: 'rgba(255,71,87,0.07)',
    borderColor: 'rgba(255,71,87,0.2)',
  },
  foodIcon:   { fontSize: 28, marginRight: 14, alignSelf: 'center' },
  foodBody:   { flex: 1 },
  foodName:   { color: '#FFFFFF', fontWeight: '700', fontSize: 14, marginBottom: 4 },
  foodDetail: { color: '#8A9BB5', fontSize: 13, lineHeight: 19 },
});
