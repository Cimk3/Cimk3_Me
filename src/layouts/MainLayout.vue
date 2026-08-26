<template>
    <div class="layout">
        <!-- 移动端菜单按钮 + 遮罩 -->
        <div class="menu-btn" :class="{ open: menuOpen }" @click="menuOpen = !menuOpen">
            <el-icon :size="20">
                <Icon :icon="menuOpen ? 'mdi:close' : 'mdi:menu'" />
            </el-icon>
        </div>
        <div class="sidebar-mask" v-if="menuOpen" @click="menuOpen = false"></div>
        <!-- 左侧导航栏 -->
        <aside class="sidebar" :class="{ 'has-bg': showBg, 'menu-open': menuOpen }"
            :style="showBg ? sidebarBgStyle : ''">
            <div class="logo">
                <img class="logo-avatar" src="/images/LayoutHead.png" alt="avatar" />
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
                <div class="footer-btn music-control" :class="{ playing }" @click="togglePlay" title="BGM">
                    <el-icon :size="18">
                        <Icon :icon="playing ? 'fluent:music-note-1-20-filled' : 'fluent:music-note-off-1-20-filled'" />
                    </el-icon>
                </div>
                <div class="footer-btn music-next" @click="nextTrack" :title="t('tooltip.next')">
                    <el-icon :size="18">
                        <Icon icon="fluent:arrow-next-20-filled" />
                    </el-icon>
                </div>
                <div class="footer-btn bg-toggle" :class="{ active: showBg }" @click="toggleBg" title="背景">
                    <el-icon :size="18">
                        <Icon icon="akar-icons:image" />
                    </el-icon>
                </div>
                <div class="footer-btn theme-toggle" role="button" @click="toggleTheme" :title="t('tooltip.theme')">
                    <el-icon :size="18">
                        <Moon v-if="isDark" />
                        <Sunny v-else />
                    </el-icon>
                </div>
                <div class="footer-btn lang-toggle" @click="toggleLocale" :title="t('tooltip.lang')">
                    <el-icon :size="18">
                        <Icon :icon="locale === 'zh' ? 'icon-park-outline:english' : 'icon-park-outline:chinese'" />
                    </el-icon>
                </div>
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
        <audio ref="audioEl" :src="currentSrc" preload="none" @play="playing = true" @pause="playing = false"
            @ended="nextTrack"></audio>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed, ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchJson } from '@/utils/content'
import { showBg } from '@/store/ui'

const { t, locale } = useI18n()
const route = useRoute()
// ===== BGM 播放逻辑 =====
const tracks = ref([])          // 播放列表
const currentIndex = ref(0)     // 当前曲目下标
const playing = ref(false)      // 是否正在播放
const audioEl = ref(null)       // audio 元素引用

const currentTrack = computed(() => tracks.value[currentIndex.value])
const currentSrc = computed(() => currentTrack.value?.src || '')

// 挂载时加载播放列表
onMounted(async () => {
    try {
        tracks.value = await fetchJson('data/music.json')
    } catch {
        tracks.value = []
    }
})

// 安全播放：捕获 play() 被中断/失败的 Promise 拒绝，避免报错
const playAudio = () => {
    const audio = audioEl.value
    if (!audio) return
    audio.play().catch(() => { })
}

// 点击音乐图标：播放/暂停切换
const togglePlay = () => {
    const audio = audioEl.value
    if (!audio || !tracks.value.length) return
    playing.value ? audio.pause() : playAudio()
}

// 一曲结束 → 自动下一首；最后一首结束 → 回到第一首（循环）
const nextTrack = () => {
    if (!tracks.value.length) return
    currentIndex.value = (currentIndex.value + 1) % tracks.value.length
    playing.value = true // 确保切歌后自动播放（兼容部分浏览器 on ended 触发 pause 的情况）
}

// 曲目变化后，若处于播放状态则自动播放新歌
watch(currentSrc, () => {
    const audio = audioEl.value
    if (audio && playing.value) {
        playAudio()
    }
}, { flush: 'post' })
// ===== BGM 播放逻辑结束 =====

const menus = computed(() => [
    { path: '/', name: t('menu.home'), icon: 'House' },
    { path: '/project', name: t('menu.project'), icon: 'FolderOpened' },
    { path: '/blog', name: t('menu.blog'), icon: 'Notebook' },
    { path: '/inspiration', name: t('menu.inspiration'), icon: 'Star' },
    { path: '/connect', name: t('menu.connect'), icon: 'ChatDotRound' }
])

//切换中英文
const toggleLocale = () => {
    locale.value = locale.value === 'zh' ? 'en' : 'zh'
    localStorage.setItem('locale', locale.value)
}

const activeMenu = computed(() =>
    route.path.startsWith('/blog') ? '/blog' : route.path
)

// 移动端菜单开关，切换路由后自动收起
const menuOpen = ref(false)
watch(() => route.path, () => {
    menuOpen.value = false
})

const isDark = ref(localStorage.getItem('theme') === 'dark')
const applyTheme = () => {
    document.documentElement.classList.toggle('dark', isDark.value)
}
applyTheme()
const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
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
.sidebar.has-bg {
    position: relative;
}

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