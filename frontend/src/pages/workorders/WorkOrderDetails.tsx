import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Grid, CircularProgress, IconButton, Chip, Button, TextField, MenuItem, Divider } from '@mui/material';
import { ArrowLeft, CheckCircle, Clock, FileText } from 'lucide-react';
import type { WorkOrder, WorkOrderTask, WorkOrderPart } from '../../models/WorkOrder';
import type { Client, Site } from '../../models/Client';
import type { User } from '../../models/User';
import type { Equipment } from '../../models/Equipment';
import { getWorkOrderById, updateWorkOrder, getWorkOrderTasks, addWorkOrderTask, toggleWorkOrderTask, deleteWorkOrderTask, getWorkOrderParts, addWorkOrderPart, deleteWorkOrderPart } from '../../services/workorder.service';
import { getClientById, getClientSites } from '../../services/client.service';
import { getUsers } from '../../services/user.service';
import { getEquipmentById } from '../../services/equipment.service';
import { generateInvoiceFromWorkOrder } from '../../services/invoice.service';

const WorkOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [wo, setWo] = useState<WorkOrder | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [technician, setTechnician] = useState<User | null>(null);

  const [tasks, setTasks] = useState<WorkOrderTask[]>([]);
  const [parts, setParts] = useState<WorkOrderPart[]>([]);

  const [newTask, setNewTask] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [newPartQty, setNewPartQty] = useState<number>(1);
  const [newPartCost, setNewPartCost] = useState<number>(0);

  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    if (!id) return;
    try {
      const woData = await getWorkOrderById(id);
      if (woData) {
        setWo(woData);
        
        const [c, users, tasksData, partsData] = await Promise.all([
          getClientById(woData.clientId),
          getUsers(),
          getWorkOrderTasks(id),
          getWorkOrderParts(id)
        ]);

        setClient(c);
        setTasks(tasksData);
        setParts(partsData);

        if (woData.assignedTo) {
          setTechnician(users.find(u => u.id === woData.assignedTo) || null);
        }

        if (c) {
          const sites = await getClientSites(c.id!);
          setSite(sites.find(s => s.id === woData.siteId) || null);
        }

        if (woData.equipmentId) {
          const eq = await getEquipmentById(woData.equipmentId);
          setEquipment(eq);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const handleStatusChange = async (newStatus: any) => {
    if (!wo || !id) return;
    await updateWorkOrder(id, { 
      status: newStatus,
      completedDate: (newStatus === 'COMPLETED' || newStatus === 'CLOSED') ? new Date().toISOString() : wo.completedDate
    });
    setWo({ ...wo, status: newStatus });
  };

  const handleAddTask = async () => {
    if (!newTask.trim() || !id) return;
    await addWorkOrderTask(id, newTask);
    setNewTask('');
    fetchAll();
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    if (!id) return;
    await toggleWorkOrderTask(id, taskId, !isCompleted);
    fetchAll();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!id) return;
    await deleteWorkOrderTask(id, taskId);
    fetchAll();
  };

  const handleAddPart = async () => {
    if (!newPartName.trim() || !id) return;
    await addWorkOrderPart(id, { partName: newPartName, quantity: newPartQty, cost: newPartCost });
    setNewPartName('');
    setNewPartQty(1);
    setNewPartCost(0);
    fetchAll();
  };

  const handleDeletePart = async (partId: string) => {
    if (!id) return;
    await deleteWorkOrderPart(id, partId);
    fetchAll();
  };

  const handleNotesChange = async (notes: string) => {
    if (!id) return;
    await updateWorkOrder(id, { resolutionNotes: notes });
    setWo(prev => prev ? { ...prev, resolutionNotes: notes } : null);
  };

  const handleGenerateInvoice = async () => {
    if (!id) return;
    try {
      const invoiceId = await generateInvoiceFromWorkOrder(id);
      navigate(`/invoices/${invoiceId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate invoice.');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (!wo) return <Typography>Work Order not found.</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/work-orders')}>
          <ArrowLeft size={24} />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{wo.title}</Typography>
          <Typography variant="subtitle1" color="text.secondary">ID: {wo.id}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip label={wo.priority} color={wo.priority === 'EMERGENCY' || wo.priority === 'HIGH' ? 'error' : 'default'} />
          <TextField
            select
            size="small"
            value={wo.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="OPEN">Open</MenuItem>
            <MenuItem value="ASSIGNED">Assigned</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="CLOSED">Canceled</MenuItem>
          </TextField>
          {wo.status === 'COMPLETED' && (
            <Button variant="contained" color="success" startIcon={<FileText size={20} />} onClick={handleGenerateInvoice}>
              Invoice
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Details & Notes */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Customer Requests / Notes</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>{wo.description}</Typography>
            
            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>Service Tasks</Typography>
            <Box sx={{ mb: 2 }}>
              {tasks.map(t => (
                <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <IconButton onClick={() => handleToggleTask(t.id!, t.isCompleted)} color={t.isCompleted ? 'success' : 'default'}>
                    <CheckCircle size={20} />
                  </IconButton>
                  <Typography sx={{ flexGrow: 1, textDecoration: t.isCompleted ? 'line-through' : 'none', color: t.isCompleted ? 'text.secondary' : 'text.primary' }}>
                    {t.description}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => handleDeleteTask(t.id!)}>
                    <Typography variant="caption">Remove</Typography>
                  </IconButton>
                </Box>
              ))}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <TextField 
                  size="small" 
                  placeholder="New task..." 
                  fullWidth 
                  value={newTask} 
                  onChange={e => setNewTask(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddTask()}
                />
                <Button variant="contained" onClick={handleAddTask}>Add</Button>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>Post-Service Notes</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Enter notes on how this appointment went..."
              value={wo.resolutionNotes || ''}
              onChange={(e) => setWo({ ...wo, resolutionNotes: e.target.value })}
              onBlur={(e) => handleNotesChange(e.target.value)}
            />
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Retail Products & Add-ons</Typography>
            {parts.length > 0 && (
              <Box sx={{ mb: 2 }}>
                {parts.map(p => (
                  <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: '1px solid #eee' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{p.partName}</Typography>
                      <Typography variant="caption" color="text.secondary">Qty: {p.quantity} | Price: ${p.cost}</Typography>
                    </Box>
                    <Button size="small" color="error" onClick={() => handleDeletePart(p.id!)}>Remove</Button>
                  </Box>
                ))}
              </Box>
            )}
            <Grid container spacing={1} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField size="small" fullWidth placeholder="Product / Add-on Name" value={newPartName} onChange={e => setNewPartName(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField size="small" type="number" fullWidth label="Qty" value={newPartQty} onChange={e => setNewPartQty(Number(e.target.value))} />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField size="small" type="number" fullWidth label="Price" value={newPartCost} onChange={e => setNewPartCost(Number(e.target.value))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <Button variant="contained" fullWidth onClick={handleAddPart}>Add</Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right Column: Meta Info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Assignment</Typography>
            <Box>
              <Typography variant="caption" color="text.secondary">Stylist / Beautician</Typography>
              <Typography variant="body1">{technician ? `${technician.firstName} ${technician.lastName}` : 'Unassigned'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Scheduled Date</Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={16} /> {wo.scheduledDate || 'Not scheduled'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Completed Date</Typography>
              <Typography variant="body1">{wo.completedDate || 'Not completed'}</Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Booking Info</Typography>
            <Box>
              <Typography variant="caption" color="text.secondary">Customer</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{client?.name || 'Loading...'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Branch</Typography>
              <Typography variant="body1">{site?.name || 'Loading...'}</Typography>
              <Typography variant="body2" color="text.secondary">{site ? `${site.addressLine1}, ${site.city}, ${site.state}` : ''}</Typography>
            </Box>
            {equipment && (
              <Box sx={{ mt: 1, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Main Service</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{equipment.name}</Typography>
                <Typography variant="body2">${equipment.basePrice} | {equipment.durationMinutes} mins</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkOrderDetails;
