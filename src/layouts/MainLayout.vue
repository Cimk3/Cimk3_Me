<template>
    <div class="layout">
        <!-- 移动端菜单按钮 + 遮罩 -->
        <button type="button" class="menu-btn" :class="{ open: menuOpen }" :aria-label="t(menuOpen ? 'tooltip.closeMenu' : 'tooltip.menu')" :aria-expanded="menuOpen" aria-controls="site-sidebar" @click="menuOpen = !menuOpen">
            <el-icon :size="20">
                <Icon :icon="menuOpen ? 'mdi:close' : 'mdi:menu'" />
            </el-icon>
        </button>
        <div class="sidebar-mask" v-if="menuOpen" @click="menuOpen = false"></div>
        <!-- 左侧导航栏 -->
        <aside id="site-sidebar" class="sidebar" :class="{ 'has-bg': showBg, 'menu-open': menuOpen }"
            :style="showBg ? sidebarBgStyle : ''">
            <div class="logo">
                <img class="logo-avatar" src="/images/LayoutHead.png" alt="Cimk3" />
            </div>
            <el-menu :default-active="activeMenu" class="sidebar-menu" router background-color="transparent">
                <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
                    <el-icon>
                        <component :is="item.icon" />
                    </el-icon>
                    <span>{{ item.name }}</span>
                </el-menu-item>
            </el-menu>
            <div class="sidebar-footer">
                <button type="button" class="footer-btn music-control" :class="{ playing }" @click="togglePlay"
                    :title="t(playPending ? 'msg.loading' : playing ? 'tooltip.pause' : 'tooltip.play')"
                    :aria-label="t(playPending ? 'msg.loading' : playing ? 'tooltip.pause' : 'tooltip.play')"
                    :aria-pressed="playing" :aria-busy="playPending">
                    <el-icon :size="18"><Icon :icon="playing ? 'fluent:music-note-1-20-filled' : 'fluent:music-note-off-1-20-filled'" /></el-icon>
                </button>
                <button type="button" class="footer-btn music-next" @click="nextTrack" :title="t('tooltip.next')" :aria-label="t('tooltip.next')">
                    <el-icon :size="18"><Icon icon="fluent:arrow-next-20-filled" /></el-icon>
                </button>
                <button type="button" class="footer-btn bg-toggle" :class="{ active: showBg }" @click="toggleBg" :title="t('tooltip.background')" :aria-label="t('tooltip.background')" :aria-pressed="showBg">
                    <el-icon :size="18"><Icon icon="akar-icons:image" /></el-icon>
                </button>
                <button type="button" class="footer-btn theme-toggle" @click="toggleTheme" :title="t('tooltip.theme')" :aria-label="t('tooltip.theme')" :aria-pressed="isDark">
                    <el-icon :size="18"><Moon v-if="isDark" /><Sunny v-else /></el-icon>
                </button>
                <button type="button" class="footer-btn lang-toggle" @click="toggleLocale" :title="t('tooltip.lang')" :aria-label="t('tooltip.lang')">
                    <el-icon :size="18"><Icon :icon="locale === 'zh' ? 'icon-park-outline:english' : 'icon-park-outline:chinese'" /></el-icon>
                </button>
            </div>
        </aside>
        <!-- 右侧内容 -->
        <main class="content" :style="showBg ? contentBgStyle : ''">
            <router-view v-slot="{ Component }">
                <transition name="fade-slide" mode="out-in">
                    <component :is="Component" :key="$route.path" />
                </transition>
            </router-view>
        </main>
        <audio ref="audioEl" :src="currentSrc" preload="none" @playing="playing = true" @pause="playing = false"
            @ended="nextTrack" @error="onAudioError"></audio>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useMusic } from '@/composables/useMusic'
import { showBg } from '@/store/ui'

