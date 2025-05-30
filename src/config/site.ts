// Site configuration
export const siteConfig = {
  name: 'ShopZap',
  description: 'Create your WhatsApp store in minutes',
  url: 'https://shopzap.io',
  ogImage: 'https://shopzap.io/opengraph-image.png',
  links: {
    twitter: 'https://twitter.com/shopzap',
    github: 'https://github.com/shopzap'
  },
  api: {
    baseUrl: 'https://shopzap.io/api',
  },
  store: {
    baseUrl: 'https://shopzap.io/store',
    generateUrl: (storeName: string) => `https://shopzap.io/store/${storeName}`
  }
}