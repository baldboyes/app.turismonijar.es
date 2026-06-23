import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'es.vive.nijar',
  appName: 'Vive Níjar',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      overlaysWebView: true
    }
  }
};

export default config;
