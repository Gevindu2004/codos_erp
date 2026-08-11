import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField, InputAdornment, Chip } from '@mui/material';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import type { Inventory } from '../../models/Inventory';
import { getInventoryItems, deleteInventoryItem } from '../../services/inventory.service';
import InventoryFormDialog from './InventoryFormDialog';

const InventoryList: React.FC = () => {
  const [items, setItems] = useState<Inventory[]>([]);
  const [filteredItems, setFilteredItems] = useState<Inventory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | undefined>();

  const fetchItems = async () => {
    try {
      const data = await getInventoryItems();
      setItems(data);
      setFilteredItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredItems(items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } else {
      setFilteredItems(items);
    }
  }, [searchQuery, items]);

  const handleAdd = () => {
    setEditingItem(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (item: Inventory) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteInventoryItem(id);
      fetchItems();
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogSave = () => {
    setDialogOpen(false);
    fetchItems();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Retail Stock</Typography>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={handleAdd}>
          Add Product
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search products by name or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><Search size={20} /></InputAdornment>
            }
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product / SKU</TableCell>
              <TableCell>Brand & Category</TableCell>
              <TableCell>Retail Price</TableCell>
              <TableCell>Wholesale</TableCell>
              <TableCell align="center">Stock Level</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary">SKU: {item.sku}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{item.brand}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.category}</Typography>
                </TableCell>
                <TableCell>${item.retailPrice.toFixed(2)}</TableCell>
                <TableCell>${item.wholesaleCost.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{item.quantityOnHand}</Typography>
                    {item.quantityOnHand <= item.reorderPoint && (
                      <Chip label="Low Stock" size="small" color="error" variant="outlined" sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEdit(item)}><Edit2 size={18} /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(item.id!)}><Trash2 size={18} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No retail products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {dialogOpen && (
        <InventoryFormDialog 
          open={dialogOpen} 
          onClose={handleDialogClose} 
          onSave={handleDialogSave} 
          item={editingItem} 
        />
      )}
    </Box>
  );
};

export default InventoryList;
