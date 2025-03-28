import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '@/context/WorkflowContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  InputAdornment,
  Collapse,
  Divider,
  Drawer
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  PushPinOutlined as PushPinIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Add as AddIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  LogoutOutlined as LogoutIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { 
  Menu, 
  MenuItem, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle 
} from '@mui/material';


const WorkflowList = () => {
  const navigate = useNavigate();
  const { workflows, loading, executeWorkflow } = useWorkflow();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedWorkflows, setExpandedWorkflows] = useState({});
  const [highlighted, setHighlighted] = useState({});
  const [anchorEl, setAnchorEl] = useState(null); 
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '' });


  const toggleHighlight = (workflowId) => {
    setHighlighted((prev) => ({
      ...prev,
      [workflowId]: !prev[workflowId] // Toggle state
    }));
  };

  const handleMenuOpen = (event, workflow) => {
    setAnchorEl(event.currentTarget);
    setSelectedWorkflow(workflow);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleDialogOpen = (type, workflow) => {
    setConfirmDialog({ open: true, type });
    setSelectedWorkflow(workflow);
    handleMenuClose();
  };
  
  const handleDialogClose = () => {
    setConfirmDialog({ open: false, type: '' });
  };
  
  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const filteredWorkflows = workflows.filter(workflow => 
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleExpand = (workflowId) => {
    setExpandedWorkflows(prev => ({
      ...prev,
      [workflowId]: !prev[workflowId]
    }));
  };

  const handleExecute = (workflowId) => {
    executeWorkflow(workflowId);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              size="small" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{ border: 1, borderColor: 'divider' }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
            <Typography variant="h5" fontWeight="bold">Workflow Builder</Typography>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/process/new')}
            startIcon={<AddIcon />}
            sx={{ 
              bgcolor: '#333', 
              '&:hover': { bgcolor: 'black' }, 
              textTransform: 'none',
              borderRadius: 1,
              color: 'white',
              fontWeight:'bold',
              fontSize:'20px'
            }}
          >
            Create New Process
          </Button>
        </Box>
      </Box>

      <Drawer 
        anchor="left" 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        sx={{
          '& .MuiDrawer-paper': { 
            width: 240,
            boxSizing: 'border-box',
            p: 2
          },
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="bold">Highbridge</Typography>
        </Box>
        
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={1}>Signed in as:</Typography>
          <Typography fontWeight="medium">{user?.name || 'User'}</Typography>
          <Typography variant="body2" color="text.secondary">{user?.email || 'user@example.com'}</Typography>
        </Box>
        
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button 
            variant="outlined" 
            fullWidth
            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
            onClick={() => {
              setSidebarOpen(false);
            }}
          >
            Workflows
          </Button>
          
          <Button 
            variant="text" 
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      <Box sx={{ px: 3, py: 2 }}>
        <Box sx={{ mb: 4, mt: 2, maxWidth: 'xl' }}>
          <TextField
            placeholder="Search By Workflow Name/ID"
            fullWidth
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              maxWidth: 600,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: '8px 8px 0 0', boxShadow: 'none' , '& .MuiTableCell-root': { fontSize: '1.2rem' } }}>
          <Table>
            <TableHead>
              <TableRow sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TableCell sx={{ fontWeight: 'medium', width: '25%' }}>Workflow Name</TableCell>
                <TableCell sx={{ fontWeight: 'medium', width: '10%' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'medium', width: '25%' }}>Last Edited On</TableCell>
                <TableCell sx={{ fontWeight: 'medium', width: '25%' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'medium', width: '15%' }} align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWorkflows.length > 0 ? (
                filteredWorkflows.map(workflow => (
                  <React.Fragment key={workflow.id}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'medium' }}>{workflow.name}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>#{workflow.id.substring(0, 3)}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{workflow.lastEdited.author} | {workflow.lastEdited.time}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {workflow.description}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton size="small" onClick={() => toggleHighlight(workflow.id)}>
                            <PushPinIcon fontSize="small" sx={{ color: highlighted[workflow.id] ? 'red' : 'black' }} />
                          </IconButton>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() =>  handleDialogOpen('execute', workflow)}
                            sx={{ textTransform: 'none' }}
                          >
                            Execute
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => navigate(`/process/${workflow.id}`)}
                            sx={{ textTransform: 'none' }}
                          >
                            Edit
                          </Button>
                          <IconButton size="small" onClick={(event) => handleMenuOpen(event, workflow)}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => toggleExpand(workflow.id)}>
                            {expandedWorkflows[workflow.id] ? (
                              <KeyboardArrowUpIcon fontSize="small" />
                            ) : (
                              <KeyboardArrowDownIcon fontSize="small" />
                            )}
                          </IconButton>
                          {/* Kebab Menu Dropdown */}
                          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            <MenuItem onClick={() => handleDialogOpen('delete', selectedWorkflow)}>Delete</MenuItem>
                          </Menu>

                          {/* Confirmation Dialog */}
                          <Dialog open={confirmDialog.open} onClose={handleDialogClose}>
                            <DialogTitle>
                              {confirmDialog.type === 'execute' 
                                ? `Are you sure you want to execute process '${selectedWorkflow?.name}'?`
                                : `Are you sure you want to delete process '${selectedWorkflow?.name}'?`}
                            </DialogTitle>
                            
                            <DialogContent>
                              <DialogContentText sx={{ color: 'red' }}>
                                You cannot undo this step.
                              </DialogContentText>
                            </DialogContent>

                            <DialogActions>
                              <Button onClick={handleDialogClose} color="primary">Cancel</Button>
                              <Button 
                                onClick={() => {
                                  if (confirmDialog.type === 'execute') {
                                    handleExecute(selectedWorkflow.id);
                                  } else {
                                    handleDelete(selectedWorkflow.id);
                                  }
                                  handleDialogClose();
                                }} 
                                color="error"
                              >
                                Confirm
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5} sx={{ p: 0 }}>
                        <Collapse in={expandedWorkflows[workflow.id]} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2, pl: 6, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ position: 'relative', mr: 2 }}>
                                  <Box sx={{ position: 'absolute', top: 0, left: '9px', bottom: 0, width: '2px', bgcolor: 'grey.300' }}></Box>
                                  <Box sx={{ position: 'relative', zIndex: 1, width: '20px', height: '20px', borderRadius: '50%', bgcolor: 'error.main' }}></Box>
                                </Box>
                                <Typography sx={{ color: 'text.secondary', mr: 2 }}>28/05 - 22:43 IST</Typography>
                                <Box sx={{ px: 1, py: 0.5, bgcolor: 'success.50', borderRadius: 1, mr: 1 }}>
                                  <Typography variant="caption" sx={{ color: 'success.dark' }}>Passed</Typography>
                                </Box>
                                <IconButton size="small">
                                  <DescriptionIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                </IconButton>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ position: 'relative', mr: 2 }}>
                                  <Box sx={{ position: 'absolute', top: 0, left: '9px', bottom: 0, width: '2px', bgcolor: 'grey.300' }}></Box>
                                  <Box sx={{ position: 'relative', zIndex: 1, width: '20px', height: '20px', borderRadius: '50%', bgcolor: 'error.main' }}></Box>
                                </Box>
                                <Typography sx={{ color: 'text.secondary', mr: 2 }}>28/05 - 22:43 IST</Typography>
                                <Box sx={{ px: 1, py: 0.5, bgcolor: 'error.50', borderRadius: 1, mr: 1 }}>
                                  <Typography variant="caption" sx={{ color: 'error.dark' }}>Failed</Typography>
                                </Box>
                                <IconButton size="small">
                                  <DescriptionIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                </IconButton>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ position: 'relative', mr: 2 }}>
                                  <Box sx={{ width: '20px', height: '20px', borderRadius: '50%', bgcolor: 'error.main' }}></Box>
                                </Box>
                                <Typography sx={{ color: 'text.secondary', mr: 2 }}>28/05 - 22:43 IST</Typography>
                                <Box sx={{ px: 1, py: 0.5, bgcolor: 'error.50', borderRadius: 1, mr: 1 }}>
                                  <Typography variant="caption" sx={{ color: 'error.dark' }}>Failed</Typography>
                                </Box>
                                <IconButton size="small">
                                  <DescriptionIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="text.secondary" mb={2}>No workflows found</Typography>
                    <Button 
                      variant="contained"
                      onClick={() => navigate('/process/new')}
                      sx={{ textTransform: 'none' }}
                    >
                      Create your first workflow
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default WorkflowList;
