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
        meta: { titleKey: 'menu.home' }
      },
      {
        path: 'project',
        name: 'project',
        component: () => import('../views/ProjectView.vue'),
        meta: { titleKey: 'menu.project' }
      },
      {
        path: 'blog',
        name: 'blog',
        component: () => import('../views/BlogView.vue'),
        meta: { titleKey: 'menu.blog' }
      },
      {
        path: 'blog/:slug',
        name: 'blog-post',
        component: () => import('../views/BlogPostView.vue'),
        meta: { titleKey: 'menu.blog' }
      },
      {
        path: 'inspiration',
        name: 'inspiration',
        component: () => import('../views/InspirationView.vue'),
        meta: { titleKey: 'menu.inspiration' }
      },
      {
        path: 'works',
        name: 'works',
        component: () => import('../views/WorksView.vue'),
        meta: { titleKey: 'menu.works' }
      },
      {
        path: 'works/:novelId',
        name: 'novel',
        component: () => import('../views/NovelView.vue'),
        meta: { titleKey: 'menu.works' }
      },
      {
        path: 'works/:novelId/:chapterId',
        name: 'chapter',
        component: () => import('../views/ChapterView.vue'),
        meta: { titleKey: 'menu.works' }
      },
      {
        path: 'resources',
        name: 'resources',
        component: () => import('../views/ResourcesView.vue'),
        meta: { titleKey: 'menu.resources' }
      },
      {
        path: 'resources/:collectionId',
        name: 'resource-collection',
        component: () => import('../views/ResourcesView.vue'),
        meta: { titleKey: 'menu.resources' }
      },
      {
        path: 'connect',
        name: 'connect',
        component: () => import('../views/ConnectView.vue'),
        meta: { titleKey: 'menu.connect' }
      }
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
