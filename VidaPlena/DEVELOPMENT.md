# Vida Plena Development Guide

## Project Overview

Vida Plena is a React Native + Expo mobile application that connects users with wellness specialists (therapists, coaches, nutritionists, yoga instructors) and provides community features for work-life balance.

### Tech Stack
- **Framework:** React Native 0.86.3 + Expo 57
- **Navigation:** React Navigation 7
- **i18n:** i18next + react-i18next (EN, ES, AR)
- **State Management:** React Hooks + AsyncStorage (TODO)
- **Backend:** Firebase (TODO) + Stripe (TODO)

## Project Structure

```
VidaPlena/
├── App.js                          # Root app with navigation setup
├── index.js                        # Entry point
├── package.json                    # Dependencies
├── app.json                        # Expo configuration
├── BACKEND_SETUP.md               # Firebase & Stripe integration guide
├── DEVELOPMENT.md                 # This file
├── README.md                      # User-facing documentation
├── src/
│   ├── components/
│   │   └── ErrorBoundary.js       # Global error boundary
│   ├── i18n/
│   │   ├── config.js              # i18next configuration
│   │   └── translations.js        # 555+ translation keys for 3 languages
│   ├── screens/
│   │   ├── AuthScreen.js          # Login & signup
│   │   ├── DashboardScreen.js     # Home/wellness dashboard
│   │   ├── TherapyScreen.js       # Specialist marketplace
│   │   ├── BookingScreen.js       # Session booking flow
│   │   ├── PaymentScreen.js       # Payment processing
│   │   ├── PaymentSuccessScreen.js # Booking confirmation
│   │   ├── MySessionsScreen.js    # Session history & management
│   │   ├── CommunityScreen.js     # Groups, challenges, discussions
│   │   ├── ProfileScreen.js       # User settings & preferences
│   │   ├── SpecialistDashboardScreen.js  # Specialist view (not in main nav)
│   │   └── SpecialistOnboardingScreen.js # Specialist signup (not in main nav)
│   └── services/
│       ├── firebase.js            # Firebase config (TODO)
│       └── stripe.js              # Stripe config (TODO)
```

## Code Quality

### Recent Improvements (Version 1.0.0+)

1. **Fixed Duplicate Style Definition**
   - PaymentSuccessScreen.js had duplicate `detailCard` style (lines 201-212)
   - FIXED: Removed duplicate declaration

2. **Improved Navigation Organization**
   - Stack navigators were defined after use in App.js
   - FIXED: Reorganized to define all stacks before BottomTabNavigator
   - Better code readability and maintenance

3. **Added Error Boundary**
   - New `src/components/ErrorBoundary.js` provides global error handling
   - Catches React component errors and displays user-friendly message
   - Development-only error details for debugging

4. **Completed Translations**
   - Added missing translation keys: `confirm`, `submit`, `delete`
   - Available in English, Spanish, and Arabic
   - 555+ total translation keys for full UI coverage

5. **Fixed Variable Naming Typo**
   - CommunityScreen.js: `weeklyChalllenges` → `weeklyChallenges`
   - FIXED: Corrected spelling throughout file

## Navigation Structure

### Authentication Stack
- **Login**: Email/password with social login buttons (Apple, Google)
- **SignUp**: Account creation with password validation

### Main App (Bottom Tabs)
1. **Dashboard Tab** (Home)
   - Wellness metrics: stress level, family time, sleep, wellness score
   - Quick action buttons (meditation, rest, hydration)
   - Daily wellness tip carousel
   - CTA to book therapy session

2. **Therapy Tab** (Specialist Marketplace)
   - Browse specialists or filter by type
   - Search functionality
   - Specialist cards with rating, reviews, experience
   - Quick book action

3. **Sessions Tab** (Booking Management)
   - Upcoming sessions with countdown
   - Past sessions with ratings
   - Cancel/reschedule upcoming
   - Rate/review completed sessions

4. **Community Tab**
   - **Groups**: Support groups by topic (filterable)
   - **Challenges**: Weekly wellness challenges with progress bars
   - **Discussions**: Community forum with likes/comments

5. **Profile Tab**
   - User profile with stats
   - Health goals (multi-select)
   - Language switcher (EN/ES/AR)
   - Notification preferences
   - Privacy settings
   - Support & FAQ links
   - Logout & account deletion

### Booking Flow (Nested in Therapy Tab)
1. Specialist card → Book Now
2. BookingScreen (date/time/duration/notes selection)
3. PaymentScreen (card details entry)
4. PaymentSuccessScreen (confirmation with next steps)

## State Management

Currently using React Hooks with local component state:
- `useState()` for form data, selections, loading states
- Mock data for testing UI flows

**TODO**: Implement persistent state with:
- AsyncStorage for user preferences
- Firebase Authentication for user sessions
- Firebase Realtime Database for booking/session data

## Translations

### Supported Languages
- 🇬🇧 **English** (development language)
- 🇪🇸 **Español** (main market - Spain)
- 🇸🇦 **العربية** (Arabic - Arab community in Spain)

### Language Switching
- Profile screen has language selector
- i18n.changeLanguage() updates immediately
- All strings use translation keys

