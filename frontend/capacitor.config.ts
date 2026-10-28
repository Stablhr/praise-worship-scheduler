import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ucjm.praiseandworship',
  appName: 'UCJM Praise & Worship',
  webDir: 'out',
  server: {
    // During development, point at the Next.js dev server:
    // url: 'http://localhost:3000',
    // cleartext: true
    //
    // For production, build the app (npm run build) and copy the output:
    //   npx cap sync
    //   npx cap open android   (or ios)
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0b3d91'
    }
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true
  }
};

export default config;