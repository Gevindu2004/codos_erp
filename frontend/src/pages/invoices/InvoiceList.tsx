import React, { useEffect, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Typography, Chip, Tabs, Tab } from '@mui/material';
import { Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Invoice } from '../../models/Invoice';
import type { Client } from '../../models/Client';
import { getInvoices, deleteInvoice } from '../../services/invoice.service';
import { getClients } from '../../services/client.service';

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [tabValue, setTabValue] = useState(0); // 0 = All, 1 = Draft, 2 = Sent/Overdue, 3 = Paid

  const fetchData = async () => {
    try {
      const [invData, clientsData] = await Promise.all([
        getInvoices(),
        getClients()
      ]);
      setInvoices(invData);
      
      const clientMap: Record<string, Client> = {};
      clientsData.forEach(c => { clientMap[c.id!] = c; });
      setClients(clientMap);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice(id);
      fetchData();
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    if (tabValue === 1) return inv.status === 'DRAFT';
    if (tabValue === 2) return inv.status === 'SENT' || inv.status === 'OVERDUE';
    if (tabValue === 3) return inv.status === 'PAID';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'SENT': return 'info';
      case 'PAID': return 'success';
      case 'OVERDUE': return 'error';
      case 'CANCELLED': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Invoices</Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_e, val) => setTabValue(val)} sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="All" />
          <Tab label="Drafts" />
          <Tab label="Sent & Overdue" />
          <Tab label="Paid" />
        </Tabs>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((inv) => (
                  <TableRow key={inv.id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{inv.invoiceNumber}</TableCell>
                    <TableCell>{clients[inv.clientId]?.name || 'Unknown'}</TableCell>
                    <TableCell>{inv.issueDate}</TableCell>
                    <TableCell>${inv.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip label={inv.status} size="small" color={getStatusColor(inv.status) as any} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => navigate(`/invoices/${inv.id}`)}>
                        <Eye size={20} />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(inv.id!)}>
                        <Trash2 size={20} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default InvoiceList;
