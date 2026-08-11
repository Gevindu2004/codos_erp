import React, { useState } from 'react';
import { Typography, Box, TextField, Button, Alert, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
    .optional()
    .or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'Admin', // Creating the first admin
      });

      if (response.data.status === 'success') {
        navigate('/login', { state: { message: 'Registration successful! Please login.' } });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
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
          Create Account
        </Typography>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Join Codos ERP to manage your business operations
        </Typography>
      </motion.div>
      
      {error && (
        <motion.div variants={itemVariants}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
              label="First Name" 
              variant="outlined" 
              fullWidth 
              {...register('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
            <TextField 
              label="Last Name" 
              variant="outlined" 
              fullWidth 
              {...register('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </Box>
        </motion.div>
        
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
            label="Phone (Optional)" 
            variant="outlined" 
            fullWidth 
            {...register('phone')}
            error={!!errors.phone}
            helperText={errors.phone?.message}
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
          <TextField 
            label="Confirm Password" 
            type="password" 
            variant="outlined" 
            fullWidth 
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            size="large" 
            fullWidth
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Typography align="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" underline="hover" sx={{ fontWeight: 'bold' }}>
              Sign In
            </MuiLink>
          </Typography>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default Register;
