import { createI18n } from 'vue-i18n'

const messages = {
  zh: {
    menu: { home: '主页', project: '项目', blog: '文章', inspiration: '灵感', works: '作品集', connect: '联系我' },
    tooltip: { next: '下一首', theme: '切换主题', lang: '切换语言',background:'背景' },
    msg: { copied: '已复制', notFound: '文章不存在', open: '在浏览器中打开', back: '返回', noPrev: '已是第一章', noNext: '已是最后一章' }
  },
  en: {
    menu: { home: 'Home', project: 'Projects', blog: 'Blog', inspiration: 'Inspiration', works: 'Works', connect: 'Contact' },
    tooltip: { next: 'Next', theme: 'Toggle theme', lang: 'Switch language',background:'Background' },
    msg: { copied: 'Copied', notFound: 'Post not found', open: 'Open in browser', back: 'Back', noPrev: 'First chapter', noNext: 'Last chapter' }
  }
}

const i18n = createI18n({
  legacy: false,                                    // 使用 Composition API 模式
  locale: localStorage.getItem('locale') || 'zh',   // 默认中文，记住用户选择
  fallbackLocale: 'zh',
  messages
})

export default i18n