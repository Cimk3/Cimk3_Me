import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: ()=>import('../layouts/MainLayout.vue'),
    children:[
      {
        path:'',
        name:'home',
        component:()=>import('../views/HomeView.vue'),
        meta:{title:'Home'}
      },
      {
        path:'project',
        name:'project',
        component:()=>import('../views/ProjectView.vue'),
        meta:{title:'Project'}
      },
      {
        path:'blog',
        name:'blog',
        component:()=>import('../views/BlogView.vue'),
        meta:{title:'Blog'}
      },
      {
        path:'connect',
        name:'connect',
        component:()=>import('../views/ConnectView.vue'),
        meta:{title:'Connect'}
      }
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.afterEach((to)=>{
  document.title=to.meta.title?`${to.meta.title}|My Site`:'My Site'
})

export default router
