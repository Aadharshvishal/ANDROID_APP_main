import React, { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ActivityIndicator, Alert, Animated, Dimensions, ScrollView, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Asset } from 'expo-asset';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import { decode } from 'jpeg-js';
import { Buffer } from 'buffer';

const { width } = Dimensions.get('window');

export default function ScanScreen({ navigation, route }) {
  const { patientId } = route.params || {};

  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading]             = useState(false);
  const [model, setModel]                 = useState(null);
  const [modelStatus, setModelStatus]     = useState('Loading AI...');

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Load the model from the APK's internal assets
  useEffect(() => {
    let isMounted = true;
    async function initAI() {
      try {
        console.log("Loading Offline AI Model...");

        let modelToLoad;
        try {
          // STRATEGY 1: Require directly (Standard for Fast-TFLite)
          modelToLoad = require('../assets/OSCC_AI_Model.tflite');
        } catch (e) {
          console.warn("Direct require failed, trying Expo Asset...");
          // STRATEGY 2: Expo Asset (Fallback)
          const asset = Asset.fromModule(require('../assets/OSCC_AI_Model.tflite'));
          await asset.downloadAsync();
          modelToLoad = asset.localUri || asset.uri;
        }

        const loadedModel = await loadTensorflowModel(modelToLoad);

        if (isMounted) {
          setModel(loadedModel);
          setModelStatus('AI Ready');
          console.log("✅ Offline AI Model Ready");
        }
      } catch (e) {
        console.error("AI Load Error:", e);
        if (isMounted) {
          setModelStatus('AI Error');
          Alert.alert("AI Error", "Brain Loading Failed. Please restart the app. Error: " + e.message);
        }
      }
    }
    initAI();
    return () => { isMounted = false; };
  }, []);

  const showImage = (uri) => {
    setSelectedImage(uri);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6,   useNativeDriver: true }),
    ]).start();
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) showImage(result.assets[0].uri);
  };

  const openCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Required', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) showImage(result.assets[0].uri);
  };

  const analyseImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select or capture an oral image first.');
      return;
    }

    if (!model) {
      Alert.alert('AI Not Ready', 'The internal AI is still loading. Please wait a moment.');
      return;
    }

    setLoading(true);

    try {
      // 1. Resize image to 224x224 (required by model)
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        selectedImage,
        [{ resize: { width: 224, height: 224 } }],
        { format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      // 2. Convert Image to Pixel Data
      const base64Data = manipulatedImage.base64;
      const jpegBuffer = Buffer.from(base64Data, 'base64');
      const { data, width, height } = decode(jpegBuffer, { useTArray: true });

      // 3. Normalize pixels [0, 255] -> [0, 1] for Float32
      const float32Data = new Float32Array(width * height * 3);
      for (let i = 0; i < width * height; i++) {
        float32Data[i * 3 + 0] = data[i * 4 + 0] / 255.0; // Red
        float32Data[i * 3 + 1] = data[i * 4 + 1] / 255.0; // Green
        float32Data[i * 3 + 2] = data[i * 4 + 2] / 255.0; // Blue
      }

      // 4. Run Prediction
      const output = await model.run([float32Data]);
      const rawScore = output[0][0];

      // 5. Result Logic
      const THRESHOLD_HIGH = 0.85;
      const THRESHOLD_SUSPICIOUS = 0.60;

      let riskLevel, confidence, recommendation, colorCode;

      if (rawScore >= THRESHOLD_HIGH) {
        riskLevel = "High Risk";
        confidence = (rawScore * 100).toFixed(2);
        recommendation = "Immediate Medical Evaluation Advised";
        colorCode = "red";
      } else if (rawScore >= THRESHOLD_SUSPICIOUS) {
        riskLevel = "Suspicious";
        confidence = (rawScore * 100).toFixed(2);
        recommendation = "Further Clinical Examination Required";
        colorCode = "yellow";
      } else {
        riskLevel = "Normal";
        confidence = ((1 - rawScore) * 100).toFixed(2);
        recommendation = "No immediate concern. Routine check-up advised.";
        colorCode = "green";
      }

      const result = {
        risk_level: riskLevel,
        confidence: parseFloat(confidence),
        recommendation: recommendation,
        color_code: colorCode,
        raw_score: rawScore
      };

      navigation.navigate('Result', { result, imageUri: selectedImage, patientId });

    } catch (error) {
      console.error("AI Prediction failed:", error);
      Alert.alert('Analysis Failed', 'The internal AI failed to process this image. Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1565C0" />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Proxenix Scan</Text>
            <Text style={{ fontSize: 9, color: '#94A3B8', fontWeight: 'bold' }}>VERSION: PROXENIX-V2-OFFLINE-FIX</Text>
          </View>
          <View style={{ width: 40 }} />
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: model ? '#10B981' : '#F59E0B' }]} />
            <Text style={styles.statusText}>{model ? 'Offline' : 'Loading'}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Patient badge */}
          {patientId ? (
            <View style={styles.patientBadge}>
              <Ionicons name="person-circle-outline" size={18} color="#1565C0" />
              <Text style={styles.patientBadgeText}>Patient: {patientId}</Text>
            </View>
          ) : null}

          {/* Instructions */}
          <View style={styles.instructionCard}>
            <View style={styles.instructionHeader}>
              <Ionicons name="information-circle-outline" size={18} color="#1565C0" />
              <Text style={styles.instructionTitle}>Instructions</Text>
            </View>
            <Text style={styles.instructionText}>
              • Use a clear, well-lit photo of the oral cavity{`\n`}• Ensure the suspicious area is in focus{`\n`}• Avoid blurry or dark images for best accuracy
            </Text>
          </View>

          {/* Image Preview Area */}
          {selectedImage ? (
            <Animated.View style={[styles.imagePreviewWrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <TouchableOpacity style={styles.changeBtn} onPress={() => setSelectedImage(null)}>
                <Ionicons name="refresh-outline" size={14} color="#FFFFFF" />
                <Text style={styles.changeBtnText}>Change</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View style={styles.placeholderBox}>
              <Ionicons name="scan-outline" size={52} color="#CBD5E1" style={{ marginBottom: 12 }} />
              <Text style={styles.placeholderText}>No image selected</Text>
              <Text style={styles.placeholderSub}>Choose camera or gallery below</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionCard} onPress={openCamera} activeOpacity={0.8}>
              <View style={styles.actionIconCircle}>
                <Ionicons name="camera" size={28} color="#1565C0" />
              </View>
              <Text style={styles.actionLabel}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={pickFromGallery} activeOpacity={0.8}>
              <View style={styles.actionIconCircle}>
                <Ionicons name="images" size={28} color="#1565C0" />
              </View>
              <Text style={styles.actionLabel}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Analyse Button */}
          <TouchableOpacity
            style={[styles.analyseButton, (!selectedImage || loading) && styles.analyseButtonDisabled]}
            onPress={analyseImage}
            activeOpacity={0.85}
            disabled={loading || !selectedImage}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.analyseText}>  Analysing...</Text>
              </View>
            ) : (
              <Text style={styles.analyseText}>Analyse Image</Text>
            )}
          </TouchableOpacity>

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
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDot:   { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText:  { fontSize: 10, fontWeight: '600', color: '#64748B' },

  content: { padding: 20, paddingBottom: 40 },

  patientBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  patientBadgeText: { color: '#1565C0', fontSize: 13, fontWeight: '600', marginLeft: 6 },

  instructionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 16, ...CARD_SHADOW,
  },
  instructionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  instructionTitle:  { color: '#1565C0', fontWeight: '700', fontSize: 14, marginLeft: 6 },
  instructionText:   { color: '#64748B', fontSize: 13, lineHeight: 21 },

  placeholderBox: {
    height: 220, borderRadius: 16, marginBottom: 16,
    backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E2E8F0',
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', ...CARD_SHADOW,
  },
  placeholderText: { color: '#94A3B8', fontSize: 15, fontWeight: '600' },
  placeholderSub:  { color: '#CBD5E1', fontSize: 12, marginTop: 4 },

  imagePreviewWrapper: { marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  previewImage: { width: '100%', height: 240, borderRadius: 16 },
  changeBtn: {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 16,
    paddingVertical: 6, paddingHorizontal: 12, gap: 4,
  },
  changeBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  actionRow:        { flexDirection: 'row', gap: 14, marginBottom: 20 },
  actionCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14,
    paddingVertical: 20, alignItems: 'center', ...CARD_SHADOW,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  actionIconCircle: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  actionLabel: { color: '#1A2B4A', fontSize: 14, fontWeight: '700' },

  analyseButton: {
    backgroundColor: '#1565C0', borderRadius: 14, paddingVertical: 18,
    alignItems: 'center', shadowColor: '#1565C0', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  analyseButtonDisabled: { backgroundColor: '#94A3B8' },
  analyseText:           { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  loadingRow:            { flexDirection: 'row', alignItems: 'center' },
});
