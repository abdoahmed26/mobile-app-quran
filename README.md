# القرآن الكريم - Quran Mobile App

A beautiful React Native mobile application for reading and listening to the Holy Quran with prayer times.

## Features

✨ **Core Features:**

- 📖 Read all 114 Surahs of the Quran
- 🎧 Listen to Quran recitations from multiple reciters
- 🕌 Display prayer times based on your location
- 🌙 Dark mode support
- 🔍 Search for Surahs
- ⚙️ Customizable settings (choose your favorite reciter)

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Expo AV** for audio playback
- **Expo Location** for prayer times
- **AsyncStorage** for local data persistence
- **Axios** for API calls

## Prerequisites

Before running this app, make sure you have:

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (optional, but recommended)
- Expo Go app on your mobile device (for testing)

## Installation

1. Navigate to the app directory:

```bash
cd app
```

2. Install dependencies:

```bash
npm install
```

## Running the App

### Development Mode

Start the Expo development server:

```bash
npm start
```

This will open the Expo Developer Tools in your browser. You can then:

- Scan the QR code with the Expo Go app (Android/iOS)
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator (macOS only)
- Press `w` to open in web browser

### Platform-Specific Commands

**Android:**

```bash
npm run android
```

**iOS (macOS only):**

```bash
npm run ios
```

**Web:**

```bash
npm run web
```

## Project Structure

```
app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Card.tsx
│   │   ├── PrayerTimeCard.tsx
│   │   └── SurahCard.tsx
│   ├── screens/             # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── SurahListScreen.tsx
│   │   ├── SurahReaderScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/            # API services
│   │   └── api.ts
│   ├── hooks/               # Custom React hooks
│   │   └── useTheme.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   └── constants/           # App constants
│       └── index.ts
├── assets/                  # Images, fonts, etc.
├── App.tsx                  # Main app component
├── app.json                 # Expo configuration
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript configuration
```

## API Sources

The app uses the following APIs:

- **Prayer Times:** [Aladhan API](https://aladhan.com/prayer-times-api)
- **Quran Data:** [QuranJSON](https://github.com/penggguna/QuranJSON)
- **Reciters:** Custom API hosted on GitHub Pages
- **Audio:** Various Quran recitation servers

## Permissions

The app requires the following permissions:

- **Location:** To determine accurate prayer times based on your location
- **Internet:** To fetch Quran data and audio files

## Features in Detail

### Home Screen

- Real-time clock display
- Prayer times for your location
- Quick access to Surah list and settings
- Theme toggle (light/dark mode)

### Surah List Screen

- List of all 114 Surahs
- Search functionality
- Play audio directly from the list
- Navigate to read full Surah text

### Surah Reader Screen

- Read complete Surah with Arabic text
- Proper verse numbering
- Bismillah display (where applicable)
- Clean, readable layout

### Settings Screen

- Choose your favorite Quran reciter
- Search through available reciters
- Toggle dark mode
- About section

## Building for Production

### Android APK

```bash
expo build:android
```

### iOS IPA

```bash
expo build:ios
```

For more details, refer to the [Expo documentation](https://docs.expo.dev/build/introduction/).

## Troubleshooting

**App won't start:**

- Make sure all dependencies are installed: `npm install`
- Clear cache: `expo start -c`

**Location not working:**

- Ensure location permissions are granted
- Check if location services are enabled on your device

**Audio not playing:**

- Check internet connection
- Ensure device is not in silent mode
- Try a different reciter from settings

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## Credits

**Developer:** عبدالرحمن احمد (Abdelrahman Ahmed)

**Data Sources:**

- Quran text and translations
- Prayer times API
- Quran recitation audio

## License

This project is created for educational and religious purposes.

---

**May Allah accept this work and make it beneficial for all Muslims. Ameen.**

بارك الله فيكم
