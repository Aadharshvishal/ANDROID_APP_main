import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

const SESSION_KEY = '@oscc_worker_id';
const PINS_KEY    = '@oscc_worker_pins'; // { "WORKER_01": "1234", ... }

export const AuthProvider = ({ children }) => {
  const [workerId, setWorkerId]   = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedId = await AsyncStorage.getItem(SESSION_KEY);
        if (storedId) setWorkerId(storedId);
      } catch (e) {
        console.error('Failed to load session:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const getPins = async () => {
    const stored = await AsyncStorage.getItem(PINS_KEY);
    return stored ? JSON.parse(stored) : {};
  };

  const savePins = async (pins) => {
    await AsyncStorage.setItem(PINS_KEY, JSON.stringify(pins));
  };

  /** Check if a Worker ID already has a PIN registered */
  const hasAccount = async (id) => {
    const pins = await getPins();
    return !!pins[id.trim().toUpperCase()];
  };

  /** First-time PIN setup — creates account for the worker */
  const setupPin = async (id, pin) => {
    try {
      const key = id.trim().toUpperCase();
      const pins = await getPins();
      if (pins[key]) return { success: false, error: 'Worker ID already has an account. Please sign in.' };
      pins[key] = pin;
      await savePins(pins);
      await AsyncStorage.setItem(SESSION_KEY, key);
      setWorkerId(key);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Setup failed. Please try again.' };
    }
  };

  /** Regular login — validates PIN for given Worker ID */
  const login = async (id, pin) => {
    try {
      const key  = id.trim().toUpperCase();
      const pins = await getPins();
      if (!pins[key]) return { success: false, error: 'no_account' };
      if (pins[key] !== pin) return { success: false, error: 'wrong_pin' };
      await AsyncStorage.setItem(SESSION_KEY, key);
      setWorkerId(key);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  /** Change PIN — requires the old PIN to verify identity */
  const changePin = async (oldPin, newPin) => {
    try {
      const pins = await getPins();
      if (!pins[workerId]) return { success: false, error: 'Account not found.' };
      if (pins[workerId] !== oldPin) return { success: false, error: 'Old PIN is incorrect.' };
      pins[workerId] = newPin;
      await savePins(pins);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Change failed. Please try again.' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setWorkerId(null);
  };

  return (
    <AuthContext.Provider value={{ workerId, isLoading, login, setupPin, changePin, hasAccount, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
