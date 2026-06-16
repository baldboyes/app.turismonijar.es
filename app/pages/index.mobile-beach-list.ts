import type { Ref } from 'vue'

export type DrawerState = 'peek' | 'mid' | 'full'
export type DrawerTargetState = 'hidden' | DrawerState

export const MOBILE_DRAWER_CLOSE_DELAY_MS = 420
export const HOME_SPLIT_DESKTOP_MIN_WIDTH = 1200
export const HOME_SPLIT_TABLET_MIN_WIDTH = 768

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
