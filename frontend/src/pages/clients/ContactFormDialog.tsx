import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, FormControlLabel, Checkbox } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Contact } from '../../models/Client';
import { addContact, updateContact } from '../../services/client.service';

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  title: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface Props {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  clientId: string;
  contact?: Contact;
}

const ContactFormDialog: React.FC<Props> = ({ open, onClose, clientId, contact }) => {
  const isEditing = !!contact;

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      isPrimary: false
    }
  });

  useEffect(() => {
    if (open) {
      if (contact) {
        reset({
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          title: contact.title || '',
          isPrimary: contact.isPrimary || false,
        });
      } else {
        reset({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          title: '',
          isPrimary: false,
        });
      }
    }
  }, [open, contact, reset]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      if (isEditing && contact.id) {
        await updateContact(clientId, contact.id, data);
      } else {
        await addContact(clientId, data);
      }
      onClose(true);
    } catch (error) {
      console.error("Error saving contact:", error);
      alert('Failed to save contact');
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="First Name"
                fullWidth
                {...register('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
              <TextField
                label="Last Name"
                fullWidth
                {...register('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            </Box>
            <TextField
              label="Email"
              fullWidth
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Phone"
              fullWidth
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
            <TextField
              label="Job Title"
              fullWidth
              {...register('title')}
              error={!!errors.title}
              helperText={errors.title?.message}
            />
            <Controller
              name="isPrimary"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="Mark as Primary Contact"
                />
              )}
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

export default ContactFormDialog;
