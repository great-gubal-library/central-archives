import { SiteRegion } from '@app/shared/enums/region.enum';
import { useRegion } from 'src/boot/region';
import { getRegionOrigin } from 'src/common/hssp';
import { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';

function regionGuard() {
  if (useRegion() === SiteRegion.GLOBAL) {
    return '/';
  }
}

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
    beforeEnter(_, from) {
      if (useRegion() === SiteRegion.GLOBAL) {
        return true;
      }

      window.location.assign(`${getRegionOrigin(SiteRegion.GLOBAL)}/login?host=${encodeURIComponent(window.location.host)}&redirect=${encodeURIComponent(from.fullPath)}`);
      return false;
    },
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
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Stories.vue') }],
    meta: {
      title: 'Stories'
    },
  },

  {
    path: '/story/:id',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Story.vue') }],
  },

  {
    path: '/create-story',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditStory.vue') }],
    meta: {
      title: 'Create Story'
    },
  },

  {
    path: '/edit-story/:id',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditStory.vue') }],
    meta: {
      title: 'Edit Story'
    },
  },

  // Noticeboard
  {
    path: '/noticeboard',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Noticeboard.vue') }],
    meta: {
      title: 'Noticeboard'
    },
  },

  {
    path: '/noticeboard/:id',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/NoticeboardItem.vue') }],
  },

  {
    path: '/create-noticeboard-item',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditNoticeboardItem.vue') }],
    meta: {
      title: 'Create Noticeboard Item'
    },
  },

  {
    path: '/edit-noticeboard-item/:id',
    beforeEnter: regionGuard,
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
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditEvent.vue') }],
    meta: {
      title: 'Create Event'
    },
  },

  {
    path: '/edit-event/:id',
    beforeEnter: regionGuard,
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
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Venues.vue') }],
    meta: {
      title: 'Venues'
    },
  },

  {
    path: '/my-venues',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MyVenues.vue') }],
    meta: {
      title: 'My Venues'
    },
  },

  {
    path: '/venue/:server/:name',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Venue.vue') }],
  },

  {
    path: '/venue/:id([0-9]+)',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Venue.vue') }],
  },

  {
    path: '/create-venue',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditVenue.vue') }],
    meta: {
      title: 'Create Venue'
    },
  },

  {
    path: '/edit-venue/:id',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditVenue.vue') }],
    meta: {
      title: 'Edit Venue'
    },
  },

  // Communities

  {
    path: '/communities',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Communities.vue') }],
    meta: {
      title: 'Communities'
    },
  },

  {
    path: '/my-communities',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MyCommunities.vue') }],
    meta: {
      title: 'My Communities'
    },
  },

  {
    path: '/community/:name',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Community.vue') }],
  },

  {
    path: '/create-community',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditCommunity.vue') }],
    meta: {
      title: 'Create Community'
    },
  },

  {
    path: '/edit-community/:id',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditCommunity.vue') }],
    meta: {
      title: 'Edit Community'
    },
  },

  // Free Companies

  {
    path: '/my-free-company',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MyFreeCompany.vue') }],
    meta: {
      title: 'My Free Company'
    },
  },

  {
    path: '/free-companies',
    beforeEnter: regionGuard,
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/FreeCompanies.vue') }],
    meta: {
      title: 'Free Companies'
    },
  },

  {
    path: '/fc/:server([A-Z][a-z]+)/:fc([^/]+)',
    beforeEnter: regionGuard,
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
    beforeEnter: regionGuard,
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

  {
    path: '/edit-player-profile',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditPlayerProfile.vue') }],
    meta: {
      title: 'Edit Player Profile'
    },
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
