# Vida Plena Backend Setup Guide

This document provides instructions for setting up the backend services for Vida Plena, including authentication, database, and payment processing.

## Prerequisites

- Node.js 16+ and npm/yarn
- Firebase account (https://firebase.google.com)
- Stripe account (https://stripe.com)
- Expo account (for deployment)

## Phase 1: Firebase Setup (Authentication & Realtime Database)

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name the project: `vida-plena`
4. Disable Google Analytics (optional)
5. Create the project

### 1.2 Set Up Firebase Authentication

1. Go to **Authentication** > **Sign-in method**
2. Enable these providers:
   - Email/Password
   - Google (optional, for social login)
   - Apple (optional, for iOS)

### 1.3 Set Up Realtime Database

1. Go to **Realtime Database**
2. Click "Create Database"
3. Choose region closest to your user base (e.g., Europe-west1 for Spain)
4. Start in **test mode**
5. Create the database

### 1.4 Database Structure

Create the following structure in Firebase:

```
users/
  {uid}/
    name: "John Doe"
    email: "john@example.com"
    avatar: "url"
    health_goals: ["stress_management", "work_balance"]
    created_at: timestamp
    language: "en"

specialists/
  {specialistId}/
    name: "Dr. Maria García"
    specialty: "psychologist"
    bio: "..."
    rating: 4.9
    reviews: 284
    price_per_session: 60
    availability: ["09:00", "10:00", "14:00"]
    created_at: timestamp

sessions/
  {sessionId}/
    user_id: "uid"
    specialist_id: "specialistId"
    date: timestamp
    time: "14:00"
    duration: 60
    notes: "..."
    status: "confirmed" | "completed" | "cancelled"
    video_call_url: "zoom_url"
    amount_paid: 60
    created_at: timestamp

payments/
  {paymentId}/
    user_id: "uid"
    session_id: "sessionId"
    amount: 60
    currency: "EUR"
    stripe_charge_id: "ch_..."
    status: "succeeded" | "failed"
    created_at: timestamp
```

### 1.5 Firebase Security Rules

Update your database rules in **Realtime Database** > **Rules**:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "specialists": {
      ".read": true,
      ".write": false
    },
    "sessions": {
      ".read": "root.child('users').child(auth.uid).exists()",
      ".write": "root.child('users').child(auth.uid).exists()"
    },
    "payments": {
      ".read": "root.child('users').child(auth.uid).exists()",
      ".write": false
    }
  }
}
```

## Phase 2: Firebase Config for React Native

### 2.1 Install Dependencies

```bash
npm install firebase @react-native-async-storage/async-storage
npx expo install expo-constants
```

### 2.2 Create Firebase Config File

Create `src/services/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  databaseURL: 'https://YOUR_PROJECT.firebaseio.com',
  projectId: 'YOUR_PROJECT',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
```

Get your config values from Firebase Console > Project Settings.

### 2.3 Update AuthScreen.js

```javascript
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// In LoginScreen component:
const handleLogin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Update app auth state
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  } catch (error) {
    setError(error.message);
  }
};

// In SignUpScreen component:
const handleSignUp = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const uid = userCredential.user.uid;
    
    // Save user profile
    await database.ref('users/' + uid).set({
      name: formData.name,
      email: formData.email,
      created_at: new Date().toISOString(),
      language: 'en',
    });
    
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  } catch (error) {
    setError(error.message);
  }
};
```

## Phase 3: Stripe Payment Integration

### 3.1 Install Stripe Dependencies

```bash
npm install @stripe/stripe-react-native
npx expo install expo-crypto
```

### 3.2 Create Stripe Config

Create `src/services/stripe.js`:

```javascript
import { initStripe } from '@stripe/stripe-react-native';

export const initializeStripe = async () => {
  await initStripe({
    publishableKey: 'pk_test_YOUR_STRIPE_KEY',
  });
};

export const createPaymentIntent = async (amount, userId, sessionId) => {
  // Call your backend to create payment intent
  const response = await fetch('YOUR_BACKEND_URL/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      user_id: userId,
      session_id: sessionId,
    }),
  });
  
  return response.json();
};
```

### 3.3 Update PaymentScreen.js

```javascript
import { useStripe } from '@stripe/stripe-react-native';
import { createPaymentIntent } from '../services/stripe';

