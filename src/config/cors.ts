// CORS configuration
export const corsConfig = {
  origin: [
    'https://shopzap.io',
    // Add other allowed origins here for development/staging
    process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : null,
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
}