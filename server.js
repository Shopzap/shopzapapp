import express from 'express';
import cors from 'cors';
import multer from 'multer';
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

// Serve static files from the public directory


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
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    
    req.user = data.user;
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
  
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this store' });
    }
    
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add a catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});