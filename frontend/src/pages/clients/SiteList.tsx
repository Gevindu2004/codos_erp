import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Typography } from '@mui/material';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { Site } from '../../models/Client';
import { getClientSites, deleteSite } from '../../services/client.service';
import SiteFormDialog from './SiteFormDialog';

interface Props {
  clientId: string;
}

const SiteList: React.FC<Props> = ({ clientId }) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | undefined>(undefined);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const data = await getClientSites(clientId);
      setSites(data);
    } catch (error) {
      console.error("Error fetching sites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, [clientId]);

  const handleOpenDialog = (site?: Site) => {
    setSelectedSite(site);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = (refresh?: boolean) => {
    setIsDialogOpen(false);
    setSelectedSite(undefined);
    if (refresh) {
      fetchSites();
    }
  };

  const handleDelete = async (siteId: string) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      try {
        await deleteSite(clientId, siteId);
        fetchSites();
      } catch (error) {
        console.error("Error deleting site:", error);
        alert('Failed to delete site.');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
        >
          Add Branch
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ backgroundColor: 'background.default' }}>
            <TableRow>
              <TableCell>Branch Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>City/State</TableCell>
              <TableCell>GPS</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Loading...</TableCell>
              </TableRow>
            ) : sites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No branches found.</TableCell>
              </TableRow>
            ) : (
              sites.map((site) => (
                <TableRow key={site.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{site.name}</TableCell>
                  <TableCell>
                    {site.addressLine1}
                    {site.addressLine2 && <><br/>{site.addressLine2}</>}
                  </TableCell>
                  <TableCell>{site.city}, {site.state} {site.zipCode}</TableCell>
                  <TableCell>
                    {(site.latitude && site.longitude) ? (
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {site.latitude}, {site.longitude}
                      </Typography>
                    ) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="info" onClick={() => handleOpenDialog(site)} size="small" title="Edit">
                      <Edit size={16} />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(site.id!)} size="small" title="Delete">
                      <Trash2 size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <SiteFormDialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog} 
        clientId={clientId}
        site={selectedSite} 
      />
    </Box>
  );
};

export default SiteList;
