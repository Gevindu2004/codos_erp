import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Client } from '../../models/Client';
import { addClient, updateClient } from '../../services/client.service';

const clientSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface Props {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  client?: Client;
}

const ClientFormDialog: React.FC<Props> = ({ open, onClose, client }) => {
  const isEditing = !!client;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      status: 'ACTIVE'
    }
  });

  useEffect(() => {
    if (open) {
      if (client) {
        reset({
          name: client.name,
          industry: client.industry || '',
          website: client.website || '',
          status: client.status,
        });
      } else {
        reset({
          name: '',
          industry: '',
          website: '',
          status: 'ACTIVE',
        });
      }
    }
  }, [open, client, reset]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (isEditing && client.id) {
        await updateClient(client.id, data);
      } else {
        await addClient(data);
      }
      onClose(true); // close and refresh list
    } catch (error) {
      console.error("Error saving client:", error);
      alert('Failed to save client');
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Customer Name"
              fullWidth
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="Category (e.g. VIP, Regular)"
              fullWidth
              {...register('industry')}
              error={!!errors.industry}
              helperText={errors.industry?.message}
            />
            <TextField
              label="Website"
              fullWidth
              placeholder="https://..."
              {...register('website')}
              error={!!errors.website}
              helperText={errors.website?.message}
            />
            <TextField
              select
              label="Status"
              fullWidth
              defaultValue={client?.status || 'ACTIVE'}
              {...register('status')}
              error={!!errors.status}
              helperText={errors.status?.message}
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </TextField>
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

export default ClientFormDialog;
