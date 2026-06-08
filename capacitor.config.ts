import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'es.turismonijar.app',
  appName: 'Turismo Níjar',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      overlaysWebView: true
    }
  }
};

export default config;
