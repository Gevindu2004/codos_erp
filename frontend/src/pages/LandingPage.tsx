import React, { useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Scissors, Package, FileText, ArrowRight } from 'lucide-react';

const FeatureCard = ({ icon, title, description, delay }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10 }}
      style={{ height: '100%' }}
    >
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          height: '100%', 
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(100, 255, 218, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          color: 'white',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: '1px solid rgba(100, 255, 218, 0.3)',
            boxShadow: '0 10px 30px -10px rgba(100, 255, 218, 0.1)'
          }
        }}
      >
        <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(100, 255, 218, 0.1)', mb: 3 }}>
          {icon}
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>{title}</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>{description}</Typography>
      </Paper>
    </motion.div>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Parallax setup mirroring AuthLayout
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
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#0A192F', 
      color: 'white',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background Grid & Blobs matching AuthLayout */}
      <motion.div 
        style={{ 
          position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', 
          backgroundImage: 'radial-gradient(circle at center, rgba(100, 255, 218, 0.05) 0%, transparent 70%)',
          x: bgX, y: bgY 
        }} 
      />
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

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: 4, pb: 12 }}>
        
        {/* Navbar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 12 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 2 }}>
              CODOS <span style={{ color: '#64FFDA' }}>ERP</span>
            </Typography>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="text" 
                onClick={() => navigate('/login')}
                sx={{ color: 'white', fontWeight: 600, px: 3, '&:hover': { color: '#64FFDA' } }}
              >
                Sign In
              </Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/register')}
                sx={{ 
                  bgcolor: '#64FFDA', 
                  color: '#0A192F', 
                  fontWeight: 700, 
                  px: 4, 
                  borderRadius: 1,
                  '&:hover': { bgcolor: '#4CD6B3' }
                }}
              >
                Create Account
              </Button>
            </Box>
          </motion.div>
        </Box>

        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 16 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '3rem', md: '5rem' }, 
                fontWeight: 900, 
                lineHeight: 1.1,
                mb: 3,
                letterSpacing: '-1px'
              }}
            >
              Manage your salon <br />
              <span style={{ 
                background: 'linear-gradient(90deg, #64FFDA, #3B82F6)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>
                like a pro.
              </span>
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 6, maxWidth: 600, mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}>
              The all-in-one ERP built specifically for modern salons and beauty parlors. From bookings to inventory, handle everything beautifully.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button 
              variant="outlined" 
              size="large"
              endIcon={<ArrowRight />}
              onClick={() => navigate('/register')}
              sx={{ 
                borderColor: '#64FFDA', 
                color: '#64FFDA', 
                fontWeight: 700, 
                px: 6, 
                py: 2, 
                fontSize: '1.1rem',
                borderWidth: 2,
                borderRadius: 1,
                '&:hover': { 
                  bgcolor: 'rgba(100, 255, 218, 0.1)',
                  borderColor: '#64FFDA',
                  borderWidth: 2
                }
              }}
            >
              Get Started for Free
            </Button>
          </motion.div>
        </Box>

        {/* Features Section */}
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FeatureCard 
              delay={0.6}
              icon={<Calendar size={32} color="#64FFDA" />}
              title="Smart Appointments"
              description="Effortlessly schedule and manage customer bookings. Assign stylists, set durations, and keep your calendar perfectly organized."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FeatureCard 
              delay={0.7}
              icon={<Scissors size={32} color="#64FFDA" />}
              title="Service Catalog"
              description="Define your complete menu of services. Set base prices, categories, and duration times to automate your scheduling workflows."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FeatureCard 
              delay={0.8}
              icon={<Package size={32} color="#64FFDA" />}
              title="Retail Stock & Add-ons"
              description="Track inventory levels for shampoos, gels, and styling products. Get automatic low-stock alerts and add retail items directly to appointments."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FeatureCard 
              delay={0.9}
              icon={<FileText size={32} color="#64FFDA" />}
              title="Automated Invoicing"
              description="Turn completed appointments into beautiful invoices in one click. The system automatically calculates service costs and retail add-ons."
            />
          </Grid>
        </Grid>

      </Container>
    </Box>
  );
};

export default LandingPage;
