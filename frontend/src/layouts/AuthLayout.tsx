import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Container, Paper, Typography } from '@mui/material';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const AuthLayout: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const bgX = useTransform(smoothMouseX, [-0.5, 0.5], ['-5%', '5%']);
  const bgY = useTransform(smoothMouseY, [-0.5, 0.5], ['-5%', '5%']);
  
  const blob1X = useTransform(smoothMouseX, [-0.5, 0.5], ['-15%', '15%']);
  const blob1Y = useTransform(smoothMouseY, [-0.5, 0.5], ['-15%', '15%']);
  
  const blob2X = useTransform(smoothMouseX, [-0.5, 0.5], ['10%', '-10%']);
  const blob2Y = useTransform(smoothMouseY, [-0.5, 0.5], ['10%', '-10%']);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0A192F' }}>
      <CssBaseline />
      
      {/* Background Grid */}
      <motion.div 
        style={{ 
          position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', 
          backgroundImage: 'radial-gradient(circle at center, rgba(100, 255, 218, 0.05) 0%, transparent 70%)',
          x: bgX, y: bgY 
        }} 
      />
      
      {/* Parallax Blobs */}
      <motion.div 
        style={{ 
          position: 'absolute', top: '10%', left: '20%', width: '30vw', height: '30vw', 
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(100, 255, 218, 0.1))',
          borderRadius: '50%', filter: 'blur(60px)',
          x: blob1X, y: blob1Y 
        }} 
      />
      <motion.div 
        style={{ 
          position: 'absolute', bottom: '10%', right: '15%', width: '25vw', height: '25vw', 
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1))',
          borderRadius: '50%', filter: 'blur(80px)',
          x: blob2X, y: blob2Y 
        }} 
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.contrastText', letterSpacing: 2 }}>
              CODOS <span style={{ color: '#64FFDA' }}>ERP</span>
            </Typography>
          </motion.div>
        </Box>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Paper elevation={4} sx={{ p: { xs: 3, sm: 5 } }}>
            <Outlet />
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AuthLayout;
