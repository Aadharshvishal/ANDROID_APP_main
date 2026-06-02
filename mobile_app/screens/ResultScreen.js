import React, { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Animated, ScrollView, Dimensions, TextInput, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { saveHistoryEntry } from './HistoryScreen';

const { width } = Dimensions.get('window');

//  Per-Risk Medical Content 
const RISK_CONFIG = {
  'High Risk': {
    icon:        'alert-circle',
    label:       'High Risk of OSCC',
    bgColor:     '#FEF2F2',
    borderColor: '#FCA5A5',
    barColor:    '#DC2626',
    textColor:   '#DC2626',
    pillBg:      '#FEE2E2',
    recommendation: 'Immediate medical evaluation is strongly advised. Do not delay consulting a specialist.',
    whatToDo: [
      'Visit an oncologist or oral surgeon within 48 hours',
      'Request a biopsy of the suspicious lesion',
      'Bring this AI report to your doctor appointment',
      'Avoid tobacco, alcohol, and spicy foods immediately',
      'Contact the nearest cancer care centre now',
    ],
    prescriptionNote: 'Your doctor may prescribe a referral for tissue biopsy, PET scan, or CT imaging. Anti-inflammatory mouthwash may be recommended while awaiting results.',
    lifestyle: [
      'Stop smoking / tobacco use immediately',
      'Avoid all forms of alcohol',
      'Eat soft, non-spicy, nutritious food',
      'Maintain rigorous oral hygiene - brush gently twice daily',
      "Do not self-medicate without a doctor's advice",
    ],
  },
  'Suspicious': {
    icon:        'warning',
    label:       'Suspicious Lesion Detected',
    bgColor:     '#FFFBEB',
    borderColor: '#FCD34D',
    barColor:    '#D97706',
    textColor:   '#B45309',
    pillBg:      '#FEF3C7',
    recommendation: 'Further clinical examination is required. Book an appointment with a dentist or oral medicine specialist.',
    whatToDo: [
      'Visit a dentist or oral medicine specialist within 1 week',
      'Request an oral cytology / smear test if advised',
      'Schedule a follow-up evaluation in 2 weeks',
      'Monitor the lesion for any changes in size or colour',
      'Avoid tobacco and alcohol to reduce risk progression',
    ],
    prescriptionNote: 'Your clinician may prescribe an antiseptic or antifungal mouthwash (e.g., Chlorhexidine 0.2%). Vitamin B complex and zinc supplements may support tissue healing.',
    lifestyle: [
      'Reduce or quit tobacco and alcohol consumption',
      'Use a soft-bristled toothbrush',
      'Rinse mouth with warm saline water twice daily',
      'Eat a diet rich in fruits and vegetables (Vitamins A, C, E)',
      'Avoid chewing hard or sharp food items',
    ],
  },
  'Normal': {
    icon:        'checkmark-circle',
    label:       'Normal Oral Tissue',
    bgColor:     '#F0FDF4',
    borderColor: '#86EFAC',
    barColor:    '#16A34A',
    textColor:   '#15803D',
    pillBg:      '#DCFCE7',
    recommendation: 'No immediate concern detected. Maintain good oral hygiene and schedule routine check-ups.',
    whatToDo: [
      'Continue regular dental check-ups every 6 months',
      'Brush twice daily with fluoride toothpaste',
      'Floss daily to maintain gum health',
      'Eat a balanced diet rich in vitamins and minerals',
      'Repeat this AI screening every 3-6 months as a precaution',
    ],
    prescriptionNote: 'No prescription is required at this time. Consider using fluoride mouthwash as part of your daily oral care routine for best protection.',
    lifestyle: [
      'Avoid smoking and excessive alcohol',
      'Stay well hydrated - drink plenty of water',
      'Limit sugary foods and drinks',
      'Use a soft bristle toothbrush',
      'Visit your dentist for routine cleaning twice a year',
    ],
  },
};

export default function ResultScreen({ navigation, route }) {
  const { result, imageUri, patientId, isHistorical, savedNotes } = route.params;
  const config = RISK_CONFIG[result.risk_level] || RISK_CONFIG['Normal'];

  const [caseNotes, setCaseNotes] = React.useState(savedNotes || '');
  const [isSaved, setIsSaved]     = React.useState(isHistorical || false);

  const cardAnim  = useRef(new Animated.Value(0)).current;
  const barAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {

    Animated.sequence([
      Animated.parallel([
        Animated.timing(cardAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 5,   useNativeDriver: true }),
      ]),
      Animated.timing(barAnim, {
        toValue: result.confidence / 100,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const generatePDF = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
              h1 { color: #1a237e; border-bottom: 2px solid #1a237e; padding-bottom: 10px; }
              .box { border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin-bottom: 20px; background-color: #f8f9fa; }
              .risk { font-size: 24px; font-weight: bold; color: ${config.barColor}; }
              .conf { font-size: 20px; font-weight: bold; }
              ul { margin: 0; padding-left: 20px; }
              li { margin-bottom: 8px; }
              .footer { margin-top: 50px; font-size: 12px; color: #777; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; }
            </style>
          </head>
          <body>
            <h1>Proxenix Patient Analysis Report</h1>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            
            <div class="box">
              <h2>Diagnosis Summary</h2>
              <p>Risk Level: <span class="risk">${config.label}</span></p>
              <p>AI Confidence: <span class="conf">${result.confidence}%</span></p>
            </div>

            <div class="box">
              <h2>Medical Recommendation</h2>
              <p>${config.recommendation}</p>
            </div>

            <div class="box">
              <h2>Next Action Steps</h2>
              <ul>
                ${config.whatToDo.map(step => `<li>${step.substring(3)}</li>`).join('')}
              </ul>
            </div>

            <p><strong>Clinical Notes:</strong> ${caseNotes || 'None'}</p>
            
            <div class="footer">
              <p>Disclaimer: This is an AI-generated assessment tool for health workers. It DOES NOT replace clinical histopathology or a formal medical diagnosis. Always refer the patient for clinical biopsy if OSCC is suspected.</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) {
      console.error(e);
      Alert.alert('PDF Error', 'Could not generate PDF');
    }
  };

  const handleSaveRecord = async () => {
    if (isSaved) return;
    await saveHistoryEntry(result, imageUri, patientId, caseNotes);
    setIsSaved(true);
    Alert.alert('Record Saved', `Screening for ${patientId || 'Patient'} has been securely saved to the clinical log. You can now export the PDF if needed.`, [
      { text: 'OK', style: 'default' }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1565C0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analysis Result</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Image thumbnail */}
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.thumbnail} />
          )}

          {/* Risk Level Card */}
          <Animated.View
            style={[styles.riskCard, {
              backgroundColor: config.bgColor,
              borderColor:     config.borderColor,
              opacity:   cardAnim,
              transform: [{ scale: scaleAnim }],
            }]}
          >
            <Ionicons name={config.icon} size={52} color={config.textColor} style={{ marginBottom: 10 }} />
            <Text style={[styles.riskLabel, { color: config.textColor }]}>{config.label}</Text>

            {/* Patient Badge */}
            <View style={styles.patientBanner}>
              <Ionicons name="person-circle-outline" size={16} color="#475569" />
              <Text style={styles.patientBannerLabel}>Patient:</Text>
              <Text style={styles.patientBannerId}>{patientId || 'Unknown'}</Text>
            </View>

            <View style={styles.barContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={styles.barTitle}>AI Confidence</Text>
                <Text style={[styles.confidenceText, { color: config.textColor }]}>{result.confidence}%</Text>
              </View>
              <View style={styles.barTrack}>
                <Animated.View
                  style={[styles.barFill, {
                    backgroundColor: config.barColor,
                    width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                  }]}
                />
              </View>
            </View>
          </Animated.View>

          {/* Recommendation */}
          <Animated.View style={[styles.sectionCard, { opacity: cardAnim }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={18} color="#1565C0" />
              <Text style={styles.sectionTitle}>Recommendation</Text>
            </View>
            <Text style={styles.sectionBody}>{config.recommendation}</Text>
          </Animated.View>

          {/* What to Do Next */}
          <Animated.View style={[styles.sectionCard, { opacity: cardAnim }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={18} color="#1565C0" />
              <Text style={styles.sectionTitle}>What To Do Next</Text>
            </View>
            {config.whatToDo.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <Ionicons name="chevron-forward" size={14} color="#1565C0" style={{ marginRight: 8, marginTop: 4 }} />
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Prescription Note */}
          <Animated.View style={[styles.prescriptionCard, { opacity: cardAnim }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medkit-outline" size={18} color="#1565C0" />
              <Text style={[styles.sectionTitle, { color: '#1565C0' }]}>Prescription Note</Text>
            </View>
            <Text style={styles.sectionBody}>{config.prescriptionNote}</Text>
          </Animated.View>

          {/* Lifestyle Advice */}
          <Animated.View style={[styles.sectionCard, { opacity: cardAnim }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="leaf-outline" size={18} color="#16A34A" />
              <Text style={[styles.sectionTitle, { color: '#16A34A' }]}>Lifestyle Advice</Text>
            </View>
            {config.lifestyle.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Ionicons name="checkmark" size={14} color="#16A34A" style={{ marginRight: 8, marginTop: 3 }} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Disclaimer */}
          <Animated.View style={[styles.disclaimerCard, { opacity: cardAnim }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle-outline" size={16} color="#D97706" />
              <Text style={styles.disclaimerTitle}>Important Notice</Text>
            </View>
            <Text style={styles.disclaimerText}>
              This AI analysis is for early screening purposes only and is NOT a definitive medical diagnosis. Always consult a qualified oral medicine specialist, dentist, or oncologist for professional evaluation.
            </Text>
          </Animated.View>

          {/* Case Notes */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="create-outline" size={18} color="#475569" />
              <Text style={styles.sectionTitle}>Clinical Observations</Text>
            </View>
            <TextInput
              style={styles.notesInput}
              multiline
              numberOfLines={4}
              placeholder="Enter physical observations, lesion dimensions, or patient complaints..."
              placeholderTextColor="#CBD5E1"
              value={caseNotes}
              onChangeText={setCaseNotes}
              editable={!isSaved}
            />
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.saveBtn, isSaved && styles.saveBtnDone]}
            onPress={handleSaveRecord}
            disabled={isSaved}
            activeOpacity={0.85}
          >
            <Ionicons name={isSaved ? 'checkmark-done' : 'save-outline'} size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.saveBtnText}>
              {isSaved ? 'Record Saved' : 'Save Clinical Record'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pdfButton}
            onPress={generatePDF}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text-outline" size={18} color="#1565C0" style={{ marginRight: 8 }} />
            <Text style={styles.pdfButtonText}>Export PDF Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Ionicons name="home-outline" size={16} color="#94A3B8" style={{ marginRight: 6 }} />
            <Text style={styles.homeBtnText}>Return to Dashboard</Text>
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

  content: { padding: 20, paddingBottom: 50 },

  thumbnail: { width: '100%', height: 200, borderRadius: 16, marginBottom: 16 },

  riskCard: {
    borderRadius: 20, padding: 24, alignItems: 'center',
    borderWidth: 1.5, marginBottom: 16,
    ...CARD_SHADOW,
  },
  riskLabel: { fontSize: 19, fontWeight: '800', textAlign: 'center', marginBottom: 16 },

  patientBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.04)', paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 10, width: '100%', marginBottom: 20,
  },
  patientBannerLabel: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  patientBannerId:    { color: '#1A2B4A', fontSize: 14, fontWeight: '800', flex: 1 },

  barContainer:   { width: '100%' },
  barTitle:       { color: '#64748B', fontSize: 12, fontWeight: '600' },
  confidenceText: { fontSize: 18, fontWeight: '800' },
  barTrack: {
    width: '100%', height: 10, backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 5, overflow: 'hidden', marginTop: 6,
  },
  barFill: { height: '100%', borderRadius: 5 },

  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 12, ...CARD_SHADOW,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle:  { color: '#1A2B4A', fontWeight: '700', fontSize: 15 },
  sectionBody:   { color: '#475569', fontSize: 14, lineHeight: 22 },

  stepRow:  { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  stepText: { color: '#475569', fontSize: 14, lineHeight: 21, flex: 1 },

  prescriptionCard: {
    backgroundColor: '#EFF6FF', borderRadius: 16, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: '#BFDBFE', ...CARD_SHADOW,
  },

  tipRow:    { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 5 },
  tipText:   { color: '#475569', fontSize: 14, lineHeight: 21, flex: 1 },

  disclaimerCard: {
    backgroundColor: '#FFFBEB', borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#FDE68A', ...CARD_SHADOW,
  },
  disclaimerTitle: { color: '#92400E', fontWeight: '700', fontSize: 13, marginBottom: 6 },
  disclaimerText:  { color: '#78350F', fontSize: 12, lineHeight: 19 },

  notesInput: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12,
    color: '#1A2B4A', fontSize: 14, lineHeight: 21, backgroundColor: '#F8FAFC',
    minHeight: 100, textAlignVertical: 'top',
  },

  saveBtn: {
    backgroundColor: '#1565C0', borderRadius: 14, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, shadowColor: '#1565C0', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
  },
  saveBtnDone: { backgroundColor: '#16A34A' },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  pdfButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 15, marginBottom: 12,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#1565C0', ...CARD_SHADOW,
  },
  pdfButtonText: { color: '#1565C0', fontSize: 15, fontWeight: '700' },

  homeBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  homeBtnText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
});
