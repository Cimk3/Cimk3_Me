export async function copyText(text, clipboard = globalThis.navigator?.clipboard) {
  if (!clipboard?.writeText) throw new Error('Clipboard unavailable')
  await clipboard.writeText(text)
}
