import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'io.markit.ltd',
  appName: 'Markit',
  server: {
    url: 'http://172.20.10.4:8100/',
    cleartext: true,
  },
  plugins: {
    Keyboard: {
      resize: 'ionic',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      overlaysWebView: false,
    },
  },
}

export default config
