import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Typography, TextField, Chip } from '@mui/material';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Equipment } from '../../models/Equipment';
import type { Client } from '../../models/Client';
import { getEquipment, deleteEquipment } from '../../services/equipment.service';
import { getClients } from '../../services/client.service';
import EquipmentFormDialog from './EquipmentFormDialog';

const EquipmentList: React.FC = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | undefined>(undefined);

  const fetchData = async () => {
    try {
      const [eqData, clientsData] = await Promise.all([
        getEquipment(),
        getClients()
      ]);
      setEquipment(eqData);
      
      const clientMap: Record<string, Client> = {};
      clientsData.forEach(c => { clientMap[c.id!] = c; });
      setClients(clientMap);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingEquipment(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      await deleteEquipment(id);
      fetchData();
    }
  };

  const filteredEquipment = equipment.filter(eq => 
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (eq.category && eq.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Services Menu</Typography>
        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />}
          onClick={handleAdd}
        >
          Add Service
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Search size={20} color="gray" />
        <TextField 
          placeholder="Search by service name or category..." 
          variant="outlined" 
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Service Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price & Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEquipment.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  No services found. Add some services to your menu to get started!
                </TableCell>
              </TableRow>
            ) : (
              filteredEquipment.map((eq) => (
                <TableRow key={eq.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>{eq.name}</TableCell>
                  <TableCell>{eq.category}</TableCell>
                  <TableCell>
                    ${eq.basePrice} 
                    <Typography variant="body2" color="text.secondary">{eq.durationMinutes} mins</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={eq.status} color={getStatusColor(eq.status) as any} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => navigate(`/equipment/${eq.id}`)} title="View Details">
                      <Eye size={20} />
                    </IconButton>
                    <IconButton color="info" onClick={() => handleEdit(eq)} title="Edit">
                      <Edit size={20} />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(eq.id!)} title="Delete">
                      <Trash2 size={20} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <EquipmentFormDialog 
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={() => {
          setIsFormOpen(false);
          fetchData();
        }}
        equipment={editingEquipment}
        clients={Object.values(clients)}
      />
    </Box>
  );
};

export default EquipmentList;
