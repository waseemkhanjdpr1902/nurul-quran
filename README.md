# Nur al-Huda: Islamic Spiritual Guidance Platform

Nur al-Huda is a full-stack spiritual guidance platform built with React, Vite, Express, and Tailwind CSS. It provides a sanctuary for Quranic study, Hadith reflection, and the path of Tasawwuf.

## Features

- **Quranic Study**: Full Quran with Arabic text, translations, and audio recitations.
- **Hadith Collection**: Searchable database of authentic traditions.
- **Daily Azkar**: Morning, evening, and daily litanies (Wird) with interactive counters.
- **Tasawwuf Guidance**: Articles on spiritual growth and Muraqaba (meditation) guides.
- **AI Spiritual Guide**: A compassionate AI assistant powered by Gemini to answer spiritual questions.
- **Donations**: Secure one-time and recurring support via Razorpay.

## Setup Instructions

### 1. Environment Variables
Create a `.env` file (or use the Secrets panel in AI Studio) with the following:
- `GEMINI_API_KEY`: Your Google AI Studio API key.
- `VITE_RAZORPAY_KEY_ID`: Your Razorpay Test/Live Key ID.
- `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret.
- `MONGODB_URI`: (Optional) Your MongoDB connection string.

### 2. Installation
The dependencies are already managed by the platform. If running locally:
```bash
npm install
```

### 3. Development
Start the full-stack development server:
```bash
npm run dev
```

### 4. Deployment
The app is ready for deployment on Cloud Run or Vercel. Ensure all environment variables are set in your hosting provider's dashboard.

## Technology Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion.
- **Backend**: Express.js (Node.js).
- **AI**: Google Gemini API.
- **Payments**: Razorpay.
- **Icons**: Lucide React.
