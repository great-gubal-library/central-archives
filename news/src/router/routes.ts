import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Index.vue') }],
    meta: {
      title: ''
    }
  },

  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/LogIn.vue') }],
    meta: {
      title: 'Log In'
    }
  },

  { 
    path: '/create-article',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditArticle.vue') }],
    meta: {
      title: 'Create Article'
    },
  },

  { 
    path: '/edit-article/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditArticle.vue') }],
    meta: {
      title: 'Edit Article'
    },
  },

  { 
    path: '/my-articles',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MyArticles.vue') }],
    meta: {
      title: 'My Articles'
    },
  },

  { 
    path: '/submitted',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Submitted.vue') }],
    meta: {
      title: 'Submitted Articles'
    },
  },

  {
    path: '/issue/:id([0-9]+)',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Issue.vue') }],
    meta: {
      title: ''
    }
  },

  {
    path: '/:year([0-9]{4})/:month([0-9]{2})/:day([0-9]{2})/:slug',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Article.vue') }],
    meta: {
      title: ''
    }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
    meta: {
      title: 'Error'
    },
  },
];

export default routes;
