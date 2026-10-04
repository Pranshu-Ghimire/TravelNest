# 📱 Mono Pransu

A modern, high-performance universal mobile application built with **React Native**, **Expo SDK 54**, **Expo Router**, and **Firebase Authentication**.

---

## ✨ Features

- **🔐 Firebase Authentication**: Support for User Sign Up, Login, and Session handling.
- **🎨 Sleek UI Components**: Custom reusable components including custom buttons, input fields with icon support, back navigation, and linear gradients.
- **🚀 Onboarding & Auth Flow**: Dynamic onboarding carousel and authentication screens (`Login`, `Signup`, `Onboarding`).
- **📱 Universal Support**: Seamless support for iOS, Android, and Web powered by Expo Router (file-based navigation).
- **⚡ Modern Stack**: Built with React 19, React Native 0.81, Reanimated v4, and TypeScript.

---

## 🏗️ Project Architecture

```text
├── app/                  # Expo Router file-based pages & layouts
│   ├── _layout.tsx       # Root layout configuration
│   └── (tabs)/           # Main tab bar screen group
│       ├── _layout.tsx   # Tab bar navigation configuration
│       ├── index.tsx     # Main home view
│       ├── onboarding.tsx# Interactive onboarding flow
│       ├── login.tsx     # Login screen
│       └── signup.tsx    # Sign up screen
├── components/           # Reusable UI components
│   ├── button.tsx        # Custom action button
│   ├── input-field.tsx   # Text input field component
│   └── back-button.tsx   # Navigation back header action
├── services/             # Application services
│   └── firebase.ts       # Firebase app initialization & auth configuration
├── assets/               # Fonts, images, and static assets
└── AGENTS.md             # Developer & AI Agent instructions
```

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/)
- **Navigation**: [Expo Router v6](https://docs.expo.dev/router/introduction)
- **Backend / Auth**: [Firebase v12](https://firebase.google.com/docs)
- **UI / Styling**: `expo-linear-gradient`, `@expo/vector-icons`, `react-native-reanimated`
- **Notifications**: `react-native-toast-message`

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed along with `npm` or `yarn`.

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Pranshu-Ghimire/mono_pransu.git
cd mono_pransu
npm install
```

### 2. Run Locally

Start the Expo development server:

```bash
# Start default dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

---

## 📝 Rules & Guidelines

Please refer to [`AGENTS.md`](./AGENTS.md) and [`CLAUDE.md`](./CLAUDE.md) for core guidelines when contributing or using AI coding assistants.
