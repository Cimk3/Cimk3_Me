const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const vue = require('vue')
const babel = require('@babel/core')

// Run the real composables with Vue's lifecycle and mocked browser/service boundaries.
function loadModule(file, mocks = {}) {
  const filename = path.join(__dirname, '../src', file)
  const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    filename, babelrc: false, configFile: false, plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')]
  })
  const exports = {}
  vm.runInNewContext(code, { exports, require: name => mocks[name] || require(name) }, { filename })
  return exports
}
const flush = () => new Promise(resolve => setImmediate(resolve))
const renderer = vue.createRenderer({
  createComment: () => ({}), createText: () => ({}), createElement: () => ({}),
  insert() {}, remove() {}, setText() {}, setElementText() {}, patchProp() {}, parentNode() {}, nextSibling() {}
})

async function musicHarness(t, playlist = async () => [{ src: 'one.mp3' }, { src: 'two.mp3' }]) {
  const messages = []
  const audio = { paused: true, error: null, calls: 0, load() { this.error = null }, pause() { this.paused = true }, async play() { this.calls++; this.paused = false } }
  const { useMusic } = loadModule('composables/useMusic.js', {
    'vue-i18n': { useI18n: () => ({ t: key => key }) },
    'element-plus': { ElMessage: { warning: key => messages.push(key), info: key => messages.push(key) } },
    '@/utils/content': { fetchJson: playlist }
  })
  let state
  const app = renderer.createApp({ setup() { state = useMusic(vue.ref(audio)); return () => null } })
  app.mount({})
  t.after(() => app.unmount())
  await flush()
  return { state, audio, messages }
}

test('music follows actual playback, pauses, and retries after a rejected play', async t => {
  const { state, audio, messages } = await musicHarness(t)
  audio.play = async () => { throw Object.assign(new Error(), { name: 'NotAllowedError' }) }
  await state.togglePlay()
  assert.equal(state.playing.value, false)
  assert.equal(state.playPending.value, false)
  assert.deepEqual(messages, ['music.blocked'])
  audio.play = async () => { audio.paused = false }
  await state.togglePlay()
  assert.equal(state.playing.value, true)
  await state.togglePlay()
  assert.equal(state.playing.value, false)
  assert.equal(audio.paused, true)
})

test('music playlist failure can be retried from the playback button', async t => {
  let attempts = 0
  const { state, messages } = await musicHarness(t, async () => {
    if (++attempts === 1) throw new Error('offline')
    return [{ src: 'recovered.mp3' }]
  })
  assert.deepEqual(messages, ['music.listFailed'])
  await state.togglePlay()
  assert.equal(attempts, 2)
  assert.equal(state.playing.value, true)
  assert.equal(state.currentSrc.value, 'recovered.mp3')
})

test('empty playlist does not attempt playback', async t => {
  const { state, audio, messages } = await musicHarness(t, async () => [])
  await state.togglePlay()
  assert.equal(audio.calls, 0)
  assert.deepEqual(messages, ['music.empty'])
})

test('rapid track change ignores the old playback rejection', async t => {
  const { state, audio, messages } = await musicHarness(t)
  const requests = []
  audio.play = () => new Promise((resolve, reject) => requests.push({ resolve, reject }))
  const first = state.togglePlay()
  await flush()
  const second = state.nextTrack()
  await flush()
  assert.equal(requests.length, 2)
  requests[0].reject(Object.assign(new Error(), { name: 'AbortError' }))
  await first
  audio.paused = false
  requests[1].resolve()
  await second
  assert.equal(state.currentSrc.value, 'two.mp3')
  assert.equal(state.playing.value, true)
  assert.deepEqual(messages, [])
})

test('one resource failure produces one warning and clears the playing state', async t => {
  const { state, audio, messages } = await musicHarness(t)
  await state.togglePlay()
  audio.error = { code: 4 }
  state.onAudioError()
  state.onAudioError()
  assert.equal(state.playing.value, false)
  assert.deepEqual(messages, ['music.resourceFailed'])
})

test('content retry ignores obsolete failures and clears previous errors', async () => {
  const { useContent } = loadModule('composables/useContent.js')
  const requests = []
  const scope = vue.effectScope()
  const state = scope.run(() => useContent(() => new Promise((resolve, reject) => requests.push({ resolve, reject }))))
  const first = state.load()
  const second = state.load()
  requests[1].resolve('new')
  await second
  requests[0].reject(new Error('old'))
  await first
  assert.equal(state.data.value, 'new')
  assert.equal(state.error.value, null)
  const failed = state.load()
  requests[2].reject(new Error('network'))
  await failed
  assert.equal(state.error.value.message, 'network')
  const retry = state.load()
  assert.equal(state.error.value, null)
  requests[3].resolve('recovered')
  await retry
  assert.equal(state.data.value, 'recovered')
  scope.stop()
})

test('closing a dialog invalidates in-flight content', async () => {
  const { useContent } = loadModule('composables/useContent.js')
  let complete
  const scope = vue.effectScope()
  const state = scope.run(() => useContent(() => new Promise(resolve => { complete = resolve }), 'original'))
  const pending = state.load()
  state.invalidate()
  complete('obsolete')
  await pending
  assert.equal(state.data.value, 'original')
  scope.stop()
})
