# Design: Investigar cómo tenemos estructurado Mapbox GL para evitar fugas de memoria

## Technical Approach

El enfoque técnico consiste en robustecer el ciclo de vida de desmontaje (`onUnmounted`) en los componentes de mapa que utilizan Mapbox GL. Se implementa un control estricto de la limpieza de temporizadores (`setTimeout`), eliminación explícita de marcadores del DOM y desreferenciación (`nullify`) de los objetos de mapa y marcador. Con esto se asegura que no queden referencias retenidas en memoria por cierres (closures) o manejadores de eventos.

## Architecture Decisions

### Decisión: Control de temporizadores asíncronos en componentes de mapa

| Opción | Tradeoff | Decisión |
|---|---|---|
| Creación de un `Set` y helper local `safeSetTimeout` por componente | Encapsula el ciclo de vida de los timers de forma local sin añadir dependencias globales. | **Seleccionada**. Es simple, directa y segura para SPA. |
| Creación de un composable global `useTimeoutTracker` | Reutilizable, pero añade complejidad innecesaria para solo dos componentes de mapa. | Rechazada. |
| Cancelación individual manual guardando cada ID en variables separadas | Requiere declarar múltiples variables y es propensa a errores u omisiones si se añaden más timers. | Rechazada. |

### Decisión: Limpieza explícita de marcadores y mapa

| Opción | Tradeoff | Decisión |
|---|---|---|
| Llamar explícitamente a `.remove()` y asignar `null` a las variables en `onUnmounted` | Asegura que se eliminen del DOM y se rompan las referencias circulares en los closures de los listeners. | **Seleccionada**. Es la única forma garantizada de liberar memoria. |
| Confiar únicamente en `map.remove()` de Mapbox | Deja las variables y closures en memoria, impidiendo que el Garbage Collector libere el contexto. | Rechazada. |

## Data Flow

```
[Componente Montado] ──→ [Carga de Mapbox] ──→ [Registra safeSetTimeout / Marcadores]
                                                               │
[Navegación / Desmontar] ←── [Limpiar safeSetTimeout] ←── [onUnmounted gatillado]
         │
         └──→ [Remover Marcadores del DOM] ──→ [map.remove()] ──→ [Nulificar variables (GC)]
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `../../app/components/BeachMap.vue` | Modify | Añadido el control de timers, limpieza explícita de marcadores y anulación de la variable `map` al desmontar. |
| `../../app/components/BeachDetailMap.vue` | Modify | Añadido el control de timers, limpieza del marcador y anulación de variables `map` y `marker` al desmontar. |

## Interfaces / Contracts

Se añade la función `safeSetTimeout` dentro de la lógica del componente:

```typescript
const timeoutIds = new Set<any>()

function safeSetTimeout(fn: () => void, delay: number) {
  const id = setTimeout(() => {
    timeoutIds.delete(id)
    fn()
  }, delay)
  timeoutIds.add(id)
  return id
}
```

En `onUnmounted`, se limpian de la siguiente forma:

```typescript
timeoutIds.forEach(id => clearTimeout(id))
timeoutIds.clear()
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | No aplica | Lógica local del mapa dependiente de APIs de navegador y DOM de Mapbox. |
| Integration | Pérdida de memoria en cambios de ruta | Ejecutar auditoría en Chrome DevTools Performance Monitor navegando entre mapas y verificar que los DOM Nodes y el JS Heap Size retornen al baseline. |
| E2E | No aplica | No se requiere para problemas de recolección de basura. |

## Migration / Rollout

No migration required.

## Open Questions

- None.
