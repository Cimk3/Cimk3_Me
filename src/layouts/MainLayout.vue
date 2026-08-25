<template>
    <div class="layout">
        <!-- 左侧导航栏 -->
        <aside class="sidebar">
            <div class="logo">
                <img class="logo-avatar" src="/images/avatar.jpg" alt="avatar" />
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
                <div class="music-control" :class="{ playing }" @click="togglePlay" title="BGM">
                    <el-icon :size="20">
                        <Icon :icon="playing ? 'fluent:music-note-1-20-filled' : 'fluent:music-note-off-1-20-filled'" />
                    </el-icon>
                </div>
                <div class="music-next" @click="nextTrack" :title="t('tooltip.next')">
                    <el-icon :size="20">
                        <Icon icon="fluent:arrow-next-20-filled" />
                    </el-icon>
                </div>
                <div class="theme-toggle" role="button" @click="toggleTheme" :title="t('tooltip.theme')">
                    <el-icon :size="20">
                        <Moon v-if="isDark" />
                        <Sunny v-else />
                    </el-icon>
                </div>
                <div class="lang-toggle" @click="toggleLocale" :title="t('tooltip.lang')">
                    <span class="lang-label">{{ locale === 'zh' ? '中' : 'EN' }}</span>
                </div>
            </div>
        </aside>
        <!-- 右侧内容 -->
        <main class="content">
            <router-view />
        </main>
        <audio ref="audioEl" :src="currentSrc" preload="none" @play="playing = true" @pause="playing = false"
            @ended="nextTrack"></audio>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed, ref, watch, onMounted } from 'vue'
import { fetchJson } from '@/utils/content'
import { useI18n } from 'vue-i18n'

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
    { path: '/', name: t('menu.home'), icon: 'HomeFilled' },
    { path: '/project', name: t('menu.project'), icon: 'FolderOpened' },
    { path: '/blog', name: t('menu.blog'), icon: 'Notebook' },
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
    gap: 12px;
    padding: 12px 16px;
}

.music-control {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    cursor: pointer;
    color: var(--text-color);
    transition: color 0.2s;
}

.music-control:hover {
    color: var(--el-color-primary);
}

.music-control.playing {
    color: var(--el-color-primary);
}

.music-next {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    cursor: pointer;
    color: var(--text-color);
    transition: color 0.2s;
}

.music-next:hover {
    color: var(--el-color-primary);
}

.theme-toggle {
    padding: 8px;
    gap: 0;
}

.lang-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: 8px;
  cursor: pointer;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 600;
  user-select: none;
  transition: color 0.2s;
}

.lang-toggle:hover {
  color: var(--el-color-primary);
}
</style>