import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { JSDOM } from 'jsdom';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current file directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Supabase configuration
const SUPABASE_URL = "https://fyftegalhvigtrieldan.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5ZnRlZ2FsaHZpZ3RyaWVsZGFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0MDY2NjcsImV4cCI6MjAzMjk4MjY2N30.Nh0Qs9OQkPQYwZKJRQQpXJIKwXLQITwQJQQKMI_xY-I"; // Use service key for admin privileges or fallback to anon key for development

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:8080', 'https://shopzap.io'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
}));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// New route for scraping products
app.post('/api/scrape-product', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format and supported domains
  try {
    const urlObj = new URL(url);
    const supportedDomains = ['amazon.in', 'amazon.com', 'flipkart.com', 'meesho.com', 'myntra.com', 'ajio.com'];
    const isSupported = supportedDomains.some(domain => urlObj.hostname.includes(domain));
    
    if (!isSupported) {
      return res.status(400).json({ 
        error: 'Unsupported website. Please use URLs from Amazon, Flipkart, Meesho, Myntra, or Ajio.' 
      });
    }
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const scraperApiKey = process.env.SCRAPER_API_KEY;

  if (!scraperApiKey) {
    return res.status(500).json({ error: 'ScraperAPI key not configured' });
  }

  const apiUrl = `https://api.scraperapi.com/?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}&render=true`;

  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ScraperAPI error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ 
        error: `Failed to fetch product details: ${response.statusText}` 
      });
    }

    const html = await response.text();
    const dom = new JSDOM.JSDOM(html);
    const document = dom.window.document;

    // Enhanced extraction logic for different sites
    let title = '';
    let description = '';
    let imageUrl = '';
    let price = '';

    const hostname = new URL(url).hostname;

    if (hostname.includes('amazon')) {
      // Amazon-specific selectors
      title = document.querySelector('#productTitle')?.textContent?.trim() ||
              document.querySelector('h1 span')?.textContent?.trim() ||
              document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
              document.title;

      price = document.querySelector('.a-price-whole')?.textContent?.replace(/[^\d]/g, '') ||
              document.querySelector('.a-price .a-offscreen')?.textContent?.replace(/[^\d]/g, '') ||
              document.querySelector('meta[property="product:price:amount"]')?.getAttribute('content');

      imageUrl = document.querySelector('#landingImage')?.getAttribute('src') ||
                 document.querySelector('#imgBlkFront')?.getAttribute('src') ||
                 document.querySelector('.a-dynamic-image')?.getAttribute('src') ||
                 document.querySelector('meta[property="og:image"]')?.getAttribute('content');

      // Amazon description from feature bullets
      const bulletPoints = document.querySelectorAll('#feature-bullets li span');
      const bullets = Array.from(bulletPoints)
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 10)
        .slice(0, 5);
      description = bullets.join('\n') || 
                   document.querySelector('meta[property="og:description"]')?.getAttribute('content');

    } else if (hostname.includes('flipkart')) {
      // Flipkart-specific selectors
      title = document.querySelector('h1')?.textContent?.trim() ||
              document.querySelector('.B_NuCI')?.textContent?.trim() ||
              document.querySelector('meta[property="og:title"]')?.getAttribute('content');

      price = document.querySelector('._30jeq3')?.textContent?.replace(/[^\d]/g, '') ||
              document.querySelector('._2rQ-DZ')?.textContent?.replace(/[^\d]/g, '');

      imageUrl = document.querySelector('._396cs4 img')?.getAttribute('src') ||
                 document.querySelector('._2r_T1I img')?.getAttribute('src') ||
                 document.querySelector('meta[property="og:image"]')?.getAttribute('content');

      description = document.querySelector('._1mXcCf')?.textContent?.trim() ||
                   document.querySelector('meta[property="og:description"]')?.getAttribute('content');

    } else if (hostname.includes('meesho')) {
      // Meesho-specific selectors
      title = document.querySelector('[data-testid="product-name"]')?.textContent?.trim() ||
              document.querySelector('h1')?.textContent?.trim() ||
              document.querySelector('meta[property="og:title"]')?.getAttribute('content');

      price = document.querySelector('[data-testid="product-price"]')?.textContent?.replace(/[^\d]/g, '') ||
              document.querySelector('._3uDYy4')?.textContent?.replace(/[^\d]/g, '');

      imageUrl = document.querySelector('[data-testid="product-image"]')?.getAttribute('src') ||
                 document.querySelector('meta[property="og:image"]')?.getAttribute('content');

      description = document.querySelector('[data-testid="product-description"]')?.textContent?.trim() ||
                   document.querySelector('meta[property="og:description"]')?.getAttribute('content');

    } else {
      // Generic fallback for other sites
      title = document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
              document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
              document.querySelector('h1')?.textContent?.trim() ||
              document.title;

      description = document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                    document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ||
                    document.querySelector('meta[name="description"]')?.getAttribute('content');

      imageUrl = document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                 document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');

      price = document.querySelector('meta[property="product:price:amount"]')?.getAttribute('content') ||
              document.querySelector('[class*="price"]')?.textContent?.replace(/[^\d]/g, '');
    }

    // Clean up extracted data
    title = title ? title.trim().substring(0, 200) : 'Product name not found';
    description = description ? description.trim().substring(0, 1000) : 'Product description not available';
    price = price ? price.replace(/[^\d.]/g, '') : '0';
    imageUrl = imageUrl ? imageUrl.trim() : '';

    // Ensure we have at least basic data
    if (!title || title === 'Product name not found') {
      return res.status(400).json({ 
        error: 'Could not extract product details from this URL. Please try a different product page.' 
      });
    }

    res.status(200).json({
      name: title,
      description: description,
      price: price,
      image_url: imageUrl,
    });

  } catch (error) {
    console.error('Error in scrape-product API:', error);
    res.status(500).json({ 
      error: 'Failed to process product URL. Please check the URL and try again.' 
    });
  }
});

