import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function ChangePinScreen({ navigation }) {
  const { workerId, changePin } = useContext(AuthContext);

  const [oldPin, setOldPin]       = useState('');
  const [newPin, setNewPin]       = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleChange = async () => {
    setError('');
    if (!oldPin)                    return setError('Please enter your current PIN.');
    if (newPin.length < 4)          return setError('New PIN must be at least 4 digits.');
    if (newPin === oldPin)          return setError('New PIN must be different from your current PIN.');
    if (newPin !== confirmPin)      return setError('New PINs do not match. Please re-enter.');

    setLoading(true);
    const result = await changePin(oldPin, newPin);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'PIN Changed',
        'Your PIN has been updated successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      setError(result.error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1565C0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change PIN</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Info banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="person-circle-outline" size={20} color="#1565C0" />
            <Text style={styles.infoText}>Changing PIN for: <Text style={styles.infoWorker}>{workerId}</Text></Text>
          </View>

          <View style={styles.card}>
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#C62828" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Old PIN */}
            <Text style={styles.label}>Current PIN</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your current PIN"
                placeholderTextColor="#CBD5E1"
                value={oldPin}
                onChangeText={(t) => { setOldPin(t); setError(''); }}
                secureTextEntry={!showPins}
                keyboardType="number-pad"
              />
              <TouchableOpacity onPress={() => setShowPins(!showPins)} style={styles.eyeBtn}>
                <Ionicons name={showPins ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* New PIN */}
            <Text style={styles.label}>New PIN (min. 4 digits)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-open-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Choose a new PIN"
                placeholderTextColor="#CBD5E1"
                value={newPin}
                onChangeText={(t) => { setNewPin(t); setError(''); }}
                secureTextEntry={!showPins}
                keyboardType="number-pad"
              />
            </View>

            {/* Confirm New PIN */}
            <Text style={styles.label}>Confirm New PIN</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-open-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Re-enter new PIN"
                placeholderTextColor="#CBD5E1"
                value={confirmPin}
                onChangeText={(t) => { setConfirmPin(t); setError(''); }}
                secureTextEntry={!showPins}
                keyboardType="number-pad"
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.75 }]}
              onPress={handleChange}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Update PIN</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            After changing, use your new PIN on the next login.
          </Text>
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

  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EFF6FF', borderRadius: 12,
    padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  infoText:   { color: '#475569', fontSize: 13, fontWeight: '500' },
  infoWorker: { color: '#1565C0', fontWeight: '700' },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, ...CARD_SHADOW,
  },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2',
    borderRadius: 10, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { color: '#C62828', fontSize: 13, marginLeft: 8, flex: 1 },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },

  label: { color: '#475569', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1,
    borderColor: '#E2E8F0', paddingHorizontal: 12, marginBottom: 16, height: 52,
  },
  inputIcon: { marginRight: 8 },
  input:     { flex: 1, color: '#1A2B4A', fontSize: 15, fontWeight: '500' },
  eyeBtn:    { padding: 4 },

  submitBtn: {
    backgroundColor: '#1565C0', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 4,
    shadowColor: '#1565C0', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  hint: { color: '#94A3B8', fontSize: 12, textAlign: 'center', marginTop: 20 },
});
