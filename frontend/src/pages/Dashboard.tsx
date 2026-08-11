import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent, CircularProgress, Divider, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, ListItemButton } from '@mui/material';
import { Users, Briefcase, FileText, AlertTriangle, Clock } from 'lucide-react';
import { getClients } from '../services/client.service';
import { getWorkOrders } from '../services/workorder.service';
import { getInventoryItems } from '../services/inventory.service';
import { getInvoices } from '../services/invoice.service';
import type { Client } from '../models/Client';
import type { WorkOrder } from '../models/WorkOrder';
import type { Inventory } from '../models/Inventory';
import type { Invoice } from '../models/Invoice';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<WorkOrder[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [cData, aData, invData, invoiceData] = await Promise.all([
          getClients(),
          getWorkOrders(),
          getInventoryItems(),
          getInvoices()
        ]);
        
        setClients(cData);
        setAppointments(aData);
        setInventory(invData);
        setInvoices(invoiceData);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Calculate Metrics
  const openAppointments = appointments.filter(a => a.status === 'OPEN' || a.status === 'ASSIGNED');
  const pendingInvoices = invoices.filter(i => i.status === 'DRAFT' || i.status === 'SENT');
  const lowStockItems = inventory.filter(i => i.quantityOnHand <= i.reorderPoint);
  
  // Today's Appointments (Simple date string match for demo)
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => a.scheduledDate === todayStr);

  const StatCard = ({ title, value, icon, color, onClick }: any) => (
    <Card sx={{ height: '100%', cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s', '&:hover': { transform: onClick ? 'translateY(-4px)' : 'none', boxShadow: onClick ? 4 : 1 } }} onClick={onClick}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" variant="subtitle2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: `${color}.light`, color: `${color}.main`, display: 'flex' }}>
          {icon}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Salon Dashboard
      </Typography>

      {/* Top Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Customers" 
            value={clients.length} 
            icon={<Users size={28} />} 
            color="primary" 
            onClick={() => navigate('/clients')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Open Appointments" 
            value={openAppointments.length} 
            icon={<Briefcase size={28} />} 
            color="info" 
            onClick={() => navigate('/work-orders')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Pending Invoices" 
            value={pendingInvoices.length} 
            icon={<FileText size={28} />} 
            color="success" 
            onClick={() => navigate('/invoices')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Low Stock Alerts" 
            value={lowStockItems.length} 
            icon={<AlertTriangle size={28} />} 
            color="error" 
            onClick={() => navigate('/inventory')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Appointments */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 0, height: '100%', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Today's Appointments</Typography>
              <Chip label={todayStr} size="small" />
            </Box>
            <List sx={{ p: 0 }}>
              {todaysAppointments.length > 0 ? (
                todaysAppointments.map((app, index) => (
                  <React.Fragment key={app.id}>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => navigate(`/work-orders/${app.id}`)}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.light', color: 'info.main' }}>
                            <Clock size={20} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={<Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{app.title}</Typography>}
                          secondary={`Status: ${app.status}`} 
                        />
                        <Chip label={app.priority} size="small" color={app.priority === 'EMERGENCY' ? 'error' : 'default'} />
                      </ListItemButton>
                    </ListItem>
                    {index < todaysAppointments.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No appointments scheduled for today." secondary="Enjoy your free time!" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }} />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Low Stock & Recent Customers */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Grid container spacing={3}>
            
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 0, overflow: 'hidden' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #eee', bgcolor: 'error.main', color: 'white' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AlertTriangle size={20} /> Action Required: Low Stock
                  </Typography>
                </Box>
                <List sx={{ p: 0, maxHeight: 250, overflowY: 'auto' }}>
                  {lowStockItems.length > 0 ? (
                    lowStockItems.map((item, index) => (
                      <React.Fragment key={item.id}>
                        <ListItem disablePadding>
                          <ListItemButton onClick={() => navigate('/inventory')}>
                            <ListItemText 
                              primary={item.name}
                              secondary={`SKU: ${item.sku} | Supplier: ${item.supplier}`} 
                            />
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body2" color="error.main" sx={{ fontWeight: 'bold' }}>{item.quantityOnHand} Left</Typography>
                              <Typography variant="caption" color="text.secondary">Reorder at: {item.reorderPoint}</Typography>
                            </Box>
                          </ListItemButton>
                        </ListItem>
                        {index < lowStockItems.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="All retail stock levels are looking good!" sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }} />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 0, overflow: 'hidden' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Recently Added Customers</Typography>
                </Box>
                <List sx={{ p: 0 }}>
                  {clients.slice(0, 3).map((client, index) => (
                    <React.Fragment key={client.id}>
                      <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate(`/clients/${client.id}`)}>
                          <ListItemAvatar>
                            <Avatar>{client.name.charAt(0)}</Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={client.name}
                            secondary={`Status: ${client.status}`} 
                          />
                        </ListItemButton>
                      </ListItem>
                      {index < Math.min(clients.length, 3) - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>

          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
