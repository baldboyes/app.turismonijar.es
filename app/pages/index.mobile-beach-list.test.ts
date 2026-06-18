import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import {
  createBeachListStateController,
  getHomeSplitMapLeftPadding,
  HOME_SPLIT_MAP_PADDING_BOTTOM,
  HOME_SPLIT_MAP_PADDING_TOP,
  MOBILE_DRAWER_CLOSE_DELAY_MS,
  shouldHideWeatherPanel,
  shouldMountBeachListDrawer,
  shouldUseHomeSplitLayout,
  type DrawerTargetState,
  type DrawerState
} from './index.mobile-beach-list'

function createRefs(options: { isMounted?: boolean; isVisible?: boolean } = {}) {
  return {
    isBeachListMounted: ref(options.isMounted ?? false),
    isBeachListVisible: ref(options.isVisible ?? false),
    drawerState: ref<DrawerState>('peek'),
    drawerTargetState: ref<DrawerTargetState>('peek')
  }
}

describe('beach list drawer state', () => {
  it('keeps the drawer unmounted initially and hides weather only while visible', () => {
    expect(shouldMountBeachListDrawer(false)).toBe(false)
    expect(shouldHideWeatherPanel(false)).toBe(false)

    expect(shouldMountBeachListDrawer(true)).toBe(true)
    expect(shouldHideWeatherPanel(true)).toBe(true)
    expect(shouldHideWeatherPanel(false, true)).toBe(true)
  })

  it('uses split layout for desktop and tablet landscape only', () => {
    expect(shouldUseHomeSplitLayout(1200, 1600)).toBe(true)
    expect(shouldUseHomeSplitLayout(1280, 720)).toBe(true)
    expect(shouldUseHomeSplitLayout(900, 600)).toBe(true)

    expect(shouldUseHomeSplitLayout(767, 480)).toBe(false)
    expect(shouldUseHomeSplitLayout(768, 1024)).toBe(false)
    expect(shouldUseHomeSplitLayout(1024, 1366)).toBe(false)
    expect(shouldUseHomeSplitLayout(430, 932)).toBe(false)
  })

  it('pads split layout map bounds beyond the floating beach list', () => {
    expect(getHomeSplitMapLeftPadding(0)).toBe(45)
    expect(getHomeSplitMapLeftPadding(900)).toBe(458)
    expect(getHomeSplitMapLeftPadding(1280)).toBe(500)
    expect(HOME_SPLIT_MAP_PADDING_TOP).toBe(90)
    expect(HOME_SPLIT_MAP_PADDING_BOTTOM).toBe(160)
  })

  it('mounts the drawer and declares mid as the target state when opening from the top toggle', () => {
    const refs = createRefs()
    const controller = createBeachListStateController(refs, {
      isClient: true,
      setTimeout: vi.fn()
    })

    controller.toggleBeachList()

    expect(refs.isBeachListMounted.value).toBe(true)
    expect(refs.isBeachListVisible.value).toBe(true)
    expect(refs.drawerTargetState.value).toBe('mid')
  })

  it('closes from the top toggle, declares hidden as the target state, then unmounts after the drawer transition', () => {
    const refs = createRefs({ isMounted: true, isVisible: true })
    refs.drawerTargetState.value = 'mid'
    const setTimeout = vi.fn((callback: () => void) => callback())
    const controller = createBeachListStateController(refs, {
      isClient: true,
      setTimeout
    })

    controller.toggleBeachList()

    expect(refs.isBeachListVisible.value).toBe(false)
    expect(refs.drawerTargetState.value).toBe('hidden')
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), MOBILE_DRAWER_CLOSE_DELAY_MS)
    expect(refs.isBeachListMounted.value).toBe(false)
  })

  it('treats a peek state-change as a close-to-hidden action', () => {
    const refs = createRefs({ isMounted: true, isVisible: true })
    const controller = createBeachListStateController(refs, {
      isClient: false
    })

    controller.handleDrawerStateChange('peek')

    expect(refs.drawerState.value).toBe('peek')
    expect(refs.isBeachListVisible.value).toBe(false)
    expect(refs.isBeachListMounted.value).toBe(false)
    expect(refs.drawerTargetState.value).toBe('hidden')
  })
})
