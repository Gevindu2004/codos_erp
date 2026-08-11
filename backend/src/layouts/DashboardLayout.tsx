import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Menu, MenuItem, Avatar, useTheme, useMediaQuery } from '@mui/material';
import { LayoutDashboard, Users, Wrench, Briefcase, Package, FileText, Settings, Menu as MenuIcon, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 260;

const DashboardLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { text: 'Staff & Roles', icon: <UserIcon size={20} />, path: '/staff' },
    { text: 'Customers', icon: <Users size={20} />, path: '/clients' },
    { text: 'Appointments', icon: <Briefcase size={20} />, path: '/work-orders' },
    { text: 'Services Menu', icon: <Wrench size={20} />, path: '/equipment' },
    { text: 'Retail Stock', icon: <Package size={20} />, path: '/inventory' },
    { text: 'Invoices', icon: <FileText size={20} />, path: '/invoices' },
    { text: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  const drawerContent = (
    <>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Codos Salon ERP
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List>
          {menuItems.map((item) => {
            const isSelected = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path);
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton 
                  selected={isSelected}
                  onClick={() => handleNavigate(item.path)}
                  sx={{ 
                    mx: 2, 
                    borderRadius: 1, 
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '& .MuiListItemIcon-root': { color: 'primary.contrastText' }
                    },
                    '&:hover': { 
                      backgroundColor: isSelected ? 'primary.dark' : 'primary.light', 
                      color: isSelected ? 'primary.contrastText' : 'primary.contrastText', 
                      '& .MuiListItemIcon-root': { color: isSelected ? 'primary.contrastText' : 'primary.contrastText' } 
                    } 
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: isSelected ? 'primary.contrastText' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} sx={{ '& .MuiTypography-root': { fontSize: '0.9rem', fontWeight: isSelected ? 600 : 500 } }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
                {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <UserIcon size={18} />}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { handleClose(); handleNavigate('/profile'); }}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} // Better open performance on mobile.
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: 'background.paper' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: 'background.paper', borderRight: '1px solid #e2e8f0' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` }, overflowX: 'hidden' }}>
        <Toolbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
