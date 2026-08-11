import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button, Alert, Link as MuiLink } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.message) {
      setSuccessMsg(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          Welcome Back
        </Typography>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Enter your credentials to access the ERP
        </Typography>
      </motion.div>
      
      {successMsg && (
        <motion.div variants={itemVariants}>
          <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>
        </motion.div>
      )}
      {error && (
        <motion.div variants={itemVariants}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <motion.div variants={itemVariants}>
          <TextField 
            label="Email" 
            type="email"
            variant="outlined" 
            fullWidth 
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <TextField 
            label="Password" 
            type="password" 
            variant="outlined" 
            fullWidth 
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <MuiLink component={Link} to="/forgot-password" variant="body2" underline="hover">
              Forgot password?
            </MuiLink>
          </Box>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            size="large" 
            fullWidth
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Typography align="center" sx={{ mt: 2 }}>
            Don't have an account?{' '}
            <MuiLink component={Link} to="/register" underline="hover" sx={{ fontWeight: 'bold' }}>
              Sign Up
            </MuiLink>
          </Typography>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default Login;
