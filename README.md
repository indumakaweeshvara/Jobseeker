# JobSeeker App

A professional job seeking mobile application built with React Native/Expo and Firebase.

## 📱 Features

- **User Authentication**: Secure login and signup with Firebase Auth
- **Job Listings**: Browse available jobs with search functionality
- **Job Applications**: Apply to jobs with one tap
- **Application Tracking**: View and manage your job applications
- **Profile Management**: Update your personal information

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Authentication + Cloud Firestore)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **UI**: Custom components with gradient designs

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
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
4. Get your config from Project Settings → Your apps
5. Update `src/services/firebaseConfig.js` with your credentials:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Add Sample Jobs to Firestore
In Firebase Console → Firestore, create a `Jobs` collection with documents:
```json
{
  "title": "Software Engineer",
  "company": "Tech Corp",
  "location": "Colombo, Sri Lanka",
  "salary": "LKR 150,000",
  "description": "We are looking for a skilled software engineer..."
}
```

### 5. Run the App
```bash
npx expo start
```
Scan the QR code with Expo Go app (iOS/Android)

## 📁 Project Structure

```
JobSeekerApp/
├── src/
│   ├── assets/          # Images & Icons
│   ├── components/      # Reusable UI Components
│   │   ├── CustomButton.js
│   │   ├── InputField.js
│   │   └── JobCard.js
│   ├── context/         # Global State Management
│   │   └── AuthContext.js
│   ├── navigation/      # Navigation Configuration
│   │   └── AppNavigator.js
│   ├── screens/         # App Screens
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── HomeScreen.js
│   │   ├── JobDetailScreen.js
│   │   ├── AppliedJobsScreen.js
│   │   └── ProfileScreen.js
│   ├── services/        # Firebase Config
│   │   └── firebaseConfig.js
│   └── theme/           # App Styling
│       └── colors.js
├── App.js               # Main Entry Point
└── package.json
```

## 🔥 Firebase Collections

| Collection | Fields |
|------------|--------|
| Users | uid, name, email, phone, profilePic, createdAt |
| Jobs | title, company, location, salary, description |
| Applications | appId, jobId, userId, jobTitle, company, status, appliedAt |

## 📲 Build APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build preview APK
eas build -p android --profile preview
```

## 📝 CRUD Operations

1. **CREATE**: Apply for a job → Creates record in Applications collection
2. **READ**: View job listings, applications, and profile data
3. **UPDATE**: Edit profile name and phone number
4. **DELETE**: Withdraw job application

## 👨‍💻 Author

Your Name - Your University

## 📄 License

This project is created for educational purposes.
