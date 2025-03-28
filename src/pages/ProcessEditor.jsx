
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useWorkflow } from '@/context/WorkflowContext';
import { useAuth } from '@/context/AuthContext';
import FlowNode from '@/components/FlowNode';
import { 
  createNewElement, 
  drawConnection, 
  getConnectionPoints, 
  generateId, 
  isWorkflowValid 
} from '@/utils/flowUtils';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  IconButton,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  CircularProgress,
  Drawer,
  Tooltip
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Language as ApiIcon,
  TextFields as TextIcon,
  Settings as SettingsIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as RestartAltIcon
} from '@mui/icons-material';

const ProcessEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { getWorkflow, addWorkflow, updateWorkflow, loading: workflowLoading } = useWorkflow();
  const { toast } = useToast();
  
  const [workflow, setWorkflow] = useState(null);
  const [elements, setElements] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStartNode, setConnectionStartNode] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showNodeConfig, setShowNodeConfig] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);
  const [configData, setConfigData] = useState({});
  const [currentPosition, setCurrentPosition] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState('passed'); // 'passed', 'failed', or 'draft'

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const plusButtonRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (!workflowLoading) {
      if (id && id !== 'new') {
        const existingWorkflow = getWorkflow(id);
        if (existingWorkflow) {
          setWorkflow(existingWorkflow);
          setElements(existingWorkflow.elements || []);
          setConnections(existingWorkflow.connections || []);
          setWorkflowName(existingWorkflow.name);
          setWorkflowDescription(existingWorkflow.description);
          setWorkflowStatus(existingWorkflow.status || 'draft');
        } else {
          toast({
            title: "Workflow Not Found",
            description: "The requested workflow could not be found.",
            variant: "destructive",
          });
          navigate('/workflows');
        }
      } else {
        const newElements = [
          createNewElement('start', window.innerWidth / 2 - 40, 100),
          createNewElement('end', window.innerWidth / 2 - 40, 400)
        ];
        setElements(newElements);
        setWorkflowStatus('draft');
      }
    }
  }, [id, user, authLoading, workflowLoading, getWorkflow, navigate, toast]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    
    if (container) {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#999999';

    connections.forEach(conn => {
      const sourceNode = elements.find(el => el.id === conn.source);
      const targetNode = elements.find(el => el.id === conn.target);
      
      if (sourceNode && targetNode) {
        const sourcePoint = getConnectionPoints(sourceNode);
        const targetPoint = {
          x: targetNode.position.x + (targetNode.type === 'start' || targetNode.type === 'end' ? 50 : 110),
          y: targetNode.position.y
        };
        
        drawConnection(sourcePoint.x, sourcePoint.y, targetPoint.x, targetPoint.y, ctx);
      }
    });
  }, [connections, elements]);

  const handleNodeUpdate = (updatedNode) => {
    setElements(elements.map(el => el.id === updatedNode.id ? updatedNode : el));
  };

  const handleNodeDelete = (nodeId) => {
    setElements(elements.filter(el => el.id !== nodeId));
    setConnections(connections.filter(conn => 
      conn.source !== nodeId && conn.target !== nodeId
    ));
  };

  const handleConnect = (nodeId) => {
    if (!isConnecting) {
      setIsConnecting(true);
      setConnectionStartNode(nodeId);
      return;
    }
    
    if (connectionStartNode && nodeId !== connectionStartNode) {
      const connectionExists = connections.some(
        conn => conn.source === connectionStartNode && conn.target === nodeId
      );
      
      if (!connectionExists) {
        const newConnection = {
          id: generateId('conn'),
          source: connectionStartNode,
          target: nodeId
        };
        setConnections([...connections, newConnection]);
      }
    }
    
    setIsConnecting(false);
    setConnectionStartNode(null);
  };

  const findPositionForNewElement = () => {
    const startNode = elements.find(el => el.type === 'start');
    const endNode = elements.find(el => el.type === 'end');
    
    if (!startNode || !endNode) return { x: window.innerWidth / 2 - 100, y: 250 };
    
    let lastNodeBeforeEnd = null;
    for (const conn of connections) {
      if (conn.target === endNode.id) {
        lastNodeBeforeEnd = elements.find(el => el.id === conn.source);
        break;
      }
    }
    
    if (!lastNodeBeforeEnd) {
      return {
        x: startNode.position.x,
        y: startNode.position.y + (endNode.position.y - startNode.position.y) / 2
      };
    }
    
    return {
      x: lastNodeBeforeEnd.position.x,
      y: lastNodeBeforeEnd.position.y + (endNode.position.y - lastNodeBeforeEnd.position.y) / 2
    };
  };

  const handleAddElementFromButton = (x, y) => {
    setCurrentPosition({ x, y });
    setShowActionMenu(true);
  };

  const handleAddElement = (type) => {
    const position = currentPosition || findPositionForNewElement();
    
    const newElement = createNewElement(type, position.x, position.y);
    
    const endNode = elements.find(el => el.type === 'end');
    let nodeBeforeEnd = null;
    let connectionToEnd = null;
    
    if (endNode) {
      connectionToEnd = connections.find(conn => conn.target === endNode.id);
      if (connectionToEnd) {
        nodeBeforeEnd = elements.find(el => el.id === connectionToEnd.source);
      }
    }
    
    const updatedElements = [...elements, newElement];
    setElements(updatedElements);
    
    let updatedConnections = [...connections];
    
    const startNode = elements.find(el => el.type === 'start');
    
    if (startNode && position.y > startNode.position.y && position.y < endNode?.position.y) {
      const startConnections = connections.filter(conn => conn.source === startNode.id);
      
      if (startConnections.length > 0) {
        updatedConnections = connections.filter(conn => conn.source !== startNode.id);
        
        updatedConnections.push({
          id: generateId('conn'),
          source: startNode.id,
          target: newElement.id
        });
        
        startConnections.forEach(conn => {
          updatedConnections.push({
            id: generateId('conn'),
            source: newElement.id,
            target: conn.target
          });
        });
      } else {
        updatedConnections.push({
          id: generateId('conn'),
          source: startNode.id,
          target: newElement.id
        });
        
        if (endNode) {
          updatedConnections.push({
            id: generateId('conn'),
            source: newElement.id,
            target: endNode.id
          });
        }
      }
    } 
    else if (connectionToEnd && nodeBeforeEnd) {
      updatedConnections = connections.filter(conn => conn.id !== connectionToEnd.id);
      
      updatedConnections.push({
        id: generateId('conn'),
        source: nodeBeforeEnd.id,
        target: newElement.id
      });
      
      updatedConnections.push({
        id: generateId('conn'),
        source: newElement.id,
        target: endNode.id
      });
    } 
    else if (endNode) {
      if (startNode && elements.length === 2) {
        updatedConnections.push({
          id: generateId('conn'),
          source: startNode.id,
          target: newElement.id
        });
        
        updatedConnections.push({
          id: generateId('conn'),
          source: newElement.id,
          target: endNode.id
        });
      }
    }
    
    setConnections(updatedConnections);
    setShowActionMenu(false);
    setCurrentPosition(null);
    
    setCurrentElement(newElement);
    setConfigData(newElement.data);
    setShowConfigDialog(true);
  };

  const handleNodeClick = (element) => {
    // Skip configuration for start and end nodes
    if (element.type === 'start' || element.type === 'end') {
      return;
    }
    
    setSelectedNode(element);
    setShowNodeConfig(true);
    setCurrentElement(element);
    setConfigData(element.data);
  };

  const handleConfigSave = () => {
    if (currentElement) {
      const updatedElements = elements.map(el => 
        el.id === currentElement.id 
          ? { ...el, data: configData } 
          : el
      );
      setElements(updatedElements);
      setShowConfigDialog(false);
      setShowNodeConfig(false);
    }
  };

  const handleSave = () => {
    if (!workflowName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a workflow name",
        variant: "destructive",
      });
      return;
    }

    if (!isWorkflowValid(elements, connections)) {
      toast({
        title: "Invalid Workflow",
        description: "Workflow must have start and end nodes, at least one other element, and be properly connected.",
        variant: "destructive",
      });
      return;
    }

    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      tags: ['workflow'],
      elements,
      connections,
      status: workflowStatus || 'pending',
      lastEdited: {
        author: user?.name || 'User',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + 
              ' IST ' + new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }),
        timestamp: Date.now()
      }
    };

    if (id && id !== 'new') {
      updateWorkflow(id, workflowData);
      toast({
        title: "Workflow Updated",
        description: "The workflow has been updated successfully."
      });
    } else {
      addWorkflow(workflowData);
      toast({
        title: "Workflow Created",
        description: "The new workflow has been created successfully."
      });
    }

    setShowSaveDialog(false);
    navigate('/workflows');
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  const renderConfigFields = () => {
    if (!currentElement) return null;

    switch (currentElement.type) {
      case 'api':
        return (
          <Box sx={{ p: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Method</InputLabel>
              <Select
                value={configData.method || 'GET'}
                label="Method"
                onChange={(e) => setConfigData({...configData, method: e.target.value})}
              >
                <MenuItem value="GET">GET</MenuItem>
                <MenuItem value="POST">POST</MenuItem>
                <MenuItem value="PUT">PUT</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="URL"
              margin="normal"
              value={configData.url || ''} 
              onChange={(e) => setConfigData({...configData, url: e.target.value})}
              placeholder="https://api.example.com"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Headers"
              margin="normal"
              multiline
              rows={3}
              value={configData.headers || ''} 
              onChange={(e) => setConfigData({...configData, headers: e.target.value})}
              placeholder='{"Content-Type": "application/json"}'
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Body"
              margin="normal"
              multiline
              rows={3}
              value={configData.body || ''} 
              onChange={(e) => setConfigData({...configData, body: e.target.value})}
              placeholder='{"key": "value"}'
            />
          </Box>
        );
      case 'email':
        return (
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              value={configData.to || ''} 
              onChange={(e) => setConfigData({...configData, to: e.target.value})}
              placeholder="recipient@example.com"
              sx={{ mb: 2 }}
            />
          </Box>
        );
      case 'text':
        return (
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              label="Content"
              margin="normal"
              multiline
              rows={6}
              value={configData.content || ''} 
              onChange={(e) => setConfigData({...configData, content: e.target.value})}
              placeholder="Enter text content..."
            />
          </Box>
        );
      default:
        return null;
    }
  };

  if (authLoading || workflowLoading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Status label for header
  const StatusLabel = () => {
    const statusColors = {
      passed: { bg: '#e6f4ea', color: '#34a853', text: 'Passed' },
      failed: { bg: '#fce8e6', color: '#ea4335', text: 'Failed' },
      draft: { bg: '#fff9e6', color: '#fbbc04', text: 'Draft' }
    };
    
    const status = statusColors[workflowStatus] || statusColors.draft;
    
    return (
      <Box 
        component="span" 
        sx={{ 
          px: 1.5, 
          py: 0.5, 
          borderRadius: 1, 
          bgcolor: status.bg, 
          color: status.color,
          fontSize: '0.875rem',
          ml: 2
        }}
      >
        {status.text}
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'white', 
        borderBottom: 1, 
        borderColor: 'divider', 
        px: 3, 
        py: 1.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Button 
          variant="text" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/workflows')}
          sx={{ textTransform: 'none' }}
        >
          Go Back
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">
            {workflowName || 'Untitled'}
          </Typography>
          <StatusLabel />
        </Box>
        
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => setShowSaveDialog(true)}
          sx={{ textTransform: 'none' }}
        >
          Save
        </Button>
      </Box>

      {/* Main Canvas */}
      <Box 
        ref={containerRef}
        className="process-editor-bg"
        sx={{ 
          flex: 1, 
          position: 'relative', 
          overflow: 'auto',
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease',
          bgcolor: '#f7f7e9'
        }}
        onClick={() => {
          setShowActionMenu(false);
          setCurrentPosition(null);
        }}
      >
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        
        {elements.map(node => (
          <FlowNode 
            key={node.id} 
            node={node}
            onUpdate={handleNodeUpdate}
            onDelete={handleNodeDelete}
            onConnect={handleConnect}
            onClick={handleNodeClick}
            isConnecting={isConnecting}
            setIsConnecting={setIsConnecting}
            startNode={connectionStartNode}
            onAddElementClick={handleAddElementFromButton}
          />
        ))}
        
        {isConnecting && (
          <Paper 
            elevation={3} 
            sx={{ 
              position: 'fixed', 
              bottom: 16, 
              right: 16, 
              p: 2, 
              borderRadius: 2,
              zIndex: 100
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              Select another node to connect to
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              fullWidth
              onClick={() => {
                setIsConnecting(false);
                setConnectionStartNode(null);
              }}
            >
              Cancel
            </Button>
          </Paper>
        )}

        {/* Element Type Menu (when + is clicked) */}
        {showActionMenu && currentPosition && (
          <Paper 
            elevation={3} 
            sx={{ 
              position: 'absolute',
              left: `${currentPosition.x}px`,
              top: `${currentPosition.y}px`,
              width: 180,
              zIndex: 20,
              borderRadius: 2,
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button 
              fullWidth
              variant="text" 
              startIcon={<ApiIcon />}
              onClick={() => handleAddElement('api')}
              sx={{ 
                textAlign: 'left', 
                justifyContent: 'flex-start', 
                textTransform: 'none',
                p: 1.5
              }}
            >
              API Call
            </Button>
            <Button 
              fullWidth
              variant="text"
              startIcon={<EmailIcon />}
              onClick={() => handleAddElement('email')}
              sx={{ 
                textAlign: 'left', 
                justifyContent: 'flex-start', 
                textTransform: 'none',
                p: 1.5
              }}
            >
              Email
            </Button>
            <Button 
              fullWidth
              variant="text"
              startIcon={<TextIcon />}
              onClick={() => handleAddElement('text')}
              sx={{ 
                textAlign: 'left', 
                justifyContent: 'flex-start', 
                textTransform: 'none',
                p: 1.5
              }}
            >
              Text Box
            </Button>
          </Paper>
        )}
        
        {/* Undo/Redo buttons */}
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            left: 16, 
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ display: 'flex' }}>
            <Tooltip title="Undo">
              <IconButton
                onClick={() => {
                  toast({
                    title: "Undo",
                    description: "Undo functionality would go here"
                  });
                }}
              >
                <UndoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Redo">
              <IconButton
                onClick={() => {
                  toast({
                    title: "Redo",
                    description: "Redo functionality would go here"
                  });
                }}
              >
                <RedoIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
        
        {/* Zoom controls */}
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16, 
            borderRadius: 28,
            display: 'flex',
            alignItems: 'center',
            px: 1.5,
            py: 0.5
          }}
        >
          <IconButton size="small" onClick={handleZoomReset}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: 'primary.main'
              }}
            />
          </IconButton>
          <IconButton size="small" onClick={handleZoomOut}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          <Slider
            value={zoomLevel}
            min={50}
            max={200}
            onChange={(_, value) => setZoomLevel(value)}
            sx={{ 
              width: 100,
              mx: 1,
              '& .MuiSlider-track': {
                height: 4
              },
              '& .MuiSlider-rail': {
                height: 4
              }
            }}
          />
          <IconButton size="small" onClick={handleZoomIn}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Paper>
      </Box>

      {/* Configuration Dialog */}
      <Dialog 
        open={showConfigDialog} 
        onClose={() => setShowConfigDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentElement?.type === 'api' ? 'API Call Configuration' : 
           currentElement?.type === 'email' ? 'Email Configuration' : 
           currentElement?.type === 'text' ? 'Text Box Configuration' : 
           'Element Configuration'}
        </DialogTitle>
        {renderConfigFields()}
        <DialogActions>
          <Button onClick={() => setShowConfigDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfigSave} variant="contained">
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Node Configuration Drawer */}
      <Drawer 
        anchor="right" 
        open={showNodeConfig} 
        onClose={() => setShowNodeConfig(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: {
              xs: '90%',
              sm: 400
            }
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {selectedNode?.type === 'api' ? 'API Call Configuration' : 
            selectedNode?.type === 'email' ? 'Email Configuration' : 
            selectedNode?.type === 'text' ? 'Text Box Configuration' : 
            'Element Configuration'}
          </Typography>
          
          {renderConfigFields()}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button variant="outlined" onClick={() => setShowNodeConfig(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleConfigSave}>
              Save Configuration
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Save Dialog */}
      <Dialog 
        open={showSaveDialog} 
        onClose={() => setShowSaveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Workflow</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter a name and description for your workflow.
          </DialogContentText>
          <TextField
            fullWidth
            label="Workflow Name"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            margin="normal"
            variant="outlined"
            placeholder="Enter workflow name"
          />
          <TextField
            fullWidth
            label="Description"
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            margin="normal"
            variant="outlined"
            multiline
            rows={4}
            placeholder="Describe what this workflow does"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            Save Workflow
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcessEditor;
