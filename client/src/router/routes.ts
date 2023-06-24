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

  {
    path: '/privacy-statement',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/PrivacyStatement.vue') }],
    meta: {
      title: 'Privacy Statement'
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
    // Note that we do not use MainLayout here. Confirm email is a minimal page
    // that redirects you to the verify page once the email is confirmed.
    path: '/confirm-new-email/:verificationToken',
    component: () => import('pages/ConfirmNewEmail.vue'),
    meta: {
      title: 'Confirm New Email'
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
    path: '/edit-character/:id',
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

  // Noticeboard
  { 
    path: '/noticeboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Noticeboard.vue') }],
    meta: {
      title: 'Noticeboard'
    },
  },

  { 
    path: '/noticeboard/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/NoticeboardItem.vue') }],
  },

  { 
    path: '/create-noticeboard-item',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditNoticeboardItem.vue') }],
    meta: {
      title: 'Create Noticeboard Item'
    },
  },

  { 
    path: '/edit-noticeboard-item/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditNoticeboardItem.vue') }],
    meta: {
      title: 'Edit Noticeboard Item'
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

  {
    path: '/event-calendar',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EventCalendar.vue') }],
  },

  {
    path: '/event-calendar/:year/:month',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EventCalendar.vue') }],
    meta: {
      title: 'Event Calendar'
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
  },

  { 
    path: '/my-content',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MyContent.vue') }],
    meta: {
      title: 'My Content'
    },
  },

  { 
    path: '/edit-image/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditImage.vue') }],
    meta: {
      title: 'Edit Image'
    },
  },

  // Venues

  { 
    path: '/venues',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Venues.vue') }],
    meta: {
      title: 'Venues'
    },
  },

  { 
    path: '/my-venues',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MyVenues.vue') }],
    meta: {
      title: 'My Venues'
    },
  },

  {
    path: '/venue/:server/:name',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Venue.vue') }],
  },

  { 
    path: '/venue/:id([0-9]+)',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Venue.vue') }],
  },

  { 
    path: '/create-venue',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditVenue.vue') }],
    meta: {
      title: 'Create Venue'
    },
  },

  { 
    path: '/edit-venue/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditVenue.vue') }],
    meta: {
      title: 'Edit Venue'
    },
  },

  // Communities

  { 
    path: '/communities',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Communities.vue') }],
    meta: {
      title: 'Communities'
    },
  },

  { 
    path: '/my-communities',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MyCommunities.vue') }],
    meta: {
      title: 'My Communities'
    },
  },

  {
    path: '/community/:name',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Community.vue') }],
  },

  { 
    path: '/create-community',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditCommunity.vue') }],
    meta: {
      title: 'Create Community'
    },
  },

  { 
    path: '/edit-community/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditCommunity.vue') }],
    meta: {
      title: 'Edit Community'
    },
  },

  // Free Companies

  { 
    path: '/my-free-company',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MyFreeCompany.vue') }],
    meta: {
      title: 'My Free Company'
    },
  },

  { 
    path: '/free-companies',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/FreeCompanies.vue') }],
    meta: {
      title: 'Free Companies'
    },
  },

  {
    path: '/fc/:server([A-Z][a-z]+)/:fc([^/]+)',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/FreeCompany.vue') }],
    meta: {
      title(route: RouteLocationNormalized): string {
        return (route.params.fc as string).replace(/_/g, ' ');
      }
    },
  },

  { 
    path: '/edit-free-company/:server([A-Z][a-z]+)/:fc([^/]+)',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditFreeCompany.vue') }],
    meta: {
      title: 'Edit Free Company'
    },
  },

  // Wiki

  {
    path: '/wiki/:title',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Wiki.vue') }],
  },

  { 
    path: '/create-wiki-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditWikiPage.vue') }],
    meta: {
      title: 'Create Wiki Page'
    },
  },

  { 
    path: '/edit-wiki-page/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditWikiPage.vue') }],
    meta: {
      title: 'Edit Wiki Page'
    },
  },

  // Player profiles

  {
    path: '/player/:id/:name',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/PlayerProfile.vue') }],
  },

  {
    path: '/player/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/PlayerProfile.vue') }],
  },

  // Links
  
  {
    path: '/link/:name',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Link.vue') }],
    meta: {
      title: 'Link'
    },
  },

  // Search
  {
    path: '/search',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Search.vue') }],
    meta: {
      title: 'Search'
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
        return (route.params.character as string).replace(/_/g, ' ');
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
