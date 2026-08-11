import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Tabs, Tab, CircularProgress, IconButton, Button, Grid, Chip } from '@mui/material';
import { ArrowLeft, Upload, FileText, Activity } from 'lucide-react';
import type { Equipment } from '../../models/Equipment';
import type { Client, Site } from '../../models/Client';
import { getEquipmentById, uploadManual } from '../../services/equipment.service';
import { getClientById, getClientSites } from '../../services/client.service';
import MaintenanceHistory from './MaintenanceHistory';

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

const EquipmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAll = async () => {
      if (!id) return;
      try {
        const eq = await getEquipmentById(id);
        if (eq) {
          setEquipment(eq);
          const c = await getClientById(eq.clientId);
          setClient(c);
          if (c) {
            const sites = await getClientSites(eq.clientId);
            setSite(sites.find(s => s.id === eq.siteId) || null);
          }
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;
    
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      return;
    }

    setUploadingPdf(true);
    try {
      const url = await uploadManual(id, file); // Reusing manual field for "Brochure" or something
      setEquipment(prev => prev ? { ...prev, manualUrl: url } : null);
      alert('File uploaded successfully!');
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`Failed to upload: ${error.message || 'Check Storage Rules'}`);
    } finally {
      setUploadingPdf(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (!equipment) {
    return <Typography>Service not found.</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/equipment')}>
          <ArrowLeft size={24} />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
            {equipment.name}
            <Chip 
              label={equipment.status} 
              color={equipment.status === 'ACTIVE' ? 'success' : 'error'} 
              size="small"
            />
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            ${equipment.basePrice} | {equipment.durationMinutes} mins
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<FileText size={18} style={{ marginBottom: 0, marginRight: 8 }} />} iconPosition="start" label="Overview" />
            <Tab icon={<Activity size={18} style={{ marginBottom: 0, marginRight: 8 }} />} iconPosition="start" label="Service Log" />
          </Tabs>
        </Box>
        
        {/* OVERVIEW TAB */}
        <CustomTabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>Service Information</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Service Name</Typography>
                  <Typography variant="body1">{equipment.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Category</Typography>
                  <Typography variant="body1">{equipment.category}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Duration</Typography>
                  <Typography variant="body1">{equipment.durationMinutes} mins</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{equipment.notes || 'None'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>Availability</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Customer (If Specific)</Typography>
                  <Typography variant="body1">{client?.name || 'Loading...'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Branch</Typography>
                  <Typography variant="body1">{site?.name || 'Loading...'}</Typography>
                  <Typography variant="body2" color="text.secondary">{site ? `${site.addressLine1}, ${site.city}` : ''}</Typography>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>Documentation (Flyers/Brochures)</Typography>
              <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
                {(equipment as any).manualUrl ? (
                  <>
                    <Typography variant="body2" color="success.main">PDF Document is available.</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant="contained" onClick={() => window.open((equipment as any).manualUrl, '_blank')}>
                        View Document
                      </Button>
                      <Button variant="outlined" component="label" disabled={uploadingPdf}>
                        {uploadingPdf ? 'Uploading...' : 'Replace Document'}
                        <input type="file" hidden accept="application/pdf" ref={fileInputRef} onChange={handleFileUpload} />
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary">No document uploaded yet.</Typography>
                    <Button variant="contained" component="label" startIcon={<Upload size={18} />} disabled={uploadingPdf}>
                      {uploadingPdf ? 'Uploading...' : 'Upload PDF'}
                      <input type="file" hidden accept="application/pdf" ref={fileInputRef} onChange={handleFileUpload} />
                    </Button>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CustomTabPanel>

        {/* MAINTENANCE HISTORY TAB */}
        <CustomTabPanel value={tabValue} index={1}>
          <MaintenanceHistory equipmentId={id!} />
        </CustomTabPanel>

      </Paper>
    </Box>
  );
};

export default EquipmentDetails;
