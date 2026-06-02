# OSCC Detect — Mobile App Setup Guide

AI-powered mobile app for early detection of Oral Squamous Cell Carcinoma (OSCC).

---

## Project Structure

```
d:/d/PDD/
├── code/
│   ├── CODE.py                ← Train the AI model (run this first)
│   └── Predictionmodel.py     ← Original local prediction script
├── backend/
│   ├── app.py                 ← Flask API server
│   ├── requirements.txt       ← Python dependencies
│   └── OSCC_AI_Model.h5       ← Trained model (copy here after training)
└── mobile_app/
    ├── App.js
    ├── config.js              ← ⚠️ Update your PC's IP address here!
    ├── screens/
    │   ├── HomeScreen.js
    │   ├── ScanScreen.js
    │   └── ResultScreen.js
    └── package.json
```

---

## STEP 1 — Train the Model (Skip if you already have OSCC_AI_Model.h5)

```powershell
cd d:/d/PDD/code
python CODE.py
```

After training, copy the generated `OSCC_AI_Model.h5` into `d:/d/PDD/backend/`.

---

## STEP 2 — Install & Run the Flask Backend

```powershell
cd d:/d/PDD/backend
pip install -r requirements.txt
python app.py
```

You should see:
```
✅ OSCC Model loaded successfully!
🚀 Starting OSCC Detection API on http://0.0.0.0:5000
```

---

## STEP 3 — Find Your PC's IP Address

Open PowerShell and run:
```powershell
ipconfig
```
Look for **IPv4 Address** under your Wi-Fi or Ethernet adapter, for example: `192.168.1.100`

Open `d:/d/PDD/mobile_app/config.js` and update:
```js
export const BACKEND_URL = "http://YOUR_IP_HERE:5000";
```

> ⚠️ Your phone and PC must be on the **same Wi-Fi network**.

---

## STEP 4 — Install Node.js (Required for the mobile app)

Download and install **Node.js LTS** from: https://nodejs.org

After installing, restart PowerShell and verify:
```powershell
node --version
npm --version
```

---

## STEP 5 — Install Expo Go on Your Phone

- **Android**: [Download from Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS**: [Download from App Store](https://apps.apple.com/app/expo-go/id982107779)

---

## STEP 6 — Run the Mobile App

```powershell
cd d:/d/PDD/mobile_app
npm install
npx expo start
```

A QR code will appear in the terminal.

- **Android**: Open **Expo Go** app → Scan QR code
- **iOS**: Open the **Camera** app → Scan QR code

---

## How to Use the App

1. Open the app → Tap **"Start Scan"**
2. Choose **Camera** or **Gallery** to select an oral image
3. Tap **"Analyse Image"**
4. View your result:
   - 🔴 **High Risk** — Immediate Medical Evaluation Advised
   - 🟡 **Suspicious** — Further Clinical Examination Required
   - 🟢 **Normal** — Routine check-up advised

---

## Testing the Backend (Optional)

Test the API without the app using PowerShell:
```powershell
curl -X POST http://localhost:5000/predict -F "image=@C:\path\to\test_image.jpg"
```

Expected response:
```json
{
  "risk_level": "Normal",
  "confidence": 78.34,
  "recommendation": "No immediate concern. Routine check-up advised.",
  "color_code": "green",
  "raw_score": 0.2166
}
```

---

> ⚠️ **Disclaimer**: This app is for screening purposes only and is NOT a substitute for professional medical diagnosis.
