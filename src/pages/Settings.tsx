import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { storeSettingsApi, fileUploadApi } from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tables } from '@/integrations/supabase/types';

const Settings = () => {
  const { user } = useAuth();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Store Information State
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  // Account Settings State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Branding & Domain State
  const [subdomain, setSubdomain] = useState('');
  const [brandColor, setBrandColor] = useState('#6366F1');
  
  // Contact & Social Media State
  const [businessEmail, setBusinessEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  
  // Delete Store Dialog State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // Fetch store data on component mount
  useEffect(() => {
    if (user) {
      fetchStoreData();
    }
  }, [user]);
  
  const fetchStoreData = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, you would get the storeId from the user's profile or context
      // For now, we'll use the user's ID as the storeId
      const currentStoreId = user?.id;
      
      if (!currentStoreId) {
        toast.error('Unable to fetch store data. User ID not found.');
        return;
      }
      
      setStoreId(currentStoreId);
      
      // Fetch store settings from API
      const storeData = await storeSettingsApi.getStoreSettings(currentStoreId);
      
      // Populate form fields with store data
      setStoreName(storeData.name || '');
      setStoreDescription(storeData.description || '');
      setLogoPreview(storeData.logo_image || null);
      setBannerPreview(storeData.banner_image || null);
      setUsername(storeData.username || '');
      setEmail(storeData.business_email || '');
      setBusinessEmail(storeData.business_email || '');
      setPhoneNumber(storeData.phone_number || '');
      
      // Extract theme data
      if (storeData.theme && typeof storeData.theme === 'object') {
        const theme = storeData.theme as any;
        setBrandColor(theme.primary_color || '#6366F1');
        
        // Extract social links if available
        if (theme.social_links) {
          setWhatsappLink(theme.social_links.whatsapp || '');
          setInstagramLink(theme.social_links.instagram || '');
          setFacebookLink(theme.social_links.facebook || '');
        }
      }
      
    } catch (error) {
      console.error('Error fetching store data:', error);
      toast.error('Failed to load store settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle file uploads
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };
  
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
    }
  };
  
  // Form submission handlers
  const handleStoreInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    
    try {
      setIsSaving(true);
      
      let logoUrl = logoPreview;
      let bannerUrl = bannerPreview;
      
      // Upload logo if a new file is selected
      if (logoFile) {
        const uploadResult = await fileUploadApi.uploadLogo(logoFile);
        logoUrl = uploadResult.url;
      }
      
      // Upload banner if a new file is selected
      if (bannerFile) {
        const uploadResult = await fileUploadApi.uploadBanner(bannerFile);
        bannerUrl = uploadResult.url;
      }
      
      // Update store info
      await storeSettingsApi.updateStoreInfo(storeId, {
        storeName,
        storeDescription,
        storeLogoUrl: logoUrl,
        storeBannerUrl: bannerUrl
      });
      
      toast.success('Store information updated successfully');
    } catch (error) {
      console.error('Error updating store info:', error);
      toast.error('Failed to update store information');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    
    try {
      setIsSaving(true);
      
      // Update account info
      await storeSettingsApi.updateAccount(storeId, {
        username,
        email
      });
      
      toast.success('Account information updated successfully');
    } catch (error) {
      console.error('Error updating account info:', error);
      toast.error('Failed to update account information');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Change password
      await storeSettingsApi.changePassword(storeId, {
        oldPassword,
        newPassword
      });
      
      // Reset form and close dialog
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordDialog(false);
      
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleBrandingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    
    try {
      setIsSaving(true);
      
      // Update branding
      await storeSettingsApi.updateBranding(storeId, {
        subdomain,
        brandColor
      });
      
      toast.success('Branding updated successfully');
    } catch (error) {
      console.error('Error updating branding:', error);
      toast.error('Failed to update branding');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    
    try {
      setIsSaving(true);
      
      // Update contact info
      await storeSettingsApi.updateContact(storeId, {
        businessEmail,
        phoneNumber,
        socialLinks: {
          whatsapp: whatsappLink,
          instagram: instagramLink,
          facebook: facebookLink
        }
      });
      
      toast.success('Contact information updated successfully');
    } catch (error) {
      console.error('Error updating contact info:', error);
      toast.error('Failed to update contact information');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteStore = async () => {
    if (!storeId) return;
    
    // Validate confirmation text
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Delete store
      await storeSettingsApi.deleteStore(storeId);
      
      setShowDeleteDialog(false);
      toast.success('Store deleted successfully');
      
      // Redirect to home or login page
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting store:', error);
      toast.error('Failed to delete store');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading store settings...</span>
      </div>
    );
  }
  
  return (
    <div className="flex h-full">
      {/* Main content area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8">Store Settings</h1>

        {/* Store Information Section */}
        <section id="store-info" className="mb-10 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Store Information</h2>
          <form className="space-y-6" onSubmit={handleStoreInfoSubmit}>
            <div>
              <Label htmlFor="store-name">Store Name</Label>
              <Input 
                id="store-name" 
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)} 
                placeholder="My Awesome Store" 
                className="mt-1" 
                required 
              />
            </div>
            <div>
              <Label htmlFor="store-description">Store Description</Label>
              <Textarea 
                id="store-description" 
                value={storeDescription} 
                onChange={(e) => setStoreDescription(e.target.value)} 
                placeholder="A brief description of your store..." 
                className="mt-1" 
                rows={4} 
              />
            </div>
            <div>
              <Label htmlFor="upload-logo">Upload Logo</Label>
              <Input 
                id="upload-logo" 
                type="file" 
                onChange={handleLogoChange} 
                className="mt-1" 
                accept="image/*" 
              />
              {/* Logo preview */}
              {logoPreview && (
                <div className="mt-2 w-32 h-32 border border-gray-300 rounded-md overflow-hidden">
                  <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                </div>
              )}
              {!logoPreview && (
                <div className="mt-2 w-32 h-32 border border-gray-300 rounded-md flex items-center justify-center text-gray-400">
                  Logo Preview
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="upload-banner">Upload Banner Image</Label>
              <Input 
                id="upload-banner" 
                type="file" 
                onChange={handleBannerChange} 
                className="mt-1" 
                accept="image/*" 
              />
              {/* Banner preview */}
              {bannerPreview && (
                <div className="mt-2 w-full h-32 border border-gray-300 rounded-md overflow-hidden">
                  <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </form>
        </section>

        {/* Account Settings Section */}
        <section id="account-settings" className="mb-10 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Account Settings</h2>
          <form className="space-y-6" onSubmit={handleAccountSubmit}>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="mt-1" 
                required 
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="mt-1 bg-gray-100" 
                readOnly 
              />
            </div>
            <div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowPasswordDialog(true)}
              >
                Change Password
              </Button>
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </form>
        </section>

        {/* Branding & Domain Section */}
        <section id="branding-domain" className="mb-10 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Branding & Domain</h2>
          <form className="space-y-6" onSubmit={handleBrandingSubmit}>
            <div>
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <Input 
                  id="subdomain" 
                  value={subdomain} 
                  onChange={(e) => setSubdomain(e.target.value)} 
                  className="flex-1 rounded-none rounded-l-md" 
                  placeholder="mystore" 
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  .shopzap.io
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="brand-color">Brand Color</Label>
              <Input 
                id="brand-color" 
                type="color" 
                value={brandColor} 
                onChange={(e) => setBrandColor(e.target.value)} 
                className="mt-1 w-24 h-10" 
              />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </form>
        </section>

        {/* Contact & Social Media Section */}
        <section id="contact-social" className="mb-10 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Contact & Social Media</h2>
          <form className="space-y-6" onSubmit={handleContactSubmit}>
            <div>
              <Label htmlFor="business-email">Business Email</Label>
              <Input 
                id="business-email" 
                type="email" 
                value={businessEmail} 
                onChange={(e) => setBusinessEmail(e.target.value)} 
                className="mt-1" 
                placeholder="contact@yourstore.com" 
                required 
              />
            </div>
            <div>
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input 
                id="phone-number" 
                type="tel" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)} 
                className="mt-1" 
                placeholder="+1 (555) 123-4567" 
                required 
              />
            </div>
            <div>
              <Label>Social Links</Label>
              <Input 
                type="url" 
                value={whatsappLink} 
                onChange={(e) => setWhatsappLink(e.target.value)} 
                className="mt-1 mb-2" 
                placeholder="WhatsApp Link" 
              />
              <Input 
                type="url" 
                value={instagramLink} 
                onChange={(e) => setInstagramLink(e.target.value)} 
                className="mt-1 mb-2" 
                placeholder="Instagram Link" 
              />
              <Input 
                type="url" 
                value={facebookLink} 
                onChange={(e) => setFacebookLink(e.target.value)} 
                className="mt-1" 
                placeholder="Facebook Link" 
              />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </form>
        </section>

        {/* Security & Danger Zone Section */}
        <section id="security-danger" className="mb-10 p-6 bg-white rounded-lg shadow border-2 border-red-200">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-red-700">Security & Danger Zone</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="password-protection" className="text-sm font-medium text-gray-700">
                Store password protection
              </Label>
              {/* Toggle switch */}
              <div className="relative inline-block w-14 align-middle select-none transition duration-200 ease-in">
                <input 
                  type="checkbox" 
                  id="toggle" 
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" 
                />
                <label 
                  htmlFor="toggle" 
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                ></label>
              </div>
            </div>
            <div>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Store
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="old-password">Current Password</Label>
                <Input 
                  id="old-password" 
                  type="password" 
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : 'Change Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Store Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Store</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              This action cannot be undone. This will permanently delete your store, all products, and customer data.
            </p>
            <div>
              <Label htmlFor="delete-confirm">
                Please type <span className="font-bold">DELETE</span> to confirm
              </Label>
              <Input 
                id="delete-confirm" 
                value={deleteConfirmText} 
                onChange={(e) => setDeleteConfirmText(e.target.value)} 
                className="mt-1" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteStore} 
              disabled={isSaving || deleteConfirmText !== 'DELETE'}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : 'Delete Store'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;