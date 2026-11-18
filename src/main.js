import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import {
  ArrowLeft, ArrowRight, ChatDotRound, Close, Collection, CopyDocument,
  Document, Files, FolderOpened, HomeFilled, Moon, Notebook, Reading,
  Right, Search, Star, Sunny, Tools, TopRight
} from '@element-plus/icons-vue'
import GithubIcon from './components/GithubIcon.vue'
import './styles/index.css'
import { Icon } from '@iconify/vue'
import i18n from './i18n'

const app = createApp(App)

const icons = {
  ArrowLeft, ArrowRight, ChatDotRound, Close, Collection, CopyDocument,
  Document, Files, FolderOpened, HomeFilled, Moon, Notebook, Reading,
  Right, Search, Star, Sunny, Tools, TopRight
}
for (const [key, component] of Object.entries(icons)) {
  app.component(key, component)
}
app.component('GithubIcon', GithubIcon)
app.component('Icon', Icon)
app.use(ElementPlus)
app.use(router)
app.use(i18n)
app.mount('#app')
