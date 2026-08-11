import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addMaintenanceLog } from '../../services/equipment.service';

const logSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['PREVENTATIVE', 'REPAIR', 'INSPECTION']),
  description: z.string().min(1, 'Description is required'),
  technicianName: z.string().min(1, 'Technician Name is required'),
  cost: z.coerce.number().optional(),
});

type LogFormData = z.infer<typeof logSchema>;

interface MaintenanceLogDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  equipmentId: string;
}

const MaintenanceLogDialog: React.FC<MaintenanceLogDialogProps> = ({ open, onClose, onSave, equipmentId }) => {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<LogFormData>({
    resolver: zodResolver(logSchema) as any,
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'PREVENTATIVE',
      description: '',
      technicianName: '',
      cost: undefined
    }
  });

  const onSubmit = async (data: LogFormData) => {
    setSaving(true);
    try {
      await addMaintenanceLog(equipmentId, data);
      reset();
      onSave();
    } catch (error) {
      console.error("Error saving log:", error);
      alert("Failed to save record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Maintenance Record</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit as any)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                variant="outlined"
                label="Date *"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                {...register('date')}
                error={!!errors.date}
                helperText={errors.date?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="type"
                control={control as any}
                render={({ field }) => (
                  <TextField
                variant="outlined"
                    {...field}
                    select
                    label="Type *"
                    fullWidth
                  >
                    <MenuItem value="PREVENTATIVE">Preventative</MenuItem>
                    <MenuItem value="REPAIR">Repair</MenuItem>
                    <MenuItem value="INSPECTION">Inspection</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                variant="outlined"
                label="Technician Name *"
                fullWidth
                {...register('technicianName')}
                error={!!errors.technicianName}
                helperText={errors.technicianName?.message}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                variant="outlined"
                label="Cost ($)"
                type="number"
                fullWidth
                {...register('cost')}
                error={!!errors.cost}
                helperText={errors.cost?.message}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description / Notes *"
                fullWidth
                multiline
                rows={3}
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save Record'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MaintenanceLogDialog;
