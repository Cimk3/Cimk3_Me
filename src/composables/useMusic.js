import { ref, computed, onMounted, onScopeDispose, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { fetchJson } from '@/utils/content'

export function useMusic(audioEl) {
  const { t } = useI18n()
  const tracks = ref([])
  const currentIndex = ref(0)
  const playing = ref(false)
  const loadingTracks = ref(true)
  const listFailed = ref(false)
  const playPending = ref(false)
  const currentSrc = computed(() => tracks.value[currentIndex.value]?.src || '')
  let generation = 0
  let reported = -1
  let disposed = false
  const notify = (key, request = generation) => {
    if (disposed || reported === request) return
    reported = request
    ElMessage.warning(t(`music.${key}`))
  }
  async function loadTracks() {
    loadingTracks.value = true
    listFailed.value = false
    try {
      const result = await fetchJson('/data/music.json')
      if (!Array.isArray(result) || result.some(track => typeof track.src !== 'string')) throw new Error('playlist')
      if (!disposed) { tracks.value = result; currentIndex.value = 0 }
    } catch {
      if (!disposed) { listFailed.value = true; notify('listFailed', ++generation) }
    } finally {
      if (!disposed) loadingTracks.value = false
    }
  }
  async function play() {
    const audio = audioEl.value
    if (!audio || disposed) return
    const request = ++generation
    playPending.value = true
    if (audio.error) audio.load()
    try {
      await audio.play()
      if (request === generation) playing.value = !audio.paused
    } catch (error) {
      if (request !== generation || disposed) return
      playing.value = false
      notify(error.name === 'NotAllowedError' ? 'blocked' : 'playFailed', request)
    } finally {
      if (request === generation) playPending.value = false
    }
  }
  async function ensureTracks() {
    if (loadingTracks.value) { ElMessage.info(t('music.loading')); return false }
    if (listFailed.value) await loadTracks()
    if (listFailed.value || disposed) return false
    if (!tracks.value.length) { notify('empty', ++generation); return false }
    return true
  }
  async function togglePlay() {
    if (playing.value || playPending.value) {
      generation++
      audioEl.value?.pause()
      playing.value = false
      playPending.value = false
      return
    }
    if (await ensureTracks()) { await nextTick(); await play() }
  }
  async function nextTrack() {
    if (!await ensureTracks()) return
    const request = ++generation
    audioEl.value?.pause()
    playing.value = false
    playPending.value = false
    currentIndex.value = (currentIndex.value + 1) % tracks.value.length
    await nextTick()
    if (request !== generation || disposed) return
    audioEl.value?.load()
    await play()
  }
  function onAudioError() {
    if (!audioEl.value?.error || !currentSrc.value) return
    playing.value = false
    playPending.value = false
    notify('resourceFailed')
  }
  onMounted(loadTracks)
  onScopeDispose(() => { disposed = true; generation++; audioEl.value?.pause() })
  return { playing, playPending, currentSrc, togglePlay, nextTrack, onAudioError }
}
