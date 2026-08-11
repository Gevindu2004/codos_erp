import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, InputAdornment } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Inventory } from '../../models/Inventory';
import { addInventoryItem, updateInventoryItem } from '../../services/inventory.service';

const inventorySchema = z.object({
  name: z.string().min(1, 'Product Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  brand: z.string().min(1, 'Brand is required'),
  category: z.string().min(1, 'Category is required'),
  quantityOnHand: z.coerce.number().min(0, 'Quantity cannot be negative'),
  reorderPoint: z.coerce.number().min(0, 'Reorder point cannot be negative'),
  retailPrice: z.coerce.number().min(0, 'Retail price cannot be negative'),
  wholesaleCost: z.coerce.number().min(0, 'Wholesale cost cannot be negative'),
  supplier: z.string().min(1, 'Supplier is required'),
  notes: z.string().optional()
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface InventoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  item?: Inventory;
}

const InventoryFormDialog: React.FC<InventoryFormDialogProps> = ({ open, onClose, onSave, item }) => {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema) as any,
    defaultValues: {
      name: '',
      sku: '',
      brand: '',
      category: '',
      quantityOnHand: 0,
      reorderPoint: 5,
      retailPrice: 0,
      wholesaleCost: 0,
      supplier: '',
      notes: ''
    }
  });

  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        sku: item.sku,
        brand: item.brand,
        category: item.category,
        quantityOnHand: item.quantityOnHand,
        reorderPoint: item.reorderPoint,
        retailPrice: item.retailPrice,
        wholesaleCost: item.wholesaleCost,
        supplier: item.supplier,
        notes: item.notes || ''
      });
    } else {
      reset({
        name: '',
        sku: '',
        brand: '',
        category: '',
        quantityOnHand: 0,
        reorderPoint: 5,
        retailPrice: 0,
        wholesaleCost: 0,
        supplier: '',
        notes: ''
      });
    }
  }, [item, reset]);

  const onSubmit = async (data: InventoryFormData) => {
    setSaving(true);
    try {
      if (item?.id) {
        await updateInventoryItem(item.id, data);
      } else {
        await addInventoryItem(data);
      }
      onSave();
    } catch (error) {
      console.error(error);
      alert('Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{item ? 'Edit Product' : 'Add New Product'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Product Name *"
                fullWidth
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="SKU / Barcode *"
                fullWidth
                {...register('sku')}
                error={!!errors.sku}
                helperText={errors.sku?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Brand *"
                fullWidth
                {...register('brand')}
                error={!!errors.brand}
                helperText={errors.brand?.message}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Category *"
                fullWidth
                {...register('category')}
                error={!!errors.category}
                helperText={errors.category?.message}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Supplier *"
                fullWidth
                {...register('supplier')}
                error={!!errors.supplier}
                helperText={errors.supplier?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Quantity On Hand *"
                type="number"
                fullWidth
                {...register('quantityOnHand')}
                error={!!errors.quantityOnHand}
                helperText={errors.quantityOnHand?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Low Stock Alert (Reorder Point) *"
                type="number"
                fullWidth
                {...register('reorderPoint')}
                error={!!errors.reorderPoint}
                helperText={errors.reorderPoint?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Wholesale Cost *"
                type="number"
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }
                }}
                {...register('wholesaleCost')}
                error={!!errors.wholesaleCost}
                helperText={errors.wholesaleCost?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Retail Price *"
                type="number"
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }
                }}
                {...register('retailPrice')}
                error={!!errors.retailPrice}
                helperText={errors.retailPrice?.message}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
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
            {saving ? 'Saving...' : 'Save Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InventoryFormDialog;
