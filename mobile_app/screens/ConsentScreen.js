import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ConsentScreen({ navigation }) {
  const [patientId, setPatientId] = useState('');
  const [hasConsent, setHasConsent] = useState(false);

  const handleProceed = () => {
    if (patientId.trim().length === 0) {
      return Alert.alert('Missing Info', 'Please enter a Patient Number or Name.');
    }
    if (!hasConsent) {
      return Alert.alert('Consent Required', 'You must confirm the patient has provided consent for image screening.');
    }
    navigation.navigate('Scan', { patientId: patientId.trim() });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1565C0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Patient Setup</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>

          {/* Step 1 */}
          <View style={styles.stepCard}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>STEP 1</Text>
            </View>
            <Text style={styles.cardTitle}>Patient Identifier</Text>
            <Text style={styles.cardDesc}>Enter a unique ID, phone number, or name to track this screening in your records.</Text>

            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                placeholder="e.g. PAT-9042 or John Doe"
                placeholderTextColor="#CBD5E1"
                value={patientId}
                onChangeText={setPatientId}
              />
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.stepCard}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>STEP 2</Text>
            </View>
            <Text style={styles.cardTitle}>Clinical Consent</Text>
            <Text style={styles.cardDesc}>
              Confirm the patient understands this AI screening tool and has given consent to proceed.
            </Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.8}
              onPress={() => setHasConsent(!hasConsent)}
            >
              <View style={[styles.checkbox, hasConsent && styles.checkboxActive]}>
                {hasConsent && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxLabel}>
                I confirm that verbal or written consent has been obtained from the patient to capture and analyze oral cavity imagery for pre-screening purposes.
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.proceedBtn, (!hasConsent || !patientId.trim()) && styles.proceedBtnDisabled]}
            onPress={handleProceed}
            activeOpacity={0.85}
          >
            <Ionicons name="camera-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>Open Camera</Text>
          </TouchableOpacity>
        </View>

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

  content: { padding: 20 },

  stepCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, ...CARD_SHADOW,
  },
  stepBadge: {
    alignSelf: 'flex-start', backgroundColor: '#EFF6FF', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10,
  },
  stepBadgeText: { color: '#1565C0', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  cardTitle: { color: '#1A2B4A', fontSize: 17, fontWeight: '700', marginBottom: 6 },
  cardDesc:  { color: '#64748B', fontSize: 13, lineHeight: 20, marginBottom: 16 },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1,
    borderColor: '#E2E8F0', paddingHorizontal: 12, height: 52,
  },
  input: { flex: 1, color: '#1A2B4A', fontSize: 15, fontWeight: '500' },

  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#1565C0',
    marginRight: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0,
  },
  checkboxActive: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  checkboxLabel:  { color: '#475569', fontSize: 13, lineHeight: 20, flex: 1 },

  bottomBar: { backgroundColor: '#FFFFFF', padding: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  proceedBtn: {
    backgroundColor: '#1565C0', borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#1565C0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  proceedBtnDisabled: { backgroundColor: '#94A3B8' },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