const { t, locale } = useI18n()
const route = useRoute()
const audioEl = ref(null)
const { playing, playPending, currentSrc, togglePlay, nextTrack, onAudioError } = useMusic(audioEl)
function saveSetting(key, value) {
    try { localStorage.setItem(key, value) } catch { ElMessage.warning(t('msg.saveFailed')) }
}

const menus = computed(() => [
    { path: '/', name: t('menu.home'), icon: 'HomeFilled' },
    { path: '/project', name: t('menu.project'), icon: 'FolderOpened' },
    { path: '/blog', name: t('menu.blog'), icon: 'Notebook' },
    { path: '/inspiration', name: t('menu.inspiration'), icon: 'Star' },
    { path: '/works', name: t('menu.works'), icon: 'Reading' },
    { path: '/connect', name: t('menu.connect'), icon: 'ChatDotRound' }
])

//切换中英文
const toggleLocale = () => {
    locale.value = locale.value === 'zh' ? 'en' : 'zh'
    saveSetting('locale', locale.value)
}

const activeMenu = computed(() => {
    if (route.path.startsWith('/blog')) return '/blog'
    if (route.path.startsWith('/works')) return '/works'
    return route.path
})

// 移动端菜单开关，切换路由后自动收起
const menuOpen = ref(false)
watch(() => route.path, () => {
    menuOpen.value = false
})

let savedTheme
try { savedTheme = localStorage.getItem('theme') } catch { /* Storage may be unavailable. */ }
const isDark = ref(savedTheme === 'dark')
const applyTheme = () => {
    document.documentElement.classList.toggle('dark', isDark.value)
}
applyTheme()
const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
    saveSetting('theme', isDark.value ? 'dark' : 'light')
}

// 背景开关：主页卡片 mp4 背景 + 侧边栏背景图
const toggleBg = () => {
    showBg.value = !showBg.value
}

// 侧边栏背景图样式（内联样式，避免 css-loader 处理 url() 报错）
const sidebarBgStyle = {
    backgroundImage: 'url("/images/leftbgp.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
}

// 右侧内容区背景图样式（内联样式 + 遮罩渐变，保证内容可读；避免 css-loader 处理 url() 报错）
const contentBgStyle = {
    backgroundImage:
        'linear-gradient(var(--content-overlay), var(--content-overlay)), url("/images/rightbgp.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
}
</script>

<style scoped>
.logo-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border-color);
    box-sizing: border-box;
}

.sidebar-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 12px 8px;
}

/* 统一的底部按钮样式 */
.footer-btn {
    border: 0;
    background: transparent;
    font: inherit;
    flex-shrink: 0;
    position: relative;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-secondary);
    transition: color 0.2s, background-color 0.2s;
}

.footer-btn:hover {
    color: var(--el-color-primary);
    background-color: var(--bg-color);
}

.footer-btn.active,
.music-control.playing {
    color: var(--el-color-primary);
}

/* 覆盖全局 .theme-toggle 的内边距，保持按钮尺寸统一 */
.theme-toggle {
    padding: 0;
    gap: 0;
    font-size: inherit;
}

/* 背景开启时：半透明遮罩提升可读性，内容置于遮罩之上 */


.sidebar.has-bg::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: var(--sidebar-overlay);
    pointer-events: none;
    z-index: 0;
}

.sidebar.has-bg .logo,
.sidebar.has-bg .sidebar-menu,
.sidebar.has-bg .sidebar-footer {
    position: relative;
    z-index: 1;
}

/* ===== 移动端适配 ===== */
.menu-btn {
    display: none;
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 1002;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: var(--content-bg);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.sidebar-mask {
    display: none;
}

@media (max-width: 768px) {
    .menu-btn {
        display: flex;
    }

    .sidebar-mask {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 1000;
    }

    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 1001;
        transform: translateX(-100%);
        transition: transform 0.25s ease;
    }

    .sidebar.menu-open {
        transform: translateX(0);
    }

    .content {
        padding: 56px 12px 12px;
    }
}
</style>

<!-- 页面切换过渡（作用于路由页面根元素，需非 scoped） -->
<style>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
