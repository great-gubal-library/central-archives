import { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Index.vue') }],
    meta: {
      title: ''
    }
  },

  // Top navigation links

  {
    path: '/about',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/About.vue') }],
    meta: {
      title: 'About'
    },
  },

  {
    path: '/rules',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Rules.vue') }],
    meta: {
      title: 'Rules'
    },
  },

  {
    path: '/contact',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Contact.vue') }],
    meta: {
      title: 'Contact'
    },
  },

  // User actions

  {
    path: '/signup',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/SignUp.vue') }],
    meta: {
      title: 'Sign Up'
    },
  },

  {
    // Note that we do not use MainLayout here. Confirm email is a minimal page
    // that redirects you to the verify page once the email is confirmed.
    path: '/confirm-email/:verificationToken',
    component: () => import('pages/ConfirmEmail.vue'),
    meta: {
      title: 'Confirm Email'
    },
  },

  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/LogIn.vue') }],
    meta: {
      title: 'Log In'
    },
  },

  {
    path: '/verify',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Verify.vue') }],
    meta: {
      title: 'Verify Account'
    },
  },

  {
    path: '/forgot-password',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ForgotPassword.vue') }],
    meta: {
      title: 'Forgot Password'
    },
  },

  {
    path: '/forgot-password/:email',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ForgotPassword.vue') }],
    meta: {
      title: 'Forgot Password'
    },
  },

  {
    path: '/reset-password/:verificationToken',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ResetPassword.vue') }],
    meta: {
      title: 'Reset Password'
    },
  },

  // User actions
  {
    path: '/edit-character',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditCharacter.vue') }],
    meta: {
      title: 'Edit Profile'
    },
  },

  {
    path: '/my-account',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MyAccount.vue') }],
    meta: {
      title: 'My Account'
    },
  },

  // Stories
  { 
    path: '/stories',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Stories.vue') }],
    meta: {
      title: 'Stories'
    },
  },

  { 
    path: '/story/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Story.vue') }],
  },

  { 
    path: '/create-story',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditStory.vue') }],
    meta: {
      title: 'Create Story'
    },
  },

  { 
    path: '/edit-story/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditStory.vue') }],
    meta: {
      title: 'Edit Story'
    },
  },

  // Events
  {
    path: '/event/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Event.vue') }],
  },

  {
    path: '/create-event',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditEvent.vue') }],
    meta: {
      title: 'Create Event'
    },
  },

  {
    path: '/edit-event/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditEvent.vue') }],
    meta: {
      title: 'Edit Event'
    },
  },

  // Images

  { 
    path: '/image/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Image.vue') }],
  },

  { 
    path: '/gallery/:category',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Gallery.vue') }],
    meta: {
      title: 'Gallery'
    },
  },

  { 
    path: '/my-images',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MyImages.vue') }],
    meta: {
      title: 'My Images'
    },
  },

  // Characters
  {
    path: '/profiles',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Characters.vue') }],
    meta: {
      title: 'Profiles'
    },
  },

  {
    path: '/:server([A-Z][a-z]+)/:character([^/]+)',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Character.vue') }],
    meta: {
      title(route: RouteLocationNormalized): string {
        return (route.params.character as string).replace('_', ' ');
      }
    },
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
