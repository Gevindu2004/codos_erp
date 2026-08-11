import React, { useState } from 'react';
import { Typography, Box, TextField, Button, Alert, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Check your inbox.');
      setEmail('');
    } catch (err: any) {
      console.error(err);
      setError('Failed to send password reset email. Make sure the email is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Reset Password
      </Typography>
      
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextField 
          label="Email" 
          type="email"
          variant="outlined" 
          fullWidth 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          size="large" 
          fullWidth
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <Typography align="center" sx={{ mt: 2 }}>
        Remember your password?{' '}
        <MuiLink component={Link} to="/login" underline="hover">
          Sign In
        </MuiLink>
      </Typography>
    </Box>
  );
};

export default ForgotPassword;
