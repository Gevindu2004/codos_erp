import React, { useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, MenuItem, Alert 
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUser } from '../../services/user.service';
import type { User } from '../../models/User';

const userSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  role: z.enum(['Admin', 'Manager', 'Technician', 'Client']),
  status: z.enum(['active', 'inactive']),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormDialogProps {
  open: boolean;
  onClose: (refresh: boolean) => void;
  user?: User;
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({ open, onClose, user }) => {
  const [error, setError] = React.useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      role: 'Client',
      status: 'active',
    }
  });

  useEffect(() => {
    if (user && open) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      });
    } else if (open) {
      // If adding a new user, they should ideally be added via the standard register flow,
      // but if the admin wants to create them, they could do it here (omitted for now, this form is just for edit)
      reset({
        firstName: '',
        lastName: '',
        role: 'Client',
        status: 'active',
      });
    }
    setError(null);
  }, [user, open, reset]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      if (user) {
        await updateUser(user.id, data);
        onClose(true);
      } else {
        setError('Creating new users directly from this panel is currently unsupported. Please ask them to register first.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user. Is the backend running?');
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        {user ? 'Edit Staff Member' : 'Add Staff Member'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField 
                    {...field} 
                    label="First Name" 
                    fullWidth 
                    error={!!errors.firstName} 
                    helperText={errors.firstName?.message} 
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField 
                    {...field} 
                    label="Last Name" 
                    fullWidth 
                    error={!!errors.lastName} 
                    helperText={errors.lastName?.message} 
                  />
                )}
              />
            </Box>
            
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  select 
                  label="Role" 
                  fullWidth 
                  error={!!errors.role} 
                  helperText={errors.role?.message}
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Technician">Technician</MenuItem>
                  <MenuItem value="Client">Client</MenuItem>
                </TextField>
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  select 
                  label="Status" 
                  fullWidth 
                  error={!!errors.status} 
                  helperText={errors.status?.message}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => onClose(false)} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserFormDialog;
