import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Index.vue') }],
  },

  // Top navigation links

  {
    path: '/about',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/About.vue') }],
  },

  {
    path: '/rules',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Rules.vue') }],
  },

  // User actions

  {
    path: '/signup',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/SignUp.vue') }],
  },

  {
    // Note that we do not use MainLayout here. Confirm email is a minimal page
    // that redirects you to the verify page once the email is confirmed.
    path: '/confirm-email/:verificationToken',
    component: () => import('pages/ConfirmEmail.vue'),
  },

  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/LogIn.vue') }],
  },

  {
    path: '/verify',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Verify.vue') }],
  },

  {
    path: '/forgot-password',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ForgotPassword.vue') }],
  },

  {
    path: '/forgot-password/:email',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ForgotPassword.vue') }],
  },

  {
    path: '/reset-password/:verificationToken',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ResetPassword.vue') }],
  },

  // User actions
  {
    path: '/edit-character',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditCharacter.vue') }],
  },

  // Characters
  {
    path: '/profiles',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Characters.vue') }],
  },

  {
    path: '/:server([A-Z][a-z]+)/:character([^/]+)',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Character.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
