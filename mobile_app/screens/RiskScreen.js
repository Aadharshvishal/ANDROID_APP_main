import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const questions = [
  { id: 'q1', text: 'Do you currently smoke or chew tobacco?', weight: 4 },
  { id: 'q2', text: 'Did you use tobacco products regularly in the past?', weight: 2 },
  { id: 'q3', text: 'Do you consume alcohol more than 3 times a week?', weight: 2 },
  { id: 'q4', text: 'Have you ever chewed Betel Nut (Areca nut), Paan, or Gutka?', weight: 5 },
  { id: 'q5', text: 'Do you have a family history of oral or head/neck cancer?', weight: 3 },
  { id: 'q6', text: 'Have you noticed any persistent white/red patches in your mouth?', weight: 4 },
  { id: 'q7', text: 'Do you have sharp teeth or ill-fitting dentures that cause constant irritation?', weight: 3 },
  { id: 'q8', text: 'Have you had excessive sun exposure on your lips without protection?', weight: 1 },
];

const MAX_SCORE = questions.reduce((sum, q) => sum + q.weight, 0);

export default function RiskScreen({ navigation }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult]   = useState(null);

  const toggleAnswer = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const calculateRisk = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      alert('Please answer all questions before calculating your risk.');
      return;
    }

    let score = 0;
    questions.forEach(q => {
      if (answers[q.id]) score += q.weight;
    });

    const percentage = Math.round((score / MAX_SCORE) * 100);

    let level, color, message;
    if (percentage < 15) {
      level   = 'Low Risk';
      color   = '#2ECC71';
      message = 'Your lifestyle factors show a low risk for OSCC. Maintain good oral hygiene!';
    } else if (percentage < 45) {
      level   = 'Moderate Risk';
      color   = '#FFB347';
      message = 'You have some risk factors. Consider reducing tobacco/alcohol and get regular dental checkups.';
    } else {
      level   = 'High Risk';
      color   = '#FF4757';
      message = 'Your habits strongly increase OSCC risk. It is highly recommended to quit tobacco/betel nut and see a specialist for a checkup quickly.';
    }

    setResult({ score: percentage, level, color, message });
  };

  const reset = () => {
    setAnswers({});
    setResult(null);
  };

  return (
    <LinearGradient colors={['#0A0E1A', '#0D1B3E', '#0A0E1A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#4F8EF7" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Risk Questionnaire</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {!result ? (
            <>
              <Text style={styles.intro}>
                Answer these 8 simple questions to assess your lifestyle risk for Oral Cancer.
              </Text>

              {questions.map((q, i) => (
                <View key={q.id} style={styles.qCard}>
                  <Text style={styles.qText}>{i + 1}. {q.text}</Text>
                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={[styles.ansBtn, answers[q.id] === true && styles.ansBtnYes]}
                      onPress={() => toggleAnswer(q.id, true)}
                    >
                      <Text style={[styles.ansText, answers[q.id] === true && styles.ansTextActive]}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.ansBtn, answers[q.id] === false && styles.ansBtnNo]}
                      onPress={() => toggleAnswer(q.id, false)}
                    >
                      <Text style={[styles.ansText, answers[q.id] === false && styles.ansTextActive]}>No</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.calcBtn} onPress={calculateRisk}>
                <LinearGradient colors={['#4F8EF7', '#7C5CBF']} style={styles.calcGradient}>
                  <Text style={styles.calcText}>Calculate Risk Score</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.resultBox}>
              <Text style={styles.resTitle}>Your Lifestyle Risk Profile</Text>

              <View style={[styles.scoreCircle, { borderColor: result.color }]}>
                <Text style={[styles.scoreNum, { color: result.color }]}>{result.score}%</Text>
              </View>

              <Text style={[styles.resLevel, { color: result.color }]}>{result.level}</Text>
              <Text style={styles.resMsg}>{result.message}</Text>

              <TouchableOpacity style={[styles.recalcBtn, { borderColor: result.color }]} onPress={reset}>
                <Text style={[styles.recalcText, { color: result.color }]}>Retake Questionnaire</Text>
              </TouchableOpacity>
            </View>
          )}

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
  content:     { paddingHorizontal: 20, paddingBottom: 50 },

  intro: { color: '#8A9BB5', fontSize: 14, marginBottom: 20, lineHeight: 21 },

  qCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14,
    padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  qText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500', marginBottom: 14, lineHeight: 20 },
  btnRow: { flexDirection: 'row', gap: 10 },
  ansBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  ansBtnYes: { backgroundColor: 'rgba(255,71,87,0.2)', borderColor: '#FF4757' },
  ansBtnNo:  { backgroundColor: 'rgba(46,204,113,0.2)', borderColor: '#2ECC71' },
  ansText:   { color: '#8A9BB5', fontWeight: '600', fontSize: 14 },
  ansTextActive: { color: '#FFFFFF' },

  calcBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 10 },
  calcGradient: { paddingVertical: 16, alignItems: 'center' },
  calcText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },

  resultBox: { alignItems: 'center', paddingTop: 30 },
  resTitle:  { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 30 },
  scoreCircle: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 8, alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  scoreNum: { fontSize: 36, fontWeight: '900' },
  resLevel: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  resMsg:   { color: '#8A9BB5', fontSize: 15, lineHeight: 22, textAlign: 'center', paddingHorizontal: 10, marginBottom: 40 },
  recalcBtn: { borderRadius: 10, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 24 },
  recalcText: { fontWeight: '700', fontSize: 14 },
});
