import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Tabs, Tab, CircularProgress, IconButton } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import type { Client } from '../../models/Client';
import { getClientById } from '../../services/client.service';
import ContactList from './ContactList';
import SiteList from './SiteList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchClient = async () => {
      if (!id) return;
      try {
        const data = await getClientById(id);
        setClient(data);
      } catch (error) {
        console.error("Error fetching client:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (!client) {
    return <Typography color="error">Customer not found.</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/clients')}>
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {client.name}
        </Typography>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="customer tabs">
            <Tab label="Profile" />
            <Tab label="Contacts" />
            <Tab label="Branches" />
          </Tabs>
        </Box>
        
        <CustomTabPanel value={tabValue} index={0}>
          <Paper sx={{ p: 3, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>Customer Profile</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Category</Typography>
                <Typography variant="body1">{client.industry || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Website</Typography>
                <Typography variant="body1">
                  {client.website ? <a href={client.website} target="_blank" rel="noreferrer">{client.website}</a> : '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Typography variant="body1">{client.status}</Typography>
              </Box>
            </Box>
          </Paper>
        </CustomTabPanel>
        
        <CustomTabPanel value={tabValue} index={1}>
          {id && <ContactList clientId={id} />}
        </CustomTabPanel>
        
        <CustomTabPanel value={tabValue} index={2}>
          {id && <SiteList clientId={id} />}
        </CustomTabPanel>
      </Box>
    </Box>
  );
};

export default ClientDetails;
