import { ref, onMounted, onScopeDispose } from 'vue'

export function useContent(loader, initial = null) {
  const data = ref(initial)
  const loading = ref(true)
  const error = ref(null)
  let generation = 0
  async function load(...args) {
    const request = ++generation
    loading.value = true
    error.value = null
    try {
      const result = await loader(...args)
      if (request === generation) data.value = result
    } catch (cause) {
      if (request === generation) error.value = cause
    } finally {
      if (request === generation) loading.value = false
    }
  }
  function invalidate() { generation++ }
  onScopeDispose(invalidate)
  return { data, loading, error, load, invalidate }
}

export function useMountedContent(loader, initial = null) {
  const state = useContent(loader, initial)
  onMounted(() => state.load())
  return state
}
