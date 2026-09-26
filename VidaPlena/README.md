# 🌿 Vida Plena - Mobile App

**Vida Plena** is a multi-language wellness marketplace app built with Expo and React Native. It connects users with real health specialists (therapists, coaches, nutritionists, yoga instructors) and provides wellness features for work-life balance.

## 🌍 Language Support
- 🇬🇧 **English** - Development language
- 🇪🇸 **Spanish** - Main market (Spain)
- 🇸🇦 **Arabic** - Arab community in Spain

## 📱 Tech Stack
- **Framework:** React Native + Expo 57
- **Navigation:** React Navigation 7 (Bottom Tab + Stack Navigators)
- **Internationalization:** i18next + react-i18next
- **State Management:** React Hooks + AsyncStorage
- **Styling:** React Native StyleSheet
- **Authentication:** Firebase Auth (TODO)
- **Database:** Firebase Realtime Database (TODO)
- **Payments:** Stripe (TODO)
- **Video Calls:** Agora/Twilio (TODO)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn installed
- Expo CLI installed (`npm install -g expo-cli`)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Run on Device/Emulator

```bash
# Android emulator
npm run android

# iOS simulator (macOS only)
npm run ios

# Web browser
npm run web
```

## 📚 Features Implemented

### ✅ Phase 1: Core UI & Navigation
- **Dashboard Screen**: Wellness stats, quick actions, daily tips
- **Therapy Screen**: Specialist marketplace with search and filters
- **Bottom Tab Navigation**: 5 tabs for all main features
- **Multi-Language Support**: English, Spanish, Arabic

### ✅ Phase 2: Complete User Flows
- **Authentication**: Login & signup screens with validation
- **Booking System**: Date/time selection, session duration, pricing
- **Payment Screen**: Card input, Stripe integration placeholder
- **Payment Success**: Confirmation and next steps
- **Session Management**: View upcoming/past sessions with actions
- **Community**: Support groups, challenges, discussions
- **Profile Settings**: User prefs, health goals, notifications

### ⏳ Phase 3: Backend Integration (In Progress)
- Firebase Authentication setup
- Firebase Realtime Database
- Stripe payment processing
- Email notifications
- Video call integration

### 📦 Project Structure

```
VidaPlena/
├── App.js                          # Main app component with navigation
├── index.js                        # Entry point
├── package.json                    # Dependencies
├── BACKEND_SETUP.md               # Backend integration guide
├── src/
│   ├── i18n/
│   │   ├── config.js              # i18next configuration
│   │   └── translations.js        # EN, ES, AR translations (300+ strings)
│   ├── screens/
│   │   ├── AuthScreen.js          # Login & signup
│   │   ├── DashboardScreen.js     # Home screen
│   │   ├── TherapyScreen.js       # Specialist marketplace
│   │   ├── BookingScreen.js       # Session booking
│   │   ├── PaymentScreen.js       # Payment processing
│   │   ├── PaymentSuccessScreen.js # Confirmation
│   │   ├── MySessionsScreen.js    # Session management
│   │   ├── CommunityScreen.js     # Community features
│   │   └── ProfileScreen.js       # User settings
│   └── services/
│       ├── firebase.js            # Firebase config (TODO)
│       └── stripe.js              # Stripe config (TODO)
```

## 💰 Revenue Model

**Marketplace Model:**
- Users pay €60/session
- App takes 30% commission = €18
- Specialist gets 70% = €42

**Expected Revenue:** €15K-30K/month at scale

## 🎯 Key Screens Overview

### 1. Dashboard
- Time-based greeting (morning/afternoon/evening)
- Wellness metrics (stress, family time, sleep, wellness score)
- Quick action buttons (meditation, rest, hydration)
- Daily wellness tip carousel
- Book therapy CTA

### 2. Therapy Marketplace
- Browse all specialists or filter by type
- Search by name
- View ratings, reviews, experience, availability
- Instant booking from card
- 4 specialist types: Psychologist, Life Coach, Nutritionist, Yoga Instructor

### 3. Booking Flow
- 14-day availability calendar
- 7 time slots per day
- Session duration: 30/60/90 minutes
- Add optional notes
- Real-time price calculation
- Confirm and proceed to payment

### 4. Payment
- Card details: name, number, expiry, CVV
- Booking summary with all details
- Secure payment badge
- Integration with Stripe (in progress)

### 5. My Sessions
- Upcoming sessions with countdown
- Past sessions with ratings
- Cancel/reschedule upcoming
- View receipts for past
- Rate and review completed sessions

### 6. Community
- **Groups**: Support groups by topic
- **Challenges**: Weekly wellness challenges with progress
- **Discussions**: Community forum and Q&A

### 7. Profile
- User details and stats
- Health goals selection (multi-select)
- Language preference switcher
- Push/email notification toggles
- Privacy settings
- Support & FAQ
- Logout & account deletion

## 🔐 Security

- Password validation on signup
- Email validation
- Card PCI compliance via Stripe
- Firebase security rules for database
- SSL/TLS for all API calls

## 🌐 Deployment

### Development
```bash
npm start
# Scan QR code with Expo app
```

### Production (iOS)
```bash
eas build --platform ios
eas submit --platform ios
```

### Production (Android)
```bash
eas build --platform android
eas submit --platform android
```

See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for complete backend integration guide.

## 📊 Translation Coverage

All screens support:
- 300+ translation keys
- Full UI in 3 languages
- Right-to-left support for Arabic
- Context-aware messages

## 🔔 Notifications (TODO)

- Session reminder 24h before
- Session reminder 15min before
- Community challenge updates
- Group discussion replies
- New specialist available

## 📞 Support

For issues:
1. Check [BACKEND_SETUP.md](./BACKEND_SETUP.md) for integration steps
2. Review Firebase documentation
3. Test with Stripe test mode first
4. Check console logs in Expo

## 📄 License

Proprietary - Vida Plena App

---

**Built with ❤️ for work-life balance in Spain**

### Contributors
- Claude Haiku 4.5 (AI Assistant)
