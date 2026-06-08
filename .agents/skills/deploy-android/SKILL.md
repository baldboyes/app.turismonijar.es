---
name: "deploy-android"
description: "Run the application on Android devices."
---

## Description

This skill allows you to run the Nuxt PWA application on physical Android devices or emulators connected via ADB.

## Tools

| Tool | Version | Description |
|------|---------|-------------|
| `exec` | 1.1.4 | Executes shell commands |

## Usage

```bash
# Run on all connected Android devices (devices and emulators)
<deploy-android>

# Run on a specific device (by device name)
<deploy-android> "OPPO CPH2841 (3B164B01P5400000)"

# Run on a specific device (by IP address - for devices on same network)
<deploy-android> "[IP_ADDRESS]"

# Run on a specific device (by partial device name)
<deploy-android> "OPPO CPH2841"
```

### Parameters

| Parameter | Type | Optional | Description |
|-----------|------|----------|-------------|
| `deviceName` | string | Yes | The name of the device to deploy to. Can be:<ul><li>Full device name (e.g., "OPPO CPH2841 (3B164B01P5400000)")</li><li>Device IP address (e.g., "[IP_ADDRESS]")</li><li>Partial device name (e.g., "OPPO", "CPH2841", "3B164B01P5400000")</li></ul>If not specified, the command will run on all connected devices. |

## Behavior

### Success Cases

- When a device name is provided, the command builds and deploys the app to that specific device.
- When no device name is provided, the command:
  1. Fetches all connected devices using `adb devices`
  2. Builds and deploys the app to each device

### Error Cases

- **No devices found**: If no devices are connected, the skill will report: "❌ No Android devices found. Make sure your device is connected via USB and ADB debugging is enabled."
- **Invalid device name**: If the specified device name doesn't match any connected device, the skill will report: "❌ Device '...' not found. Use 'list-android' to see available devices."
- **Build errors**: If the Gradle build fails, the error message from the build process will be displayed.
- **Sync errors**: If the sync process fails, the error message from the sync process will be displayed.

## Device Discovery

To see available devices, run:
```bash
<list-android>
```

## Best Practices

- For best results, use the **full device name** (including model and serial number) from the output of `list-android`.
- Use IP address deployment for devices on the same Wi-Fi network without USB connection.
- When providing a partial name, ensure it's unique enough to match only one device.
