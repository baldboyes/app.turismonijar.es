import type { Ref } from 'vue'

export type DrawerState = 'peek' | 'mid' | 'full'
export type DrawerTargetState = 'hidden' | DrawerState

export const MOBILE_DRAWER_CLOSE_DELAY_MS = 420
export const HOME_SPLIT_DESKTOP_MIN_WIDTH = 1200
export const HOME_SPLIT_TABLET_MIN_WIDTH = 768
export const HOME_SPLIT_LIST_SIDE_MARGIN = 40
export const HOME_SPLIT_LIST_MAX_WIDTH = 420
export const HOME_SPLIT_LIST_VIEWPORT_RATIO = 0.42
export const HOME_SPLIT_MAP_PADDING_TOP = 90
export const HOME_SPLIT_MAP_PADDING_BOTTOM = 160

type BeachListStateRefs = {
  isBeachListMounted: Ref<boolean>
  isBeachListVisible: Ref<boolean>
  drawerState: Ref<DrawerState>
  drawerTargetState: Ref<DrawerTargetState>
}

type BeachListStateOptions = {
  isClient: boolean
  setTimeout?: (callback: () => void, delay: number) => void
}

export function shouldMountBeachListDrawer(isBeachListMounted: boolean) {
  return isBeachListMounted
}

export function shouldUseHomeSplitLayout(width: number, height: number) {
  if (width >= HOME_SPLIT_DESKTOP_MIN_WIDTH) {
    return true
  }

  return width >= HOME_SPLIT_TABLET_MIN_WIDTH && width > height
}

export function getHomeSplitMapLeftPadding(width: number) {
  if (width <= 0) return 45

  const listWidth = Math.min(HOME_SPLIT_LIST_MAX_WIDTH, width * HOME_SPLIT_LIST_VIEWPORT_RATIO)
  return Math.round(HOME_SPLIT_LIST_SIDE_MARGIN + listWidth + HOME_SPLIT_LIST_SIDE_MARGIN)
}

export function shouldHideWeatherPanel(isBeachListVisible: boolean, isSplitLayout = false) {
  return isSplitLayout || isBeachListVisible
}

export function createBeachListStateController(
  refs: BeachListStateRefs,
  options: BeachListStateOptions
) {
  function openBeachList() {
    refs.isBeachListMounted.value = true
    refs.isBeachListVisible.value = true
    refs.drawerTargetState.value = 'mid'
  }

  function closeBeachList() {
    refs.isBeachListVisible.value = false
    refs.drawerTargetState.value = 'hidden'

    if (options.isClient) {
      options.setTimeout?.(() => {
        if (!refs.isBeachListVisible.value) {
          refs.isBeachListMounted.value = false
        }
      }, MOBILE_DRAWER_CLOSE_DELAY_MS)
    } else {
      refs.isBeachListMounted.value = false
    }
  }

  function toggleBeachList() {
    if (refs.isBeachListVisible.value) {
      closeBeachList()
    } else {
      openBeachList()
    }
  }

  function handleDrawerStateChange(state: DrawerState) {
    refs.drawerState.value = state

    if (state === 'peek' && refs.isBeachListVisible.value) {
      closeBeachList()
    }
  }

  return {
    openBeachList,
    closeBeachList,
    toggleBeachList,
    handleDrawerStateChange
  }
}
