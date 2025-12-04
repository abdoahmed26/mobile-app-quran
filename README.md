# سُكون - Quran & Prayer Times App 🕌

A beautiful, feature-rich React Native mobile application for reading the Holy Quran, listening to recitations, tracking prayer times, and exploring the Islamic Hijri calendar.

## ✨ Features

### 📖 Quran Reading & Audio

- Read all 114 Surahs with beautiful Arabic text
- Listen to recitations from multiple renowned reciters
- Persistent audio player with play/pause, next/previous controls
- Reciter selection directly from Surah list
- Search functionality for Surahs

### 🕌 Prayer Times

- Accurate prayer times based on GPS location
- Real-time countdown to next prayer
- Adhan notifications with customizable sounds:
  - Default Adhan
  - Makkah Adhan
  - Madinah Adhan
- Enable/disable notifications per prayer
- Background notifications (works when app is closed)
- Locked screen playback support

### 📅 Hijri Calendar

- Full Islamic calendar with month view (7×6 grid)
- Month navigation (previous/next)
- Current day highlighting
- Gregorian dates alongside Hijri dates
- **Islamic Events Annotations:**
  - 🟣 Ashura (10 Muharram)
  - 🟢 Start of Ramadan (1 Ramadan)
  - 🟡 Laylat al-Qadr nights (last 10 nights of Ramadan)
  - 🟢 Eid al-Fitr (1 Shawwal)
  - 🔵 First Ten Days of Dhul-Hijjah
  - 🩷 Day of Arafah (9 Dhul-Hijjah)
  - 🔴 Eid al-Adha (10 Dhul-Hijjah)
  - 🟠 Days of Tashreeq (11-13 Dhul-Hijjah)
- Hijri date offset adjustment (-1/0/+1 day) for regional differences
- Compact home screen card with quick access

### 🧭 Qibla Direction

- Real-time Qibla compass using device magnetometer
- Accurate bearing calculation using Haversine formula
- GPS-based location detection
- Visual compass with degree markings
- Distance to Kaaba display

### 🎨 UI/UX

- 🌙 Full dark mode support
- Modern gradient designs
- Smooth animations
- Arabic-first interface
- Responsive layouts
- Clean, intuitive navigation

---

## 🛠 Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Expo AV** for audio playback
- **Expo Location** for GPS and prayer times
- **Expo Sensors** for magnetometer (Qibla)
- **Expo Notifications** for Adhan alerts
- **moment-hijri** for Hijri calendar calculations
- **AsyncStorage** for local data persistence
- **Axios** for API calls

---

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (optional)
- Expo Go app on your mobile device

---

## 🚀 Installation

1. **Navigate to the app directory:**

   ```bash
   cd app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm start
   ```

4. **Run on your device:**
   - Scan the QR code with Expo Go (Android/iOS)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator (macOS only)
   - Press `w` for web browser

---

## 📁 Project Structure

```
app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── home/           # Home screen components
│   │   │   ├── HomeHeader.tsx
│   │   │   ├── NextPrayerCard.tsx
│   │   │   ├── PrayerTimesSection.tsx
│   │   │   ├── HijriCalendar.tsx
│   │   │   └── HomeActions.tsx
│   │   ├── Card.tsx
│   │   ├── SurahCard.tsx
│   │   ├── AudioPlayer.tsx
│   │   ├── QiblaCompass.tsx
│   │   └── LoadingSkeleton.tsx
│   ├── screens/             # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── SurahListScreen.tsx
│   │   ├── SurahReaderScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── QiblaScreen.tsx
│   │   └── HijriCalendarScreen.tsx
│   ├── services/            # Business logic & APIs
│   │   ├── api.ts
│   │   ├── adhanService.ts
│   │   └── notificationChannel.ts
│   ├── utils/               # Utility functions
│   │   ├── hijriUtils.ts
│   │   ├── islamicEvents.ts
│   │   ├── qiblaCalculations.ts
│   │   └── locationUtils.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── useTheme.ts
│   │   └── useQiblaDirection.ts
│   ├── context/             # React Context providers
│   │   └── AudioContext.tsx
│   ├── types/               # TypeScript definitions
│   │   ├── index.ts
│   │   └── moment-hijri.d.ts
│   └── constants/           # App constants
│       ├── index.ts
│       └── islamicEvents.ts
├── assets/                  # Images, fonts, audio
│   └── audio/              # Adhan sound files
├── App.tsx                  # Main app component
├── app.json                 # Expo configuration
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

---

## 🌐 API Sources

- **Prayer Times:** [Aladhan API](https://aladhan.com/prayer-times-api)
- **Quran Data:** [QuranJSON](https://github.com/penggguna/QuranJSON)
- **Reciters:** Custom API hosted on GitHub Pages
- **Audio:** Various Quran recitation servers

---

## 🔐 Permissions

- **Location:** For accurate prayer times and Qibla direction
- **Notifications:** For Adhan alerts
- **Internet:** To fetch Quran data and audio

---

## 📱 Features in Detail

### Home Screen

- Real-time clock
- Current Gregorian and Hijri dates
- Next prayer countdown
- All 5 daily prayer times
- Quick access to Qibla, Calendar, and Settings
- Theme toggle

### Hijri Calendar Screen

- Full month view with 42 days (6 weeks)
- Islamic event indicators with colors
- Month/year navigation
- "Today" quick jump button
- Event names in Arabic
- Gregorian dates for each day

### Qibla Screen

- Live compass with smooth rotation
- Degree markings and cardinal directions
- Qibla needle pointing to Kaaba
- Distance calculation
- Location coordinates display

### Settings Screen

- **Adhan Settings:**
  - Enable/disable notifications
  - Choose Adhan sound (Default, Makkah, Madinah)
  - Sound preview
  - Enable/disable per prayer
- **Hijri Calendar:**
  - Date offset adjustment (-1/0/+1 day)
- **Reciter Selection:**
  - Browse all available reciters
  - Search functionality
- **Theme:** Dark/Light mode toggle

---

## 🎯 Code Quality

### Recent Refactoring (Phase 1)

- ✅ Centralized constants for Islamic events
- ✅ TypeScript enums for better type safety
- ✅ Reduced code duplication by ~40%
- ✅ Added JSDoc comments
- ✅ Input validation
- ✅ Improved code organization

---

## 🏗 Building for Production

### Android APK

```bash
expo build:android
```

### iOS IPA

```bash
expo build:ios
```

For more details, see [Expo documentation](https://docs.expo.dev/build/introduction/).

---

## 🐛 Troubleshooting

**App won't start:**

- Run `npm install`
- Clear cache: `expo start -c`

**Location not working:**

- Grant location permissions
- Enable location services on device

**Audio not playing:**

- Check internet connection
- Ensure device is not in silent mode
- Try different reciter

**Notifications not working:**

- Grant notification permissions
- Check notification settings in app
- Disable battery optimization for the app (Android)

---

## 🤝 Contributing

Suggestions and improvements are welcome!

---

## 👨‍💻 Credits

**Developer:** عبدالرحمن احمد (Abdulrahman Ahmed)

**Special Thanks:**

- Aladhan API for prayer times
- QuranJSON for Quran data
- All Quran reciters
- Islamic calendar resources

---

## 📄 License

Created for educational and religious purposes.

---

**May Allah accept this work and make it beneficial for all Muslims. Ameen. 🤲**

بارك الله فيكم ✨
