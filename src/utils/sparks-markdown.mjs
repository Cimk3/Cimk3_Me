import { Marked } from 'marked'

const escapeAttribute = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const markdown = new Marked({
  renderer: {
    html() { return '' },
    image() { return '' },
    link({ href, tokens }) {
      const label = this.parser.parseInline(tokens)
      // Resolve relative links too, while rejecting executable URL schemes.
      let url
      try { url = new URL(href, 'https://example.invalid/') } catch { return label }
      if (!['https:', 'http:', 'mailto:'].includes(url.protocol)) return label
      return `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`
    }
  }
})

export const renderSpark = source => markdown.parse(source)
