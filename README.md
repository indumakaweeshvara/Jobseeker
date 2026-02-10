# JobSeeker App

A professional job seeking mobile application built with React Native/Expo and Firebase, now featuring full Dark Mode support and advanced job discovery tools.

## 📱 Features

- **User Authentication**: Secure login and signup with Firebase Auth
- **Full Dark Mode**: Professional dark and light theme support with dynamic switching
- **Job Listings**: Browse available jobs with search and category filtering
- **Popular Jobs**: Discover featured opportunities in a dedicated horizontal scroll section
- **Job Details**: Comprehensive job information with market salary insights
- **Job Sharing**: Share interesting opportunities via system share dialog
- **Bookmarking**: Save jobs for later review in a dedicated "Saved" tab
- **Job Applications**: Apply to jobs and track your application status
- **Profile Management**: Update personal info and upload profile pictures
- **Skeleton Screens**: Premium shimmering loading experience across all major screens

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo (SDK 54)
- **Backend**: Firebase (Authentication + Cloud Firestore)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Theme**: Custom Theme Engine with `ThemeContext`
- **UI**: Custom components with gradient designs and accessibility focus

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Firebase account

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd JobSeekerApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup
1. Create a new project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** → Email/Password
3. Enable **Cloud Firestore**
4. Update `src/services/firebaseConfig.ts` with your credentials

### 4. Run the App
```bash
npx expo start
```
Scan the QR code with Expo Go app (iOS/Android) or press `w` for web.

## 📁 Project Structure

```
JobSeekerApp/
├── app/
│   └── index.tsx          # Entry Point
├── src/
│   ├── components/        # Reusable UI & Skeleton Components
│   │   ├── CustomButton.tsx
│   │   ├── InputField.tsx
│   │   ├── JobCard.tsx
│   │   └── Skeleton.tsx
│   ├── context/           # Global State (Auth & Theme)
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── navigation/        # Navigation Logic
│   │   └── AppNavigator.tsx
│   ├── screens/           # Feature Screens
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── JobDetailScreen.tsx
│   │   ├── AppliedJobsScreen.tsx
│   │   ├── SavedJobsScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/          # Services & Data Seeding
│   │   ├── firebaseConfig.ts
│   │   └── seedData.ts
│   ├── theme/             # Design System Tokens
│   │   └── colors.ts
│   └── types/             # TypeScript Definitions
```

## 🔥 Firebase Collections

| Collection | Description |
|------------|-------------|
| **Users** | Core user data, profile info, and roles |
| **Jobs** | Job listings, requirements, and company data |
| **Applications** | User-Job interaction tracking |
| **SavedJobs** | User's bookmarked job listings |

## 👨‍💻 Author

Your Name - Your University

## 📄 License

This project is created for educational purposes.
