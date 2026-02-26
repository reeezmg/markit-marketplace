import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from '@ionic/vue'

// ✅ STATIC IMPORTS (NO lazy loading)
import Login from '@/views/Login.vue'
import Shops from '@/views/Shops.vue'
import Products from '@/views/Products.vue'
import Cart from '@/views/Cart.vue'
import Wishlist from '@/views/Wishlist.vue'
import ProductDetails from '@/views/ProductDetails.vue'
import Account from '@/views/Account.vue'
import Profile from '@/views/Profile.vue'
import Address from '@/views/Address.vue'
import AddAddress from '@/views/AddAddress.vue'
import EditAddress from '@/views/EditAddress.vue'
import OrderSuccess from '@/views/OrderSuccess.vue'
import OrderHistory from '@/views/OrderHistory.vue'
import OrderTryDetails from '@/views/OrderTryDetails.vue'
import PrivacyPolicy from '@/views/PrivacyPolicy.vue'
import TermsOfUse from '@/views/TermsOfUse.vue'
import OrderTryPack from '@/views/OrderTryPack.vue'
import KnowMore from '@/components/KnowMore.vue'
import NearbyShops from '@/views/NearbyShops.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/',
    name: 'shops',
    component: Shops,
    meta: { requiresAuth: false }
  },
  {
    path: '/shop/:companyId/:companyName',
    name: 'shop',
    component: Products,
    meta: { requiresAuth: false }
  },
  {
    path: '/cart',
    name: 'cart',
    component: Cart,
    meta: { requiresAuth: false }
  },
  {
    path: '/wishlist',
    name: 'wishlist',
    component: Wishlist,
    meta: { requiresAuth: false }
  },
  {
    path: '/product/:variantId',
    name: 'product',
    component: ProductDetails,
    meta: { requiresAuth: false }
  },
  {
    path: '/account',
    name: 'account',
    component: Account,
    meta: { requiresAuth: false }
  },
  {
    path: '/account/profile',
    name: 'account-profile',
    component: Profile,
    meta: { requiresAuth: false }
  },
  {
    path: '/account/address/:redirect?',
    name: 'account-address',
    component: Address,
    meta: { requiresAuth: false }
  },
  {
    path: '/account/address/add/:redirect?',
    name: 'account-address-add',
    component: AddAddress,
    meta: { requiresAuth: false }
  },
  {
    path: '/account/address/edit/:addressId/:redirect?',
    name: 'account-address-edit',
    component: EditAddress,
    meta: { requiresAuth: false }
  },
  {
    path: '/order-success',
    name: 'order-success',
    component: OrderSuccess,
    meta: { requiresAuth: false }
  },
  {
    path: '/ordersuccess',
    redirect: '/order-success',
  },
  {
    path: '/account/order-history',
    name: 'account-order-history',
    component: OrderHistory,
    meta: { requiresAuth: false }
  },
  {
    path: '/account/order-history/:id',
    name: 'account-order-history-detail',
    component: OrderTryDetails,
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
    component: PrivacyPolicy,
    meta: { requiresAuth: false }
  },
  {
    path: '/account/terms-of-use',
    name: 'account-terms-of-use',
    component: TermsOfUse,
    meta: { requiresAuth: false }
  },
  {
    path: '/pack/:id',
    name: 'pack',
    component: OrderTryPack,
    meta: { requiresAuth: false }
  },
  {
    path: '/know-more',
    name: 'know-more',
    component: KnowMore,
    meta: { requiresAuth: false }
  },
  {
    path: '/knowmore',
    redirect: '/know-more',
  },
  {
    path: '/nearby-shops',
    name: 'nearby-shops',
    component: NearbyShops,
    meta: { requiresAuth: false }
  },
  {
    path: '/nearbyshops',
    redirect: '/nearby-shops',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ✅ Auth Guard
router.beforeEach((to, from, next) => {
  const isAuth = !!localStorage.getItem('token')

  if (to.meta.requiresAuth && !isAuth) {
    return next('/login')
  }

  if (to.meta.guestOnly && isAuth) {
    return next('/')
  }

  next()
})

// ✅ GLOBAL ERROR HANDLER (prevents white screen / stuck navigation)
router.onError((error) => {
  console.error('Router Error:', error)

  if (error?.message?.includes('Failed to fetch dynamically imported module')) {
    window.location.reload()
  }
})

export default router