export default ({ config }) => ({
  ...config,
  name: "adotai-frontend",
  slug: "adotai-frontend",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/adotai-logo-png.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/adotai-logo-png.png",
    resizeMode: "cover",
    backgroundColor: "#8A1732"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.adotai.mobile"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adotai-logo-png.png",
      backgroundColor: "#8A1732"
    },
    package: "com.adotai.mobile"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.FIREBASE_APP_ID,
    firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
    USER_ROUTE: process.env.USER_ROUTE,
    eas: {
      projectId: "479ba39c-112e-4f95-b95e-3148c85c743c" // <-- Isso é o que o EAS precisa!
    }
  }
});