// New Google Sheets import route
app.post('/api/import-products-from-sheet', authenticateUser, async (req, res) => {
  const { sheetUrl } = req.body;
  const userId = req.user.id;

  if (!sheetUrl) {
    return res.status(400).json({ error: 'Google Sheets URL is required' });
  }

  try {
    // Extract sheet ID from URL
    const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
      return res.status(400).json({ error: 'Invalid Google Sheets URL format' });
    }
    const sheetId = sheetIdMatch[1];

    // Get user's store
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('id, username')
      .eq('user_id', userId)
      .single();

    if (storeError || !storeData) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Fetch data from Google Sheets using CSV export
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      return res.status(400).json({ 
        error: 'Failed to access Google Sheet. Please ensure the sheet is shared with "Anyone with the link can view"' 
      });
    }

    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return res.status(400).json({ error: 'Sheet appears to be empty or has no data rows' });
    }

    // Parse CSV (simple parsing, assumes no commas in quoted fields)
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {});
    });

    let successCount = 0;
    let failedCount = 0;
    const errors = [];

    for (const [index, row] of rows.entries()) {
      try {
        const rowNum = index + 2; // +2 because we skip header and arrays are 0-indexed
        
        // Map sheet columns to our product fields (flexible mapping)
        const name = row['Product Name'] || row['Name'] || row['Title'] || '';
        const description = row['Description'] || row['Desc'] || '';
        const price = parseFloat((row['Price'] || '0').toString().replace(/[^\d.]/g, '')) || 0;
        const imageUrl = row['Image URL'] || row['Image'] || '';
        const category = row['Category'] || '';

        if (!name.trim()) {
          errors.push(`Row ${rowNum}: Product name is required`);
          failedCount++;
          continue;
        }

        if (price <= 0) {
          errors.push(`Row ${rowNum}: Valid price is required`);
          failedCount++;
          continue;
        }

        // Generate unique slug
        const { generateUniqueProductSlug } = await import('./src/utils/slugHelpers.js');
        const slug = await generateUniqueProductSlug(storeData.username, name, supabase);

        // Insert product
        const { error: insertError } = await supabase
          .from('products')
          .insert({
            name: name.trim(),
            description: description.trim(),
            price: price,
            image_url: imageUrl.trim() || null,
            images: imageUrl.trim() ? [imageUrl.trim()] : [],
            category: category.trim() || null,
            store_id: storeData.id,
            user_id: userId,
            slug: slug,
            status: 'active',
            is_published: true,
            product_type: 'simple',
            payment_method: 'cod',
            inventory_count: 0
          });

        if (insertError) {
          console.error(`Error inserting product from row ${rowNum}:`, insertError);
          errors.push(`Row ${rowNum}: ${insertError.message}`);
          failedCount++;
        } else {
          successCount++;
        }

      } catch (error) {
        console.error(`Error processing row ${index + 2}:`, error);
        errors.push(`Row ${index + 2}: ${error.message}`);
        failedCount++;
      }
    }

    res.status(200).json({
      message: `Import completed: ${successCount} successful, ${failedCount} failed`,
      success: successCount,
      failed: failedCount,
      errors: errors.slice(0, 10) // Limit errors to first 10
    });

  } catch (error) {
    console.error('Error in Google Sheets import:', error);
    res.status(500).json({ 
      error: 'Failed to import products from Google Sheets. Please check the URL and try again.' 
    });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Authentication failed: Missing or invalid token header');
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      console.log('Authentication failed: Invalid token or no user data', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    
    req.user = data.user;
    console.log('User authenticated:', req.user.id);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

// Store ownership verification middleware
const verifyStoreOwnership = async (req, res, next) => {
  const { storeId } = req.params;
  const userId = req.user.id;
  console.log(`Verifying ownership for storeId: ${storeId} by userId: ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      console.log(`Ownership verification failed for storeId: ${storeId}, error:`, error);
      return res.status(403).json({ error: 'Forbidden: You do not have access to this store' });
    }
    
    console.log(`Ownership verified for storeId: ${storeId}`);
    next();
  } catch (error) {
    console.error('Store ownership verification error:', error);
    return res.status(500).json({ error: 'Internal server error during store verification' });
  }
};

// API Routes

// 1. GET /api/store/:storeId/settings - Fetch complete store settings
app.get('/api/store/:storeId/settings', authenticateUser, verifyStoreOwnership, async (req, res) => {
  const { storeId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();
    
    if (error) {
      console.error('Error fetching store settings:', error);
      return res.status(500).json({ error: 'Failed to fetch store settings' });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    // If theme contains domain, remove it from the response
    if (data.theme && data.theme.domain) {
      delete data.theme.domain;
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in store settings fetch:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. POST /api/store/:storeId/updateStoreInfo - Update store info
app.post('/api/store/:storeId/updateStoreInfo', authenticateUser, verifyStoreOwnership, async (req, res) => {
  const { storeId } = req.params;
  const { storeName, storeDescription, storeLogoUrl, storeBannerUrl } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('stores')
      .update({
        name: storeName,
        description: storeDescription,
        logo_image: storeLogoUrl,
        banner_image: storeBannerUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', storeId)
      .select();
    
    if (error) {
      console.error('Error updating store info:', error);
      return res.status(500).json({ error: 'Failed to update store information' });
    }
    
    return res.status(200).json({ message: 'Store information updated successfully', data });
  } catch (error) {
    console.error('Error in store info update:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. POST /api/store/:storeId/updateAccount - Update account info

// 4. GET /api/store/:storeId/analytics - Fetch store analytics
app.get('/api/store/:storeId/analytics', authenticateUser, verifyStoreOwnership, async (req, res) => {
  const { storeId } = req.params;

  try {
    // Fetch orders for the given storeId
    console.log(`Fetching analytics for storeId: ${storeId}`);
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id, total_amount, created_at, order_items(product_id, quantity, products(name))')
      .eq('store_id', storeId);

    if (ordersError) {
      console.error('Supabase error fetching orders:', ordersError);
      return res.status(500).json({ error: 'Failed to fetch orders from database' });
    }
    console.log('Orders fetched successfully:', orders.length, 'orders');

    if (!orders || orders.length === 0) {
      console.log('No orders found for this store.');
      return res.json({
        totalOrders: 0,
        uniqueCustomers: 0,
        totalRevenue: 0,
        conversionRate: 0,
        salesOverTime: [],
        bestSellingProducts: [],
      });
    }

    // Calculate total orders
    const totalOrders = orders.length;

    // Calculate unique customers
    const uniqueCustomers = new Set(orders.map(order => order.user_id)).size;

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

    // For conversion rate, we need total visits. This data is not available in Supabase directly
    // For now, we'll use a placeholder or assume a fixed number of visits.
    // In a real application, this would come from analytics tracking (e.g., Google Analytics).
    const totalVisits = 10000; // Placeholder for total visits
    const conversionRate = totalVisits > 0 ? (totalOrders / totalVisits) * 100 : 0;

    // Calculate sales over time
    const salesOverTimeMap = orders.reduce((acc, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + order.total;
      return acc;
    }, {});
    const salesOverTime = Object.keys(salesOverTimeMap).map(date => ({
      date,
      sales: salesOverTimeMap[date]
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate best-selling products
    const productSalesMap = {};
    orders.forEach(order => {
      if (order.order_items) {
        order.order_items.forEach(item => {
          const productName = item.products ? item.products.name : 'Unknown Product';
          productSalesMap[productName] = (productSalesMap[productName] || 0) + item.quantity;
        });
      }
    });

    const bestSellingProducts = Object.keys(productSalesMap).map(productName => ({
      name: productName,
      unitsSold: productSalesMap[productName]
    })).sort((a, b) => b.unitsSold - a.unitsSold);

    res.json({
      totalOrders,
      uniqueCustomers,
      totalRevenue,
      conversionRate,
      salesOverTime,
      bestSellingProducts,
    });
  } catch (error) {
    console.error('Unhandled error in analytics endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/store/:storeId/updateAccount', authenticateUser, verifyStoreOwnership, async (req, res) => {
  const { storeId } = req.params;
  const { username, email } = req.body;
  
  try {
    // Check username availability if it's being changed
    if (username) {
      const { data: usernameCheck, error: usernameError } = await supabase
        .rpc('check_username_availability', { username });
      
      if (usernameError) {
        console.error('Error checking username availability:', usernameError);
        return res.status(500).json({ error: 'Failed to check username availability' });
      }
      
      if (!usernameCheck) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
    }
    
    // Update store account info
    const { data, error } = await supabase
      .from('stores')
      .update({
        username: username,
        business_email: email,
        updated_at: new Date().toISOString()
      })
      .eq('id', storeId)
      .select();
    
    if (error) {
      console.error('Error updating account info:', error);
      return res.status(500).json({ error: 'Failed to update account information' });
    }
    
    return res.status(200).json({ message: 'Account information updated successfully', data });
  } catch (error) {
    console.error('Error in account info update:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. POST /api/store/:storeId/changePassword - Change password
app.post('/api/store/:storeId/changePassword', authenticateUser, verifyStoreOwnership, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;
  
  try {
    // Update user password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({ error: 'Failed to change password' });
    }
    
    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error in password change:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. POST /api/store/:storeId/updateBranding - Update branding
app.post('/api/store/:storeId/updateBranding', authenticateUser, verifyStoreOwnership, async (req, res) => {
  const { storeId } = req.params;
  const { subdomain, brandColor } = req.body;
  
  try {
    // Get current store data to update theme
    const { data: storeData, error: fetchError } = await supabase
      .from('stores')
      .select('theme')
      .eq('id', storeId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching store data:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch store data' });
    }
    
    // Prepare theme object
    const currentTheme = storeData.theme || {};
    const updatedTheme = {
      ...currentTheme,
      primary_color: brandColor,
      subdomain: subdomain
      // domain field removed
    };
    
    // Update store branding
    const { data, error } = await supabase
      .from('stores')
      .update({
        theme: updatedTheme,
        updated_at: new Date().toISOString()
      })
      .eq('id', storeId)
      .select();
    
    if (error) {
      console.error('Error updating branding:', error);
      return res.status(500).json({ error: 'Failed to update branding' });
    }
    
    return res.status(200).json({ message: 'Branding updated successfully', data });
  } catch (error) {
    console.error('Error in branding update:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. POST /api/store/:storeId/updateContact - Update contact info
app.post('/api/store/:storeId/updateContact', authenticateUser, verifyStoreOwnership, async (req, res) => {
  const { storeId } = req.params;
  const { businessEmail, phoneNumber, socialLinks } = req.body;
  
  try {
    // Get current store data to update theme
    const { data: storeData, error: fetchError } = await supabase
      .from('stores')
      .select('theme')
      .eq('id', storeId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching store data:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch store data' });
    }
    
    // Prepare theme object with social links
    const currentTheme = storeData.theme || {};
    const updatedTheme = {
      ...currentTheme,
      social_links: socialLinks
    };
    
    // Update store contact info
    const { data, error } = await supabase
      .from('stores')
      .update({
        business_email: businessEmail,
        phone_number: phoneNumber,
        theme: updatedTheme,
        updated_at: new Date().toISOString()
      })
      .eq('id', storeId)
      .select();
    
    if (error) {
      console.error('Error updating contact info:', error);
      return res.status(500).json({ error: 'Failed to update contact information' });
    }
    
    return res.status(200).json({ message: 'Contact information updated successfully', data });
  } catch (error) {
    console.error('Error in contact info update:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 7. DELETE /api/store/:storeId - Delete store
app.delete('/api/store/:storeId', authenticateUser, verifyStoreOwnership, async (req, res) => {
  const { storeId } = req.params;
  
  try {
    // Delete store
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId);
    
    if (error) {
      console.error('Error deleting store:', error);
      return res.status(500).json({ error: 'Failed to delete store' });
    }
    
    return res.status(200).json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Error in store deletion:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Order Management Endpoints

// 1. POST /api/orders - Create a new order
app.post('/api/orders', async (req, res) => {
  console.log('Order creation request received:', req.body);
  
  const { storeId, buyerName, buyerEmail, buyerPhone, buyerAddress, totalPrice, items } = req.body;
  
  // Validate required fields
  if (!storeId) {
    console.log('Missing storeId');
    return res.status(400).json({ 
      error: true, 
      message: 'Store ID is required' 
    });
  }
  
  if (!buyerName || !buyerName.trim()) {
    console.log('Missing buyerName');
    return res.status(400).json({ 
      error: true, 
      message: 'Buyer name is required' 
    });
  }
  
  if (!buyerPhone || !buyerPhone.trim()) {
    console.log('Missing buyerPhone');
    return res.status(400).json({ 
      error: true, 
      message: 'Phone number is required' 
    });
  }
  
  if (!buyerAddress || !buyerAddress.trim()) {
    console.log('Missing buyerAddress');
    return res.status(400).json({ 
      error: true, 
      message: 'Address is required' 
    });
  }
  
  if (!totalPrice || totalPrice <= 0) {
    console.log('Invalid totalPrice:', totalPrice);
    return res.status(400).json({ 
      error: true, 
      message: 'Valid total price is required' 
    });
  }
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.log('Missing or invalid items:', items);
    return res.status(400).json({ 
      error: true, 
      message: 'Order items are required' 
    });
  }
  
  // Validate each item has required productId and valid pricing
  for (const item of items) {
    if (!item.productId) {
      console.log('Missing productId in item:', item);
      return res.status(400).json({ 
        error: true, 
        message: 'All items must have a valid product ID' 
      });
    }
    
    if (!item.priceAtPurchase || item.priceAtPurchase <= 0) {
      console.log('Invalid price in item:', item);
      return res.status(400).json({ 
        error: true, 
        message: 'All items must have valid pricing' 
      });
    }
    
    if (!item.quantity || item.quantity <= 0) {
      console.log('Invalid quantity in item:', item);
      return res.status(400).json({ 
        error: true, 
        message: 'All items must have valid quantity' 
      });
    }
  }
  
  try {
    console.log('Creating order in database...');
    
    // Create the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id: storeId,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone,
        buyer_address: buyerAddress,
        total_price: totalPrice,
        status: 'pending'
      })
      .select()
      .single();
    
    if (orderError) {
      console.error('Error creating order:', orderError);
      return res.status(500).json({ 
        error: true, 
        message: 'Something went wrong. Please try again or contact the seller.' 
      });
    }
    
    console.log('Order created successfully:', orderData.id);
    
    // Create order items
    const orderItems = items.map(item => ({
      order_id: orderData.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_at_purchase: item.priceAtPurchase
    }));
    
    console.log('Creating order items:', orderItems);
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', orderData.id);
      return res.status(500).json({ 
        error: true, 
        message: 'Something went wrong. Please try again or contact the seller.' 
      });
    }
    
    console.log('Order items created successfully');
    
    // Create initial status history entry
    await supabase
      .from('order_status_history')
      .insert({
        order_id: orderData.id,
        status: 'pending',
        notes: 'Order placed successfully'
      });
    
    console.log('Order process completed successfully');
    
    return res.status(201).json({ 
      success: true,
      message: 'Order created successfully', 
      orderId: orderData.id,
      order: orderData 
    });
  } catch (error) {
    console.error('Unexpected error in order creation:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'Something went wrong. Please try again or contact the seller.' 
    });
  }
});

// 2. PUT /api/orders/:orderId/status - Update order status
app.put('/api/orders/:orderId/status', authenticateUser, async (req, res) => {
  const { orderId } = req.params;
  const { status, notes, trackingNumber, shippingCarrier, estimatedDeliveryDate } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  
  try {
    // Verify order ownership
    const { data: orderCheck, error: checkError } = await supabase
      .from('orders')
      .select('store_id')
      .eq('id', orderId)
      .single();
    
    if (checkError || !orderCheck) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Verify store ownership
    const { data: storeCheck, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', orderCheck.store_id)
      .eq('user_id', req.user.id)
      .single();
    
    if (storeError || !storeCheck) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this order' });
    }
    
    // Update order
    const updateData = { status, updated_at: new Date().toISOString() };
    
    if (trackingNumber) updateData.tracking_number = trackingNumber;
    if (shippingCarrier) updateData.shipping_carrier = shippingCarrier;
    if (estimatedDeliveryDate) updateData.estimated_delivery_date = estimatedDeliveryDate;
    
    // Set timestamps based on status
    if (status === 'shipped' && !orderCheck.shipped_at) {
      updateData.shipped_at = new Date().toISOString();
    }
    if (status === 'delivered' && !orderCheck.delivered_at) {
      updateData.delivered_at = new Date().toISOString();
    }
    
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating order:', updateError);
      return res.status(500).json({ error: 'Failed to update order' });
    }
    
    // Add status history entry
    await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status: status,
        notes: notes || null
      });
    
    return res.status(200).json({ 
      message: 'Order status updated successfully', 
      order: updatedOrder 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// File Upload Endpoints

// 1. POST /api/upload/logo - Upload logo
app.post('/api/upload/logo', authenticateUser, upload.single('logo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath);
    const fileName = `logos/${Date.now()}-${req.file.originalname}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('store-assets')
      .upload(fileName, fileContent, {
        contentType: req.file.mimetype,
        upsert: true
      });
    
    // Clean up local file
    fs.unlinkSync(filePath);
    
    if (error) {
      console.error('Error uploading logo to storage:', error);
      return res.status(500).json({ error: 'Failed to upload logo' });
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('store-assets')
      .getPublicUrl(fileName);
    
    return res.status(200).json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('Error in logo upload:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. POST /api/upload/banner - Upload banner
app.post('/api/upload/banner', authenticateUser, upload.single('banner'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath);
    const fileName = `banners/${Date.now()}-${req.file.originalname}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('store-assets')
      .upload(fileName, fileContent, {
        contentType: req.file.mimetype,
        upsert: true
      });
    
    // Clean up local file
    fs.unlinkSync(filePath);
    
    if (error) {
      console.error('Error uploading banner to storage:', error);
      return res.status(500).json({ error: 'Failed to upload banner' });
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('store-assets')
      .getPublicUrl(fileName);
    
    return res.status(200).json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('Error in banner upload:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Server started successfully!');
});
