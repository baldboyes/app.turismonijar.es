# Design: Mapbox GL Component Memory Leak Fixes

This document details the design and implementation of the memory leak fixes for components using Mapbox GL in the project.

---

## 1. Problem & Context

When navigating between pages in the application (e.g., from the beaches list page to a beach detail page, and back), the DOM container of the Mapbox map is destroyed, but the JavaScript references to the map instance, markers, and pending timeout callbacks remained active. 

This resulted in:
1. **Memory accumulation (JS Heap size increase)** due to retained references of map, marker instances, and closures.
2. **Runtime script errors** when pending callbacks (like resize triggers and initialization loops) attempted to operate on a destroyed map instance.

---

## 2. Affected Components

- **[BeachMap.vue](../../app/components/BeachMap.vue)**: The main beach locator map component.
- **[BeachDetailMap.vue](../../app/components/BeachDetailMap.vue)**: The single beach detail map component.

---

## 3. Implementation Details

### A. Timer Registration & Cleanup
We introduced a tracking system for all `setTimeout` calls within these components to prevent execution after unmount.

- A `timeoutIds` Set is defined in `<script setup>`:
  ```typescript
  const timeoutIds = new Set<any>()
  ```
- A helper `safeSetTimeout` utility registers and manages active timers:
  ```typescript
  function safeSetTimeout(fn: () => void, delay: number) {
    const id = setTimeout(() => {
      timeoutIds.delete(id)
      fn()
    }, delay)
    timeoutIds.add(id)
    return id
  }
  ```
- In `onUnmounted`, all remaining timeouts are cleared:
  ```typescript
  timeoutIds.forEach(id => clearTimeout(id))
  timeoutIds.clear()
  ```

### B. Marker and Map Reference Cleanup
We explicitly clean up all markers and nullify references upon unmounting:

- **Markers**: For multiple markers (`BeachMap.vue`), we iterate and call `.remove()`:
  ```typescript
  markers.forEach(marker => marker.remove())
  markers.clear()
  ```
  For single marker (`BeachDetailMap.vue`):
  ```typescript
  if (marker) {
    marker.remove()
    marker = null
  }
  ```
- **Map Instance**:
  ```typescript
  if (map) {
    map.remove()
    map = null
  }
  ```

---

## 4. Diffs

### Changes in `BeachMap.vue`
```diff
@@ -32,6 +32,16 @@
 let map: mapboxgl.Map | null = null
 const markers = new Map<number | string, mapboxgl.Marker>()
 let animationFrameId: number | null = null
+const timeoutIds = new Set<any>()
+
+function safeSetTimeout(fn: () => void, delay: number) {
+  const id = setTimeout(() => {
+    timeoutIds.delete(id)
+    fn()
+  }, delay)
+  timeoutIds.add(id)
+  return id
+}
 
 mapboxgl.accessToken = 'pk.eyJ1IjoiYmFsZGJveSIsImEiOiJhMzBzeklzIn0.buJ1PP9-a9JkqNWGHW-H0g'
 
@@ -332,13 +332,14 @@
 
 
     map.on('load', () => {
+      if (!map) return
       updateMarkers()
       // Force Mapbox resize immediately and after page transition (400ms)
-      map?.resize()
-      setTimeout(() => {
+      map.resize()
+      safeSetTimeout(() => {
         map?.resize()
       }, 100)
-      setTimeout(() => {
+      safeSetTimeout(() => {
         map?.resize()
         fitBounds()
       }, 500)
@@ -349,6 +349,10 @@
 })
 
 onUnmounted(() => {
+  // Clear all pending timeouts to prevent memory leaks or errors
+  timeoutIds.forEach(id => clearTimeout(id))
+  timeoutIds.clear()
+
   window.removeEventListener('resize', onResize)
   if (mapContainer.value) {
     mapContainer.value.removeEventListener('click', handlePopupLinkClick)
@@ -355,8 +359,14 @@
   if (animationFrameId !== null) {
     cancelAnimationFrame(animationFrameId)
   }
+
+  // Explicitly remove all markers to break references and event listeners
+  markers.forEach(marker => marker.remove())
+  markers.clear()
+
   if (map) {
     map.remove()
+    map = null
   }
 })
 
@@ -372,7 +372,7 @@
 
 function onResize() {
   if (map) {
-    setTimeout(() => {
+    safeSetTimeout(() => {
       map?.resize()
     }, 100)
   }
```

### Changes in `BeachDetailMap.vue`
```diff
@@ -20,6 +20,16 @@
 const mapContainer = ref<HTMLElement | null>(null)
 let map: mapboxgl.Map | null = null
 let marker: mapboxgl.Marker | null = null
+const timeoutIds = new Set<any>()
+
+function safeSetTimeout(fn: () => void, delay: number) {
+  const id = setTimeout(() => {
+    timeoutIds.delete(id)
+    fn()
+  }, delay)
+  timeoutIds.add(id)
+  return id
+}
 
 mapboxgl.accessToken = 'pk.eyJ1IjoiYmFsZGJveSIsImEiOiJhMzBzeklzIn0.buJ1PP9-a9JkqNWGHW-H0g'
 
@@ -129,10 +129,10 @@
 
     // Trigger map resize immediately and after animations/transitions
     map.resize()
-    setTimeout(() => {
+    safeSetTimeout(() => {
       map?.resize()
     }, 100)
-    setTimeout(() => {
+    safeSetTimeout(() => {
       map?.resize()
     }, 500)
   })
@@ -149,12 +149,18 @@
 })
 
 onUnmounted(() => {
+  // Clear all pending timeouts to prevent memory leaks or errors
+  timeoutIds.forEach(id => clearTimeout(id))
+  timeoutIds.clear()
+
   window.removeEventListener('resize', onResize)
   if (marker) {
     marker.remove()
+    marker = null
   }
   if (map) {
     map.remove()
+    map = null
   }
 })
```

---

## 5. Verification & Testing

1. Navigate between pages in Chrome DevTools with **Performance Monitor** active. 
2. Verify that **JS Heap Size** and **DOM Nodes** return to baseline levels shortly after navigating away from map components.
3. Inspect memory using the **Heap Snapshot** tool to ensure no lingering `Map`, `Marker`, or `Popup` objects remain referenced.
