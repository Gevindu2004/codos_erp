import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, IconButton, Chip } from '@mui/material';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Client } from '../../models/Client';
import { getClients, deleteClient } from '../../services/client.service';
import ClientFormDialog from './ClientFormDialog';

const ClientList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);

  const navigate = useNavigate();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredClients(
      clients.filter(client => 
        client.name.toLowerCase().includes(term) || 
        client.industry?.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, clients]);

  const handleOpenDialog = (client?: Client) => {
    setSelectedClient(client);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = (refresh?: boolean) => {
    setIsDialogOpen(false);
    setSelectedClient(undefined);
    if (refresh) {
      fetchClients();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(id);
        fetchClients();
      } catch (error) {
        console.error("Error deleting client:", error);
        alert('Failed to delete client.');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Customers</Typography>
        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
        >
          Add Customer
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Search size={20} color="gray" />
        <TextField 
          placeholder="Search customers..." 
          variant="outlined" 
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: 'background.default' }}>
            <TableRow>
              <TableCell>Customer Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody component={motion.tbody as any} initial="hidden" animate="visible" variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">Loading...</TableCell>
              </TableRow>
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No customers found.</TableCell>
              </TableRow>
            ) : (
              <AnimatePresence>
                {filteredClients.map((client) => (
                  <TableRow 
                    key={client.id} 
                    hover
                    component={motion.tr as any}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{client.name}</TableCell>
                    <TableCell>{client.industry || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={client.status} 
                        color={client.status === 'ACTIVE' ? 'success' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => navigate(`/clients/${client.id}`)} title="View Details">
                        <Eye size={18} />
                      </IconButton>
                      <IconButton color="info" onClick={() => handleOpenDialog(client)} title="Edit">
                        <Edit size={18} />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(client.id!)} title="Delete">
                        <Trash2 size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ClientFormDialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog} 
        client={selectedClient} 
      />
    </Box>
  );
};

export default ClientList;
