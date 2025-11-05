import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    component: () => import('@/views/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/',
    component: () => import('@/views/Shops.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/shop/:companyId/:companyName',
    component: () => import('@/views/Products.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/cart',
    component: () => import('@/views/Cart.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/whishlist',
    component: () => import('@/views/Whishlist.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/product/:variantId',
    component: () => import('@/views/ProductDetails.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account',
    component: () => import('@/views/Account.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account/profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account/address/:redirect?',
    component: () => import('@/views/Address.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account/address/add/:redirect?',
    component: () => import('@/views/AddAddress.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account/address/edit/:addressId/:redirect?',
    component: () => import('@/views/EditAddress.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/ordersuccess',
    component: () => import('@/views/OrderSuccess.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account/orderhistory',
    component: () => import('@/views/orderHistory.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account/orderhistory/:id',
    component: () => import('@/views/orderTryDetails.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/pack/:id',
    component: () => import('@/views/orderTryPack.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/knowmore',
    component: () => import('@/views/KnowMore.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/nearbyshops',
    component: () => import('@/views/NearbyShops.vue'),
    meta: { requiresAuth: false }
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
    return next('/tab1');
  }

  next();
});

export default router;
