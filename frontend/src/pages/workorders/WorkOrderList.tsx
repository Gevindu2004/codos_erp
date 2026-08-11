import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Typography, Chip, Tabs, Tab } from '@mui/material';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { WorkOrder } from '../../models/WorkOrder';
import type { Client } from '../../models/Client';
import type { User } from '../../models/User';
import { getWorkOrders, deleteWorkOrder } from '../../services/workorder.service';
import { getClients } from '../../services/client.service';
import { getUsers } from '../../services/user.service';
import WorkOrderFormDialog from './WorkOrderFormDialog';

const WorkOrderList: React.FC = () => {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [users, setUsers] = useState<Record<string, User>>({});
  const [tabValue, setTabValue] = useState(0); // 0 = All, 1 = Open, 2 = Completed
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWO, setEditingWO] = useState<WorkOrder | undefined>(undefined);

  const fetchData = async () => {
    try {
      const [woData, clientsData, usersData] = await Promise.all([
        getWorkOrders(),
        getClients(),
        getUsers()
      ]);
      setWorkOrders(woData);
      
      const clientMap: Record<string, Client> = {};
      clientsData.forEach(c => { clientMap[c.id!] = c; });
      setClients(clientMap);
      
      const userMap: Record<string, User> = {};
      usersData.forEach(u => { userMap[u.id] = u; });
      setUsers(userMap);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingWO(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (wo: WorkOrder) => {
    setEditingWO(wo);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this work order?')) {
      await deleteWorkOrder(id);
      fetchData();
    }
  };

  const filteredOrders = workOrders.filter(wo => {
    if (tabValue === 1) return ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(wo.status);
    if (tabValue === 2) return ['COMPLETED', 'CLOSED'].includes(wo.status);
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'info';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      case 'EMERGENCY': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'default';
      case 'ASSIGNED': return 'info';
      case 'IN_PROGRESS': return 'warning';
      case 'COMPLETED': return 'success';
      case 'CLOSED': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Appointments</Typography>
        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />}
          onClick={handleAdd}
        >
          New Appointment
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_e, val) => setTabValue(val)} sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="All" />
          <Tab label="Active (Open / In Progress)" />
          <Tab label="Completed / Canceled" />
        </Tabs>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Stylist</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No appointments found in this category.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((wo) => (
                  <TableRow key={wo.id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{wo.title}</TableCell>
                    <TableCell>{clients[wo.clientId]?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Chip label={wo.priority} size="small" color={getPriorityColor(wo.priority) as any} />
                    </TableCell>
                    <TableCell>
                      <Chip label={wo.status.replace('_', ' ')} size="small" color={getStatusColor(wo.status) as any} />
                    </TableCell>
                    <TableCell>
                      {wo.assignedTo && users[wo.assignedTo] 
                        ? `${users[wo.assignedTo].firstName} ${users[wo.assignedTo].lastName}` 
                        : 'Unassigned'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => navigate(`/work-orders/${wo.id}`)} title="View Board">
                        <Eye size={20} />
                      </IconButton>
                      <IconButton color="info" onClick={() => handleEdit(wo)}>
                        <Edit size={20} />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(wo.id!)}>
                        <Trash2 size={20} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <WorkOrderFormDialog 
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={() => {
          setIsFormOpen(false);
          fetchData();
        }}
        workOrder={editingWO}
        clients={Object.values(clients)}
        users={Object.values(users)}
      />
    </Box>
  );
};

export default WorkOrderList;
