import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Grid, CircularProgress, IconButton, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody, MenuItem } from '@mui/material';
import { ArrowLeft, Printer } from 'lucide-react';
import type { Invoice, InvoiceLineItem } from '../../models/Invoice';
import type { Client } from '../../models/Client';
import { getInvoiceById, updateInvoice, getInvoiceLineItems, addInvoiceLineItem, deleteInvoiceLineItem } from '../../services/invoice.service';
import { getClientById } from '../../services/client.service';

const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New line item state
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);

  const fetchAll = async () => {
    if (!id) return;
    try {
      const invData = await getInvoiceById(id);
      if (invData) {
        setInvoice(invData);
        
        const [c, items] = await Promise.all([
          getClientById(invData.clientId),
          getInvoiceLineItems(id)
        ]);

        setClient(c);
        setLineItems(items);
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
    if (!invoice || !id) return;
    await updateInvoice(id, { status: newStatus });
    setInvoice({ ...invoice, status: newStatus });
  };

  const handleAddLineItem = async () => {
    if (!newItemDesc.trim() || !id) return;
    await addInvoiceLineItem(id, {
      description: newItemDesc,
      quantity: newItemQty,
      unitPrice: newItemPrice
    });
    setNewItemDesc('');
    setNewItemQty(1);
    setNewItemPrice(0);
    fetchAll();
  };

  const handleDeleteLineItem = async (itemId: string) => {
    if (!id) return;
    await deleteInvoiceLineItem(id, itemId);
    fetchAll();
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (!invoice) return <Typography>Invoice not found.</Typography>;

  return (
    <Box>
      {/* NO PRINT AREA */}
      <Box className="no-print" sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/invoices')}>
          <ArrowLeft size={24} />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{invoice.invoiceNumber}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            select
            size="small"
            value={invoice.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="DRAFT">Draft</MenuItem>
            <MenuItem value="SENT">Sent</MenuItem>
            <MenuItem value="PAID">Paid</MenuItem>
            <MenuItem value="OVERDUE">Overdue</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </TextField>
          <Button variant="outlined" startIcon={<Printer size={20} />} onClick={handlePrint}>
            Print / PDF
          </Button>
        </Box>
      </Box>

      {/* PRINTABLE AREA */}
      <Paper className="print-container" sx={{ p: { xs: 3, md: 6 }, maxWidth: 900, mx: 'auto', mb: 4 }}>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>INVOICE</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{invoice.invoiceNumber}</Typography>
            <Typography variant="body2" color="text.secondary">Issued: {invoice.issueDate}</Typography>
            <Typography variant="body2" color="text.secondary">Due: {invoice.dueDate}</Typography>
            {invoice.status === 'PAID' && (
              <Typography variant="h6" color="success.main" sx={{ mt: 2, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 }}>PAID</Typography>
            )}
          </Grid>
          <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Codos ERP Demo</Typography>
            <Typography variant="body2" color="text.secondary">123 Software Ave</Typography>
            <Typography variant="body2" color="text.secondary">Tech City, TX 75001</Typography>
          </Grid>
        </Grid>

        <Box sx={{ mb: 6 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>BILL TO</Typography>
          <Typography variant="h6">{client?.name || 'Unknown Client'}</Typography>
          <Typography variant="body2" color="text.secondary">{client?.website}</Typography>
        </Box>

        <Table sx={{ mb: 4 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', borderBottom: '2px solid black' }}>Description</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', borderBottom: '2px solid black' }}>Qty</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', borderBottom: '2px solid black' }}>Unit Price</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', borderBottom: '2px solid black' }}>Total</TableCell>
              <TableCell className="no-print" width={50}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lineItems.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                <TableCell align="right">${item.total.toFixed(2)}</TableCell>
                <TableCell className="no-print" align="right">
                  <Button size="small" color="error" onClick={() => handleDeleteLineItem(item.id!)}>X</Button>
                </TableCell>
              </TableRow>
            ))}

            {/* No Print Add Row */}
            <TableRow className="no-print" sx={{ backgroundColor: '#f9fafb' }}>
              <TableCell>
                <TextField size="small" fullWidth placeholder="New item description..." value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} />
              </TableCell>
              <TableCell align="right">
                <TextField size="small" type="number" sx={{ width: 80 }} value={newItemQty} onChange={e => setNewItemQty(Number(e.target.value))} />
              </TableCell>
              <TableCell align="right">
                <TextField size="small" type="number" sx={{ width: 100 }} value={newItemPrice} onChange={e => setNewItemPrice(Number(e.target.value))} />
              </TableCell>
              <TableCell align="right">
                ${(newItemQty * newItemPrice).toFixed(2)}
              </TableCell>
              <TableCell align="right">
                <Button variant="contained" size="small" onClick={handleAddLineItem}>Add</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 6 }}>
          <Box sx={{ width: 300 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>${(invoice.subtotal || 0).toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">Tax ({(invoice.taxRate * 100).toFixed(1)}%)</Typography>
              <Typography>${(invoice.taxAmount || 0).toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid black', pt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>${(invoice.total || 0).toFixed(2)}</Typography>
            </Box>
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>NOTES / TERMS</Typography>
          <Typography variant="body2">{invoice.notes || 'Please pay within 30 days of receipt. Thank you for your business!'}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default InvoiceDetails;
