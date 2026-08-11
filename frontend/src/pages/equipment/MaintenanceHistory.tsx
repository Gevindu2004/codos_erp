import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip } from '@mui/material';
import { Plus, Trash2 } from 'lucide-react';
import type { MaintenanceLog } from '../../models/Equipment';
import { getMaintenanceLogs, deleteMaintenanceLog } from '../../services/equipment.service';
import MaintenanceLogDialog from './MaintenanceLogDialog';

interface MaintenanceHistoryProps {
  equipmentId: string;
}

const MaintenanceHistory: React.FC<MaintenanceHistoryProps> = ({ equipmentId }) => {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchLogs = async () => {
    try {
      const data = await getMaintenanceLogs(equipmentId);
      setLogs(data);
    } catch (error) {
      console.error("Error fetching maintenance logs:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [equipmentId]);

  const handleDelete = async (logId: string) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      await deleteMaintenanceLog(equipmentId, logId);
      fetchLogs();
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PREVENTATIVE': return 'info';
      case 'REPAIR': return 'error';
      case 'INSPECTION': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Maintenance History</Typography>
        <Button 
          variant="outlined" 
          startIcon={<Plus size={18} />}
          onClick={() => setIsDialogOpen(true)}
        >
          Add Record
        </Button>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Technician</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No maintenance records found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>
                    <Chip label={log.type} size="small" color={getTypeColor(log.type) as any} />
                  </TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{log.technicianName}</TableCell>
                  <TableCell>{log.cost ? `$${log.cost}` : '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton color="error" size="small" onClick={() => handleDelete(log.id!)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <MaintenanceLogDialog 
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={() => {
          setIsDialogOpen(false);
          fetchLogs();
        }}
        equipmentId={equipmentId}
      />
    </Box>
  );
};

export default MaintenanceHistory;
