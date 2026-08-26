import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('../views/HomeView.vue'),
        meta: { title: 'Home' }
      },
      {
        path: 'project',
        name: 'project',
        component: () => import('../views/ProjectView.vue'),
        meta: { title: 'Project' }
      },
      {
        path: 'blog',
        name: 'blog',
        component: () => import('../views/BlogView.vue'),
        meta: { title: 'Blog' }
      },
      {
        path: 'blog/:slug',
        name: 'blog-post',
        component: () => import('../views/BlogPostView.vue'),
        meta: { title: 'Blog' }
      },
      {
        path: 'inspiration',
        name: 'inspiration',
        component: () => import('../views/InspirationView.vue'),
        meta: { title: 'Inspiration' }
      },
      {
        path: 'works',
        name: 'works',
        component: () => import('../views/WorksView.vue'),
        meta: { title: 'Works' }
      },
      {
        path: 'works/:novelId',
        name: 'novel',
        component: () => import('../views/NovelView.vue'),
        meta: { title: 'Works' }
      },
      {
        path: 'works/:novelId/:chapterId',
        name: 'chapter',
        component: () => import('../views/ChapterView.vue'),
        meta: { title: 'Works' }
      },
      {
        path: 'connect',
        name: 'connect',
        component: () => import('../views/ConnectView.vue'),
        meta: { title: 'Connect' }
      }
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title}|My Site` : 'My Site'
})

export default router