### Key Translation Categories
- `common.*`: UI elements (buttons, labels, messages)
- `tabs.*`: Tab navigation labels
- `dashboard.*`: Dashboard-specific strings
- `therapy.*`: Therapy marketplace strings
- `booking.*`: Booking flow strings
- `payment.*`: Payment strings
- `profile.*`: Profile screen strings
- `community.*`: Community feature strings
- `errors.*`: Error messages

## Best Practices

### Component Development
- Use React.memo() for expensive re-renders
- Destructure props for clarity
- Use custom hooks for reusable logic
- Keep components under 300 lines

### Styling
- Use StyleSheet.create() for performance
- Define responsive sizes using Dimensions.get('window')
- Use consistent color palette (defined in styles)
- Keep padding/margin consistent (multiples of 4)

### Translation Keys
- Use dot notation: `tabs.profile`, `common.logout`
- Provide context in key names
- Keep values concise
- Use placeholders for dynamic content

### Error Handling
- Wrap async operations in try-catch
- Validate user input before processing
- Display user-friendly error messages
- Log detailed errors to console in development

### Performance
- Use FlatList for long lists (not implemented yet)
- Lazy load screens/images
- Memoize expensive computations
- Avoid inline functions in render

## Mock Data

### Specialists
```javascript
const specialists = [
  { id: 1, name: 'Dr. María García', specialty: 'Psychologist', price: 60 },
  { id: 2, name: 'Carlos López', specialty: 'Life Coach', price: 50 },
  { id: 3, name: 'Ana Martínez', specialty: 'Nutritionist', price: 45 },
  { id: 4, name: 'Juan Fernández', specialty: 'Yoga Instructor', price: 35 },
];
```

### Sessions
- Upcoming sessions in MySessionsScreen
- Past sessions with ratings
- Mock booking confirmation numbers

### Community
- 4 support groups with 156-412 members
- 3 weekly challenges with progress tracking
- Sample discussions with engagement metrics

## Testing

### Manual Testing Checklist
- [ ] Login/Signup flow with validation
- [ ] Language switching (EN→ES→AR)
- [ ] Specialist browsing and filtering
- [ ] Booking flow (date/time/duration selection)
- [ ] Price calculation (duration-based)
- [ ] Payment form validation
- [ ] Session management (view, cancel, reschedule, rate)
- [ ] Community features (join groups, view challenges)
- [ ] Profile settings and preferences
- [ ] Error handling (missing specialist, invalid payment)

### Testing on Devices
```bash
# Web browser (easier debugging)
npm run web

# Android emulator
npm run android

# iOS simulator (macOS only)
npm run ios
```

## Common Issues & Troubleshooting

### Navigation Issues
**Problem**: "undefined is not a function" in navigation
**Solution**: Ensure screen component is properly exported and imported

**Problem**: Stale navigation params
**Solution**: Use route?.params with nullish coalescing to avoid errors

### Translation Issues
**Problem**: Translation key appears as literal text
**Solution**: Check key exists in translations.js for current language

**Problem**: Special characters not displaying (Arabic)
**Solution**: Ensure text uses flexShrink: 1 and proper lineHeight

### Performance Issues
**Problem**: Slow rendering with many specialists
**Solution**: Implement FlatList instead of ScrollView.map()

**Problem**: Memory leak on unmount
**Solution**: Clean up listeners/timers in useEffect cleanup function

## Firebase Integration (Next Phase)

See BACKEND_SETUP.md for detailed instructions:

1. Create Firebase project
2. Set up Authentication (Email/Password)
3. Set up Realtime Database
4. Install firebase package
5. Implement login/signup with Firebase
6. Sync bookings to database

## Stripe Integration (Next Phase)

See BACKEND_SETUP.md for detailed instructions:

1. Install @stripe/stripe-react-native
2. Configure publishable key
3. Create payment intent endpoint
4. Test with Stripe test cards
5. Handle webhooks for payment confirmation

## Deployment

### Build for Production
```bash
# Build for iOS
eas build --platform ios
eas submit --platform ios

# Build for Android
eas build --platform android
eas submit --platform android
```

### Environment Configuration
- Development: localhost Firebase/Stripe test keys
- Production: Live Firebase project and Stripe keys
- See BACKEND_SETUP.md Phase 5 for configuration

## Performance Targets

- App load time: < 3 seconds
- Screen transition: < 500ms
- Session booking: < 2 seconds
- Payment: < 1 second validation + 3 second processing

## Analytics (Future)

Track key events:
- `screen_view`: Page/screen navigations
- `book_session`: Booking creation
- `payment_complete`: Successful payment
- `session_completed`: User completes session
- `community_join`: User joins group/challenge

## Support & Contributing

### Development Setup
1. Clone repository
2. Run `npm install`
3. Start dev server: `npm start`
4. Test on device/emulator

### Code Review Checklist
- [ ] No console.logs in production code (except logging)
- [ ] All translation keys exist
- [ ] Responsive design tested on multiple screen sizes
- [ ] Error handling implemented
- [ ] No unused imports/variables
- [ ] Consistent code style
- [ ] Performance acceptable

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and test
npm start

# Commit with clear message
git commit -m "Add feature: description"

# Push to repository
git push origin feature/feature-name

# Create Pull Request
```

## License

Proprietary - Vida Plena App

---

**Last Updated**: 2026-09-26
**Version**: 1.0.0
**Maintained By**: Development Team
