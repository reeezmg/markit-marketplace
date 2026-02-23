import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from '@ionic/vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/',
    name: 'shops',
    component: () => import('@/views/Shops.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/shop/:companyId/:companyName',
    name: 'shop',
    component: () => import('@/views/Products.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/views/Cart.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/wishlist',
    name: 'wishlist',
    component: () => import('@/views/Wishlist.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/wishlist',
    redirect: '/wishlist',
  },
  {
    path: '/product/:variantId',
    name: 'product',
    component: () => import('@/views/ProductDetails.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account',
    name: 'account',
    component: () => import('@/views/Account.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account/profile',
    name: 'account-profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account/address/:redirect?',
    name: 'account-address',
    component: () => import('@/views/Address.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account/address/add/:redirect?',
    name: 'account-address-add',
    component: () => import('@/views/AddAddress.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account/address/edit/:addressId/:redirect?',
    name: 'account-address-edit',
    component: () => import('@/views/EditAddress.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/order-success',
    name: 'order-success',
    component: () => import('@/views/OrderSuccess.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/ordersuccess',
    redirect: '/order-success',
  },
  {
    path: '/account/order-history',
    name: 'account-order-history',
    component: () => import('@/views/OrderHistory.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account/order-history/:id',
    name: 'account-order-history-detail',
    component: () => import('@/views/OrderTryDetails.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account/orderhistory',
    redirect: '/account/order-history',
  },
  {
    path: '/account/orderhistory/:id',
    redirect: to => `/account/order-history/${to.params.id}`,
  },
  {
    path: '/account/privacy-policy',
    name: 'account-privacy-policy',
    component: () => import('@/views/PrivacyPolicy.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account/terms-of-use',
    name: 'account-terms-of-use',
    component: () => import('@/views/TermsOfUse.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/pack/:id',
    name: 'pack',
    component: () => import('@/views/OrderTryPack.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/know-more',
    name: 'know-more',
    component: () => import('@/components/KnowMore.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/knowmore',
    redirect: '/know-more',
  },
  {
    path: '/nearby-shops',
    name: 'nearby-shops',
    component: () => import('@/views/NearbyShops.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/nearbyshops',
    redirect: '/nearby-shops',
  },
];


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// ✅ Add your global navigation guard here
router.beforeEach((to, from, next) => {
  const isAuth = !!localStorage.getItem('token'); // For production, replace with SecureStorage

  if (to.meta.requiresAuth && !isAuth) {
    return next('/login');
  }

  if (to.meta.guestOnly && isAuth) {
    return next('/');
  }

  next();
});

export default router;