export const PaymentScreen = ({ route, navigation }) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  
  const handlePayment = async () => {
    try {
      // Create payment intent
      const { clientSecret } = await createPaymentIntent(
        totalPrice,
        userId,
        bookingDetails.session_id
      );
      
      // Initialize payment sheet
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Vida Plena',
      });
      
      if (error) {
        setError(error.message);
        return;
      }
      
      // Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();
      
      if (paymentError) {
        setError(paymentError.message);
      } else {
        navigation.navigate('PaymentSuccess', { bookingDetails });
      }
    } catch (err) {
      setError(err.message);
    }
  };
};
```

## Phase 4: Backend API (Node.js + Express)

### 4.1 Create Backend Server

Create a new directory `backend/` with:

```bash
npm init -y
npm install express stripe firebase-admin dotenv cors
```

### 4.2 Create `.env` File

```
PORT=5000
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY=your-key
FIREBASE_CLIENT_EMAIL=your-email
FIREBASE_DATABASE_URL=https://your-db.firebaseio.com
```

### 4.3 Create Payment Endpoint

Create `routes/payments.js`:

```javascript
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, user_id, session_id } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        user_id,
        session_id,
      },
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // Update session status in Firebase
    // Send confirmation email
  }
  
  res.json({received: true});
});

module.exports = router;
```

## Phase 5: Environment Setup in React Native

### 5.1 Create Environment Config

Create `src/config/environment.js`:

```javascript
export const ENV = {
  dev: {
    firebaseConfig: {
      apiKey: 'dev-key',
      projectId: 'vida-plena-dev',
      databaseURL: 'https://vida-plena-dev.firebaseio.com',
    },
    stripeKey: 'pk_test_dev',
    backendUrl: 'http://localhost:5000',
  },
  prod: {
    firebaseConfig: {
      apiKey: 'prod-key',
      projectId: 'vida-plena',
      databaseURL: 'https://vida-plena.firebaseio.com',
    },
    stripeKey: 'pk_live_prod',
    backendUrl: 'https://api.vidaplena.es',
  },
};

export const getEnv = () => {
  if (__DEV__) return ENV.dev;
  return ENV.prod;
};
```

## Phase 6: Testing

### 6.1 Firebase Test Data

Add sample specialists to your database:

```javascript
import { database } from './services/firebase';

const testSpecialists = [
  {
    id: '1',
    name: 'Dr. María García',
    specialty: 'Psychologist',
    rating: 4.9,
    reviews: 284,
    price_per_session: 60,
  },
  // ... more specialists
];

testSpecialists.forEach(specialist => {
  database.ref('specialists/' + specialist.id).set(specialist);
});
```

### 6.2 Stripe Test Cards

Use these test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

## Phase 7: Deployment

### 7.1 Deploy Backend

Deploy to Heroku, AWS, or your preferred platform.

### 7.2 Build for iOS/Android

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Submit for review
eas submit --platform ios --latest
```

## Monitoring & Analytics

### 7.3 Add Firebase Analytics

```bash
npm install firebase-analytics
```

```javascript
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics(app);
logEvent(analytics, 'book_session', { specialist_id: id });
```

## Troubleshooting

### Firebase Connection Issues
- Verify security rules allow read/write
- Check project ID matches config
- Ensure Firebase Realtime Database is created

### Stripe Integration Issues
- Verify publishable key is correct
- Check webhook endpoint is registered
- Test with Stripe test mode first

### Authentication Issues
- Clear AsyncStorage: `AsyncStorage.clear()`
- Check auth state listeners are set up
- Verify email/password provider is enabled

## Next Steps

1. ✅ Set up Firebase
2. ✅ Configure Stripe
3. ⏳ Implement video call integration (Agora/Twilio)
4. ⏳ Set up email notifications (SendGrid/AWS SES)
5. ⏳ Add push notifications
6. ⏳ Implement admin dashboard for specialists
7. ⏳ Set up analytics and monitoring

## Support

For issues, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Integration Guide](https://stripe.com/docs/mobile/react-native)
- [React Navigation Docs](https://reactnavigation.org)
