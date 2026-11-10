import { shallowRef, watchEffect, onScopeDispose } from 'vue'
import { useRoute } from 'vue-router'

export const detailTitle = shallowRef(null)

export function usePageTitle(getTitle) {
  const path = useRoute().path
  const owner = Symbol('title')
  watchEffect(() => { detailTitle.value = { owner, path, title: getTitle() } })
  onScopeDispose(() => {
    if (detailTitle.value?.owner === owner) detailTitle.value = null
  })
}
