import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Grid, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Site } from '../../models/Client';
import { addSite, updateSite } from '../../services/client.service';

const siteSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  zipCode: z.string().min(1, 'ZIP/Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  notes: z.string().optional(),
});

type SiteFormData = z.infer<typeof siteSchema>;

interface Props {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  clientId: string;
  site?: Site;
}

const SiteFormDialog: React.FC<Props> = ({ open, onClose, clientId, site }) => {
  const isEditing = !!site;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
  });

  useEffect(() => {
    if (open) {
      if (site) {
        reset({
          name: site.name,
          addressLine1: site.addressLine1,
          addressLine2: site.addressLine2 || '',
          city: site.city,
          state: site.state,
          zipCode: site.zipCode,
          country: site.country,
          latitude: site.latitude || '',
          longitude: site.longitude || '',
          notes: site.notes || '',
        });
      } else {
        reset({
          name: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          latitude: '',
          longitude: '',
          notes: '',
        });
      }
    }
  }, [open, site, reset]);

  const onSubmit = async (data: SiteFormData) => {
    try {
      if (isEditing && site.id) {
        await updateSite(clientId, site.id, data);
      } else {
        await addSite(clientId, data);
      }
      onClose(true);
    } catch (error) {
      console.error("Error saving branch:", error);
      alert('Failed to save branch');
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Branch Name (e.g., Downtown, Main St)"
              fullWidth
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            
            <TextField
              label="Address Line 1"
              fullWidth
              {...register('addressLine1')}
              error={!!errors.addressLine1}
              helperText={errors.addressLine1?.message}
            />
            
            <TextField
              label="Address Line 2"
              fullWidth
              {...register('addressLine2')}
              error={!!errors.addressLine2}
              helperText={errors.addressLine2?.message}
            />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="City"
                  fullWidth
                  {...register('city')}
                  error={!!errors.city}
                  helperText={errors.city?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="State/Province"
                  fullWidth
                  {...register('state')}
                  error={!!errors.state}
                  helperText={errors.state?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="ZIP/Postal Code"
                  fullWidth
                  {...register('zipCode')}
                  error={!!errors.zipCode}
                  helperText={errors.zipCode?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Country"
                  fullWidth
                  {...register('country')}
                  error={!!errors.country}
                  helperText={errors.country?.message}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ mt: 1 }}>GPS Coordinates (Optional)</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Latitude"
                  fullWidth
                  {...register('latitude')}
                  error={!!errors.latitude}
                  helperText={errors.latitude?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Longitude"
                  fullWidth
                  {...register('longitude')}
                  error={!!errors.longitude}
                  helperText={errors.longitude?.message}
                />
              </Grid>
            </Grid>
            
            <TextField
              label="Additional Notes / Access Instructions"
              fullWidth
              multiline
              rows={3}
              {...register('notes')}
              error={!!errors.notes}
              helperText={errors.notes?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose()} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SiteFormDialog;
