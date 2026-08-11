import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Typography } from '@mui/material';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { Contact } from '../../models/Client';
import { getClientContacts, deleteContact } from '../../services/client.service';
import ContactFormDialog from './ContactFormDialog';

interface Props {
  clientId: string;
}

const ContactList: React.FC<Props> = ({ clientId }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await getClientContacts(clientId);
      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [clientId]);

  const handleOpenDialog = (contact?: Contact) => {
    setSelectedContact(contact);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = (refresh?: boolean) => {
    setIsDialogOpen(false);
    setSelectedContact(undefined);
    if (refresh) {
      fetchContacts();
    }
  };

  const handleDelete = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(clientId, contactId);
        fetchContacts();
      } catch (error) {
        console.error("Error deleting contact:", error);
        alert('Failed to delete contact.');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
        >
          Add Contact
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ backgroundColor: 'background.default' }}>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Loading...</TableCell>
              </TableRow>
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No contacts found.</TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {contact.firstName} {contact.lastName}
                    {contact.isPrimary && (
                      <Typography component="span" variant="caption" sx={{ ml: 1, color: 'primary.main', fontWeight: 'bold' }}>
                        (Primary)
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{contact.title || '-'}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell align="right">
                    <IconButton color="info" onClick={() => handleOpenDialog(contact)} size="small" title="Edit">
                      <Edit size={16} />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(contact.id!)} size="small" title="Delete">
                      <Trash2 size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ContactFormDialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog} 
        clientId={clientId}
        contact={selectedContact} 
      />
    </Box>
  );
};

export default ContactList;
