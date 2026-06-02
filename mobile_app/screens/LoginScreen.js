import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

// Two modes: 'login' or 'setup'
export default function LoginScreen() {
  const { login, setupPin, hasAccount } = useContext(AuthContext);

  const [mode, setMode]           = useState('login');  // 'login' | 'setup'
  const [workerId, setWorkerId]   = useState('');
  const [pin, setPin]             = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin]     = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const reset = () => { setPin(''); setConfirmPin(''); setError(''); };

  const switchMode = (m) => { setMode(m); reset(); };

  const handleLogin = async () => {
    setError('');
    if (!workerId.trim()) return setError('Please enter your Worker ID.');
    if (!pin)             return setError('Please enter your PIN.');

    setLoading(true);
    const result = await login(workerId, pin);
    setLoading(false);

    if (result.success) return;

    if (result.error === 'no_account') {
      Alert.alert(
        'No Account Found',
        `"${workerId.toUpperCase()}" does not have a PIN yet.\n\nWould you like to create one?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Account', onPress: () => switchMode('setup') },
        ]
      );
    } else {
      setError('Incorrect PIN. Please try again.');
    }
  };

  const handleSetup = async () => {
    setError('');
    if (!workerId.trim())     return setError('Please enter your Worker ID.');
    if (pin.length < 4)       return setError('PIN must be at least 4 digits.');
    if (pin !== confirmPin)   return setError('PINs do not match. Please re-enter.');

    setLoading(true);
    // Check if already has account
    const exists = await hasAccount(workerId);
    if (exists) {
      setLoading(false);
      setError('This Worker ID already has an account. Please sign in.');
      return;
    }

    const result = await setupPin(workerId, pin);
    setLoading(false);

    if (!result.success) setError(result.error);
  };

  const isLogin = mode === 'login';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Brand */}
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.appName}>Proxenix</Text>
        <Text style={styles.appSub}>Clinical Screening Portal</Text>
      </View>

      <View style={styles.formCard}>
        {/* Mode tabs */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.tab, isLogin && styles.tabActive]}
            onPress={() => switchMode('login')}
          >
            <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isLogin && styles.tabActive]}
            onPress={() => switchMode('setup')}
          >
            <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.formSub}>
          {isLogin ? 'Enter your registered Worker ID and PIN.' : 'First time? Set your personal PIN.'}
        </Text>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#C62828" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Worker ID */}
        <Text style={styles.label}>Worker ID</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Dr_Smith or Worker_01"
            placeholderTextColor="#CBD5E1"
            value={workerId}
            onChangeText={(t) => { setWorkerId(t); setError(''); }}
            autoCapitalize="words"
          />
        </View>

        {/* PIN */}
        <Text style={styles.label}>{isLogin ? 'PIN' : 'Create PIN (min. 4 digits)'}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={isLogin ? 'Enter your PIN' : 'Choose a secure PIN'}
            placeholderTextColor="#CBD5E1"
            value={pin}
            onChangeText={(t) => { setPin(t); setError(''); }}
            secureTextEntry={!showPin}
            keyboardType="number-pad"
          />
          <TouchableOpacity onPress={() => setShowPin(!showPin)} style={styles.eyeBtn}>
            <Ionicons name={showPin ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Confirm PIN — only in setup mode */}
        {!isLogin && (
          <>
            <Text style={styles.label}>Confirm PIN</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Re-enter your PIN"
                placeholderTextColor="#CBD5E1"
                value={confirmPin}
                onChangeText={(t) => { setConfirmPin(t); setError(''); }}
                secureTextEntry={!showPin}
                keyboardType="number-pad"
              />
            </View>
          </>
        )}

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.75 }]}
          onPress={isLogin ? handleLogin : handleSetup}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isLogin ? 'Sign In Securely' : 'Create Account & Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Hint for login mode */}
        {isLogin && (
          <Text style={styles.hint}>
            New here? Switch to "Create Account" to register.
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>For authorised clinical use only</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F4F8', justifyContent: 'center', paddingHorizontal: 24 },

  brandSection: { alignItems: 'center', marginBottom: 28 },
  logoContainer: {
    width: 100, height: 100,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 4, overflow: 'hidden'
  },
  logoImage: { width: '100%', height: '100%' },
  appName: { fontSize: 26, fontWeight: '800', color: '#1A2B4A', letterSpacing: 0.3 },
  appSub:  { fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: '500' },

  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
  },

  modeTabs: {
    flexDirection: 'row', backgroundColor: '#F0F4F8',
    borderRadius: 12, padding: 4, marginBottom: 18,
  },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10,
  },
  tabActive:     { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText:       { color: '#94A3B8', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#1565C0', fontWeight: '700' },

  formSub: { fontSize: 13, color: '#94A3B8', marginBottom: 16 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2',
    borderRadius: 10, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { color: '#C62828', fontSize: 13, marginLeft: 8, flex: 1 },

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

  hint: { color: '#CBD5E1', fontSize: 11, textAlign: 'center', marginTop: 14 },

  footer:     { alignItems: 'center', marginTop: 28 },
  footerText: { color: '#94A3B8', fontSize: 11 },
});
