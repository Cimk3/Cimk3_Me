import { ref } from 'vue'

// 全局背景开关：点击侧边栏图片图标时切换
// true  -> 首页卡片显示 mp4 背景 + 侧边栏显示 leftbgp.jpg 背景
// false -> 恢复无背景
export const showBg = ref(false)
