<template>
    <div class="layout">
        <!-- 左侧导航栏 -->
        <aside class="sidebar">
            <div class="logo">
                <img class="logo-avatar" :src="avatarSrc" alt="avatar" />
            </div>
            <el-menu :default-active="activeMenu" class="sidebar-menu" router background-color="transparent">
                <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
                    <el-icon>
                        <component :is="item.icon" />
                    </el-icon>
                    <span>{{ item.name }}</span>
                </el-menu-item>
            </el-menu>
            <div class="theme-toggle" role="button" @click="toggleTheme">
                <el-icon :size="20">
                    <Moon v-if="isDark" />
                    <Sunny v-else />
                </el-icon>
                <span>{{ isDark ? '暗色' : '亮色' }}</span>
            </div>
        </aside>

        <!-- 右侧内容 -->
        <main class="content">
            <router-view />
        </main>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'

const route = useRoute()

const base = process.env.BASE_URL || '/'
const avatarSrc = `${base}images/avatar.jpg`

const menus = [
    {
        path: '/',
        name: '主页Home',
        icon: 'HomeFilled'
    },
    {
        path: '/project',
        name: '项目Project',
        icon: 'FolderOpened'
    },
    {
        path: '/blog',
        name: '文章Blog',
        icon: 'Notebook',
    },
    {
        path: '/connect',
        name: '联系我Contact',
        icon: 'ChatDotRound'
    }
]

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
</style>