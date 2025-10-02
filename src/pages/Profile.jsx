import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { User, Mail, Phone, MapPin, Save, Edit, X, AlertTriangle, Shield } from 'lucide-react';

const Profile = () => {
  const { user, updateUserProfile, refreshUserDetails, deactivateAccount } = useAuth();
  const { showSuccess, showError, showConfirm } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        password: ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Only include password if it's provided
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      await updateUserProfile(updateData);
      setIsEditing(false);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      // Error is handled by global error handler
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      password: ''
    });
    setIsEditing(false);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshUserDetails();
      showSuccess('Profile refreshed successfully!');
    } catch (error) {
      // Error is handled by global error handler
      console.error('Error refreshing profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    const confirmed = await showConfirm(
      'Deactivate Account',
      'Are you sure you want to deactivate your account? This action cannot be undone and you will be logged out immediately.',
      {
        confirmText: 'Yes, Deactivate',
        cancelText: 'Cancel',
        type: 'danger'
      }
    );
    
    if (confirmed) {
      const doubleConfirmed = await showConfirm(
        'Final Confirmation',
        'This will permanently deactivate your account. Are you absolutely sure?',
        {
          confirmText: 'Yes, I\'m Sure',
          cancelText: 'Cancel',
          type: 'danger'
        }
      );
      
      if (doubleConfirmed) {
        setIsLoading(true);
        try {
          await deactivateAccount();
          showSuccess('Account deactivated successfully. You have been logged out.');
        } catch (error) {
          // Error is handled by global error handler
          console.error('Error deactivating account:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <User className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your address"
              />
            </div>
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">New Password (optional)</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter new password (leave blank to keep current)"
              />
              <p className="text-sm text-muted-foreground">
                Leave blank to keep your current password
              </p>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Account Status</Label>
                <p className="font-medium">
                  {user.isActive ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-600">Inactive</span>
                  )}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Roles</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.roles?.map((role, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {typeof role === 'string' ? role : role.name}
                    </span>
                  )) || <span className="text-muted-foreground">No roles assigned</span>}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Deactivation Section */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-red-600 dark:text-red-400">
                Deactivate Account
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Once you deactivate your account, you will not be able to log in again. 
                This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeactivateAccount}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {isLoading ? 'Deactivating...' : 'Deactivate Account'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
