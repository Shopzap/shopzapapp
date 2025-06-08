
// Site configuration
export const siteConfig = {
  name: 'ShopZap',
  description: 'Create your WhatsApp store in minutes',
  url: 'https://shopzap.io',
  ogImage: 'https://shopzap.io/opengraph-image.png',
  links: {
    twitter: 'https://twitter.com/shopzap',
    github: 'https://github.com/shopzap',
    instagram: 'https://www.instagram.com/shopzap.io?igsh=bGRnN3UyNXFqZ2hw',
    facebook: 'https://www.facebook.com/profile.php?id=61576632031395&sk='
  },
  api: {
    baseUrl: import.meta.env.DEV ? 'http://localhost:3000/api' : 'https://shopzap.io/api',
  },
  store: {
    baseUrl: import.meta.env.DEV ? 'http://localhost:8080/store' : 'https://shopzap.io/store',
    generateUrl: (storeName: string) => import.meta.env.DEV ? `http://localhost:8080/store/${storeName}` : `https://shopzap.io/store/${storeName}`
  }
}
