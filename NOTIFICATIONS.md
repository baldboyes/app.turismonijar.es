# Implementing Notifications in Capacitor

This guide details the steps required to implement either **Local Notifications** or **Push Notifications** (via Firebase Cloud Messaging) in the Vive Níjar app.

---

## Option A: Local Notifications (Triggered locally by the app)

If you only need to trigger notifications based on local events, timers, or location:

### 1. Install the Plugin
Install the dependency and sync the native platforms:
```bash
npm install @capacitor/local-notifications
npx cap sync
```

### 2. Request Permission
In your Vue/Nuxt application setup code (e.g. in a composable or page), request permission from the user:
```typescript
import { LocalNotifications } from '@capacitor/local-notifications';

const requestPermission = async () => {
  const status = await LocalNotifications.requestPermissions();
  if (status.display === 'granted') {
    console.log('Local notifications permission granted');
  }
};
```

### 3. Schedule a Notification
You can trigger a notification immediately or schedule it for a future timestamp:
```typescript
await LocalNotifications.schedule({
  notifications: [
    {
      title: "Explore Níjar",
      body: "Check out the nearby beaches!",
      id: 1,
      schedule: { at: new Date(Date.now() + 1000 * 10) }, // 10 seconds from now
      sound: undefined,
      attachments: undefined,
      actionTypeId: "",
      extra: null
    }
  ]
});
```

---

## Option B: Push Notifications (Triggered remotely from a server)

If you want to send notifications from a backend server to users at any time:

### 1. Setup the Plugin
Install the official Capacitor plugin and synchronize your project:
```bash
npm install @capacitor/push-notifications
npx cap sync
```

### 2. Android Configuration (Firebase Cloud Messaging - FCM)
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Add an Android App using your app ID: `es.turismonijar.app` (defined in [capacitor.config.ts](./capacitor.config.ts)).
3. Download the generated `google-services.json` file.
4. Place `google-services.json` in the native Android directory: `android/app/google-services.json`.

### 3. iOS Configuration (Apple APNS + Firebase)
1. In your **Apple Developer Account**, register the App ID with the **Push Notifications** capability enabled.
2. Generate an **APNs Authentication Key** (`.p8` file) or an APNs SSL Certificate.
3. Upload this Key/Certificate to your Firebase Project settings under **Cloud Messaging -> Apple App Configuration**.
4. Register your iOS App in Firebase using the iOS Bundle Identifier.
5. Download the `GoogleService-Info.plist` file and add it to your project in Xcode under `App -> App` folder.
6. Open your project in Xcode (`npx cap open ios`) and under **Signing & Capabilities**, click `+ Capability` and add **Push Notifications** and **Background Modes** (checking *Remote notifications*).

### 4. JS/TS Implementation in Nuxt
Add the registration and listener logic in your app (typically inside `app.vue` or a dedicated plugin/composable):

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

const registerPush = async () => {
  // 1. Request permission
  let permission = await PushNotifications.checkPermissions();
  if (permission.receive !== 'granted') {
    permission = await PushNotifications.requestPermissions();
  }

  if (permission.receive !== 'granted') {
    throw new Error('User denied push permission');
  }

  // 2. Register with FCM/APNs
  await PushNotifications.register();

  // 3. Listen for token registration (send this token to your backend DB to target this device)
  await PushNotifications.addListener('registration', (token) => {
    console.log('Push registration success, token: ' + token.value);
    // TODO: Send token.value to your backend API
  });

  // 4. Handle registration errors
  await PushNotifications.addListener('registrationError', (err) => {
    console.error('Registration error: ', err);
  });

  // 5. Handle incoming notification when app is open
  await PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received: ', notification);
  });

  // 6. Handle action performed when user taps on the notification
  await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push action performed: ', notification);
  });
};
```
