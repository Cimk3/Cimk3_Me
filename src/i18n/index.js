import { createI18n } from 'vue-i18n'

export const messages = {
  zh: {
    menu: { home: '主页', project: '项目', blog: '文章', inspiration: '灵感', works: '作品集', connect: '联系我' },
    tooltip: { next: '下一首', theme: '切换主题', lang: '切换语言', background: '切换背景', play: '播放音乐', pause: '暂停音乐', menu: '打开菜单', closeMenu: '关闭菜单' },
    msg: { copied: '已复制', copyFailed: '复制失败，请选中联系方式手动复制。', open: '打开链接', back: '返回', noPrev: '已是第一章', noNext: '已是最后一章', retry: '重试', close: '关闭', empty: '暂时没有内容', loading: '正在加载', chineseBody: '正文为中文。', saveFailed: '设置已生效，但未能保存，下次打开可能需要重新选择。' },
    project: { highlights: '功能亮点', approach: '制作方式', source: '源码', website: '官网', demo: '体验网站' },
    contact: { email: '邮箱', qq: 'QQ', wechat: '微信', xiaohongshu: '小红书', github: 'GitHub', gitee: 'Gitee', copy: '复制{label}' },
    music: { loading: '歌单正在加载，请稍候。', empty: '歌单为空，暂时无法播放。', listFailed: '歌单加载失败，请点击音乐按钮重试。', playFailed: '音乐播放失败，请点击播放重试。', blocked: '浏览器暂未允许播放，请再次点击播放。', resourceFailed: '当前音频无法加载，请重试或切换下一首。' },
    error: { title: '加载失败', network: '网络连接失败，请检查网络后重试。', notFound: '请求的内容不存在。', http: '内容加载失败（HTTP {status}），请稍后重试。', json: '内容数据格式错误，请稍后重试。', unknown: '内容加载失败，请重试。' }
  },
  en: {
    menu: { home: 'Home', project: 'Projects', blog: 'Blog', inspiration: 'Inspiration', works: 'Works', connect: 'Contact' },
    tooltip: { next: 'Next track', theme: 'Toggle theme', lang: 'Switch language', background: 'Toggle background', play: 'Play music', pause: 'Pause music', menu: 'Open menu', closeMenu: 'Close menu' },
    msg: { copied: 'Copied', copyFailed: 'Could not copy. Select the contact details and copy them manually.', open: 'Open link', back: 'Back', noPrev: 'First chapter', noNext: 'Last chapter', retry: 'Retry', close: 'Close', empty: 'No content yet', loading: 'Loading', chineseBody: 'The body text is in Chinese.', saveFailed: 'Your setting is active but could not be saved. You may need to select it again next time.' },
    project: { highlights: 'Highlights', approach: 'How it was made', source: 'Source code', website: 'Website', demo: 'Visit demo' },
    contact: { email: 'Email', qq: 'QQ', wechat: 'WeChat', xiaohongshu: 'Xiaohongshu', github: 'GitHub', gitee: 'Gitee', copy: 'Copy {label}' },
    music: { loading: 'The playlist is loading. Please wait.', empty: 'The playlist is empty.', listFailed: 'Could not load the playlist. Click the music button to retry.', playFailed: 'Playback failed. Click Play to retry.', blocked: 'The browser has not allowed playback. Click Play again.', resourceFailed: 'This audio could not be loaded. Retry or choose the next track.' },
    error: { title: 'Loading failed', network: 'Could not connect. Check your connection and retry.', notFound: 'The requested content was not found.', http: 'Could not load content (HTTP {status}). Please retry later.', json: 'The content data has an invalid format. Please retry later.', unknown: 'Could not load content. Please retry.' }
  }
}

let savedLocale
try { savedLocale = localStorage.getItem('locale') } catch { /* Storage may be unavailable. */ }
const i18n = createI18n({ legacy: false, locale: savedLocale === 'en' ? 'en' : 'zh', fallbackLocale: 'zh', messages })
export default i18n
