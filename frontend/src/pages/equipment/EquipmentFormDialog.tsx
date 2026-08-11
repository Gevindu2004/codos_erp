import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem, Typography, InputAdornment } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Equipment } from '../../models/Equipment';
import type { Client, Site } from '../../models/Client';
import { addEquipment, updateEquipment } from '../../services/equipment.service';
import { getClientSites } from '../../services/client.service';

const equipmentSchema = z.object({
  name: z.string().min(1, 'Service Name is required'),
  category: z.string().min(1, 'Category is required'),
  durationMinutes: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
  basePrice: z.coerce.number().min(0, 'Base price cannot be negative'),
  clientId: z.string().min(1, 'Customer is required'),
  siteId: z.string().min(1, 'Branch is required'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  notes: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface EquipmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  equipment?: Equipment;
  clients: Client[];
}

const EquipmentFormDialog: React.FC<EquipmentFormDialogProps> = ({ open, onClose, onSave, equipment, clients }) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema) as any,
    defaultValues: {
      name: '',
      category: '',
      durationMinutes: 30,
      basePrice: 0,
      clientId: '',
      siteId: '',
      status: 'ACTIVE',
      notes: ''
    }
  });

  const selectedClientId = watch('clientId');

  useEffect(() => {
    if (equipment) {
      reset({
        name: equipment.name,
        category: equipment.category || '',
        durationMinutes: equipment.durationMinutes || 30,
        basePrice: equipment.basePrice || 0,
        clientId: equipment.clientId,
        siteId: equipment.siteId,
        status: (equipment.status as any) === 'OPERATIONAL' ? 'ACTIVE' : equipment.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE', // Fallback for old data
        notes: equipment.notes || ''
      });
    } else {
      reset({
        name: '',
        category: '',
        durationMinutes: 30,
        basePrice: 0,
        clientId: '',
        siteId: '',
        status: 'ACTIVE',
        notes: ''
      });
    }
  }, [equipment, reset]);

  useEffect(() => {
    const fetchSites = async () => {
      if (!selectedClientId) {
        setSites([]);
        return;
      }
      setLoadingSites(true);
      try {
        const clientSites = await getClientSites(selectedClientId);
        setSites(clientSites);
      } catch (err) {
        console.error("Error fetching sites:", err);
      } finally {
        setLoadingSites(false);
      }
    };
    fetchSites();
  }, [selectedClientId]);

  const onSubmit = async (data: EquipmentFormData) => {
    setSaving(true);
    try {
      if (equipment?.id) {
        await updateEquipment(equipment.id, data as any);
      } else {
        await addEquipment(data as any);
      }
      onSave();
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Failed to save service. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{equipment ? 'Edit Service' : 'Add New Service'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">Availability (Global / Customer Specific)</Typography>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="clientId"
                control={control as any}
                render={({ field }) => (
                  <TextField
                    variant="outlined"
                    {...field}
                    select
                    label="Customer (or General) *"
                    fullWidth
                    error={!!errors.clientId}
                    helperText={errors.clientId?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('siteId', ''); // Reset site when client changes
                    }}
                  >
                    {clients.map(client => (
                      <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
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
                    error={!!errors.siteId}
                    helperText={errors.siteId?.message}
                    disabled={!selectedClientId || loadingSites}
                  >
                    {sites.map(site => (
                      <MenuItem key={site.id} value={site.id}>{site.name}</MenuItem>
                    ))}
                    {selectedClientId && sites.length === 0 && !loadingSites && (
                      <MenuItem value="" disabled>No branches found</MenuItem>
                    )}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Service Details</Typography>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                variant="outlined"
                label="Service Name (e.g. Haircut) *"
                fullWidth
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                variant="outlined"
                label="Category (Hair, Skin, Nails) *"
                fullWidth
                {...register('category')}
                error={!!errors.category}
                helperText={errors.category?.message}
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
                    label="Status"
                    fullWidth
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                variant="outlined"
                label="Duration (Minutes) *"
                type="number"
                fullWidth
                {...register('durationMinutes')}
                error={!!errors.durationMinutes}
                helperText={errors.durationMinutes?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                variant="outlined"
                label="Base Price *"
                type="number"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }
                }}
                fullWidth
                {...register('basePrice')}
                error={!!errors.basePrice}
                helperText={errors.basePrice?.message}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                variant="outlined"
                label="Service Description / Notes"
                fullWidth
                multiline
                rows={2}
                {...register('notes')}
              />
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save Service'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EquipmentFormDialog;
