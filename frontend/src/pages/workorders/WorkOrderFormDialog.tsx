import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { WorkOrder } from '../../models/WorkOrder';
import type { Client, Site } from '../../models/Client';
import type { Equipment } from '../../models/Equipment';
import type { User } from '../../models/User';
import { addWorkOrder, updateWorkOrder } from '../../services/workorder.service';
import { getClientSites } from '../../services/client.service';
import { getEquipment } from '../../services/equipment.service'; // We will filter equipment by site client side for simplicity

const woSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']),
  status: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED']),
  clientId: z.string().min(1, 'Client is required'),
  siteId: z.string().min(1, 'Site is required'),
  equipmentId: z.string().optional(),
  assignedTo: z.string().optional(),
  scheduledDate: z.string().optional(),
});

type WOFormData = z.infer<typeof woSchema>;

interface WorkOrderFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  workOrder?: WorkOrder;
  clients: Client[];
  users: User[];
}

const WorkOrderFormDialog: React.FC<WorkOrderFormDialogProps> = ({ open, onClose, onSave, workOrder, clients, users }) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<WOFormData>({
    resolver: zodResolver(woSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'OPEN',
      clientId: '',
      siteId: '',
      equipmentId: '',
      assignedTo: '',
      scheduledDate: ''
    }
  });

  const selectedClientId = watch('clientId');
  const selectedSiteId = watch('siteId');

  useEffect(() => {
    // Fetch all equipment once to filter client-side (suitable for small scale)
    getEquipment().then(setAllEquipment);
  }, []);

  useEffect(() => {
    if (workOrder) {
      reset({
        title: workOrder.title,
        description: workOrder.description,
        priority: workOrder.priority,
        status: workOrder.status,
        clientId: workOrder.clientId,
        siteId: workOrder.siteId,
        equipmentId: workOrder.equipmentId || '',
        assignedTo: workOrder.assignedTo || '',
        scheduledDate: workOrder.scheduledDate || ''
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'OPEN',
        clientId: '',
        siteId: '',
        equipmentId: '',
        assignedTo: '',
        scheduledDate: ''
      });
    }
  }, [workOrder, reset]);

  // Cascade Client -> Site
  useEffect(() => {
    const fetchSites = async () => {
      if (!selectedClientId) {
        setSites([]);
        return;
      }
      try {
        const clientSites = await getClientSites(selectedClientId);
        setSites(clientSites);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSites();
  }, [selectedClientId]);

  // Cascade Site -> Equipment
  useEffect(() => {
    if (selectedSiteId) {
      setEquipmentList(allEquipment.filter(eq => eq.siteId === selectedSiteId));
    } else {
      setEquipmentList([]);
    }
  }, [selectedSiteId, allEquipment]);

  const onSubmit = async (data: WOFormData) => {
    setSaving(true);
    try {
      if (workOrder?.id) {
        await updateWorkOrder(workOrder.id, data);
      } else {
        await addWorkOrder(data);
      }
      onSave();
    } catch (error) {
      console.error(error);
      alert("Failed to save Work Order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{workOrder ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Basic Info</Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                variant="outlined"
                label="Appointment Title (e.g. Bridal Makeup) *"
                fullWidth
                {...register('title')}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                variant="outlined"
                label="Customer Requests / Notes *"
                fullWidth
                multiline
                rows={3}
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="priority"
                control={control as any}
                render={({ field }) => (
                  <TextField
                    variant="outlined"
                    {...field}
                    select
                    label="Priority *"
                    fullWidth
                  >
                    <MenuItem value="LOW">Low</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="EMERGENCY">Emergency (Walk-in/ASAP)</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="status"
                control={control as any}
                render={({ field }) => (
                  <TextField
                    variant="outlined"
                    {...field}
                    select
                    label="Status *"
                    fullWidth
                  >
                    <MenuItem value="OPEN">Open</MenuItem>
                    <MenuItem value="ASSIGNED">Assigned</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="CLOSED">Canceled</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Booking Details</Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="clientId"
                control={control as any}
                render={({ field }) => (
                  <TextField
                    variant="outlined"
                    {...field}
                    select
                    label="Customer *"
                    fullWidth
                    error={!!errors.clientId}
                    helperText={errors.clientId?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('siteId', '');
                      setValue('equipmentId', '');
                    }}
                  >
                    {clients.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="siteId"
                control={control as any}
                render={({ field }) => (
                  <TextField
                    variant="outlined"
                    {...field}
                    select
                    label="Branch *"
                    fullWidth
                    disabled={!selectedClientId}
                    error={!!errors.siteId}
                    helperText={errors.siteId?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('equipmentId', '');
                    }}
                  >
                    {sites.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="equipmentId"
                control={control as any}
                render={({ field }) => (
                  <TextField
                    variant="outlined"
                    {...field}
                    select
                    label="Service (Optional)"
                    fullWidth
                    disabled={!selectedSiteId}
                  >
                    <MenuItem value=""><em>None / Custom</em></MenuItem>
                    {equipmentList.map(eq => <MenuItem key={eq.id} value={eq.id!}>{eq.name} (${eq.basePrice})</MenuItem>)}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Scheduling & Stylist</Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="assignedTo"
                control={control as any}
                render={({ field }) => (
                  <TextField
                    variant="outlined"
                    {...field}
                    select
                    label="Assign Stylist / Beautician"
                    fullWidth
                  >
                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                    {users.map(u => (
                      <MenuItem key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                variant="outlined"
                label="Appointment Date"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                {...register('scheduledDate')}
              />
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save Appointment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default WorkOrderFormDialog;
