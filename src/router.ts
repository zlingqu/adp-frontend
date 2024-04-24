import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: 'homepage',
    },
    {
      path: '*',
      redirect: 'homepage',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/Login.vue'),
    },
    {
      path: '/homepage',
      name: 'homepage',
      component: () => import('@/pages/Homepage.vue'),
    },
    {
      path: '/environment-management',
      name: 'environment-management',
      component: () => import('@/pages/Environment.vue'),
    },
    {
      path: '/space-management',
      name: 'space-management',
      component: () => import('@/pages/Space.vue'),
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: () => import('@/pages/User.vue'),
    },
    {
      path: '/project-management',
      name: 'project-management',
      component: () => import('@/pages/Project.vue'),
    },
    {
      path: '/deployment-management',
      name: 'deployment-management',
      component: () => import('@/pages/Deployment.vue'),
    },
    {
      path: '/log-management',
      name: 'log-management',
      component: () => import('@/pages/Log.vue'),
    },
  ],
});
