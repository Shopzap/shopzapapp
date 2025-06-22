
// Site configuration
export const siteConfig = {
  name: 'ShopZap',
  description: 'Create your WhatsApp store in minutes',
  url: import.meta.env.PROD ? 'https://shopzap.io' : window.location.origin,
  ogImage: '/opengraph-image.png',
  links: {
    twitter: 'https://twitter.com/shopzap',
    github: 'https://github.com/shopzap',
    instagram: 'https://www.instagram.com/shopzap.io?igsh=bGRnN3UyNXFqZ2hw',
    facebook: 'https://www.facebook.com/profile.php?id=61576632031395&sk='
  },
  api: {
    baseUrl: import.meta.env.DEV ? `${window.location.origin}/api` : 'https://shopzap.io/api',
  },
  store: {
    baseUrl: import.meta.env.DEV ? `${window.location.origin}/store` : 'https://shopzap.io/store',
    generateUrl: (storeName: string) => import.meta.env.DEV ? `${window.location.origin}/store/${storeName}` : `https://shopzap.io/store/${storeName}`
  }
}
