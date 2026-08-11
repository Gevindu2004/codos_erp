import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button, Alert, Paper, Grid } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updatePassword, updateProfile as updateAuthProfile } from 'firebase/auth';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  
  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setPhone(data.phone || '');
          setRole(data.role || '');
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setSaving(true);
    setMessage(null);

    try {
      // 1. Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        firstName,
        lastName,
        phone,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // 2. Update Auth Display Name
      await updateAuthProfile(currentUser, {
        displayName: `${firstName} ${lastName}`
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // Note: Changing password requires recent authentication. 
      // If they have been logged in for a long time, this will throw an error requiring re-authentication.
      await updatePassword(currentUser, newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'Please log out and log back in to change your password.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to change password.' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Typography>Loading profile...</Typography>;

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>My Profile</Typography>
      
      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Profile Info Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Personal Information</Typography>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <TextField 
                label="First Name" 
                fullWidth 
                value={firstName} 
                onChange={e => setFirstName(e.target.value)} 
                required 
              />
              <TextField 
                label="Last Name" 
                fullWidth 
                value={lastName} 
                onChange={e => setLastName(e.target.value)} 
                required 
              />
              <TextField 
                label="Email" 
                fullWidth 
                value={currentUser?.email || ''} 
                disabled 
                helperText="Email cannot be changed."
              />
              <TextField 
                label="Phone" 
                fullWidth 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
              />
              <TextField 
                label="Role" 
                fullWidth 
                value={role} 
                disabled 
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Update Profile'}
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Change Password Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Change Password</Typography>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <TextField 
                label="New Password" 
                type="password" 
                fullWidth 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                required 
              />
              <TextField 
                label="Confirm New Password" 
                type="password" 
                fullWidth 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="secondary"
                disabled={saving}
              >
                {saving ? 'Updating...' : 'Change Password'}
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
