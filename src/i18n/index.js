import { createI18n } from 'vue-i18n'

const messages = {
  zh: {
    menu: { home: '主页', project: '项目', blog: '文章', connect: '联系我' },
    tooltip: { next: '下一首', theme: '切换主题', lang: '切换语言' },
    msg: { copied: '已复制', notFound: '文章不存在', open: '在浏览器中打开' }
  },
  en: {
    menu: { home: 'Home', project: 'Projects', blog: 'Blog', connect: 'Contact' },
    tooltip: { next: 'Next', theme: 'Toggle theme', lang: 'Switch language' },
    msg: { copied: 'Copied', notFound: 'Post not found', open: 'Open in browser' }
  }
}

const i18n = createI18n({
  legacy: false,                                    // 使用 Composition API 模式
  locale: localStorage.getItem('locale') || 'zh',   // 默认中文，记住用户选择
  fallbackLocale: 'zh',
  messages
})

export default i18n