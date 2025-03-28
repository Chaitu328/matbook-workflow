
import React, { createContext, useState, useEffect, useContext } from 'react';

// Create context
const WorkflowContext = createContext(null);

export const WorkflowProvider = ({ children }) => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load workflows from localStorage
    const savedWorkflows = localStorage.getItem('workflows');
    if (savedWorkflows) {
      try {
        const parsedWorkflows = JSON.parse(savedWorkflows);
        setWorkflows(parsedWorkflows);
        console.log('Loaded workflows from localStorage:', parsedWorkflows);
      } catch (error) {
        console.error('Error parsing workflows from localStorage:', error);
        setDefaultWorkflows();
      }
    } else {
      setDefaultWorkflows();
    }
    setLoading(false);
  }, []);

  const setDefaultWorkflows = () => {
    // Set some example workflows if none exist
    const exampleWorkflows = [
      {
        id: '1',
        name: 'Customer Onboarding',
        description: 'Process for new customer registration and setup',
        lastEdited: { author: 'John Doe', time: '14:30 IST 12/05', timestamp: Date.now() },
        tags: ['customer', 'onboarding'],
        status: 'passed',
        elements: [
          { id: 'start', type: 'start', position: { x: 100, y: 100 }, data: { label: 'Start' } },
          { id: 'api1', type: 'api', position: { x: 100, y: 200 }, data: { label: 'Verify Email', method: 'GET', url: 'https://api.example.com/verify' } },
          { id: 'email1', type: 'email', position: { x: 100, y: 300 }, data: { label: 'Welcome Email', to: 'customer@example.com' } },
          { id: 'end', type: 'end', position: { x: 100, y: 400 }, data: { label: 'End' } },
        ],
        connections: [
          { id: 'conn1', source: 'start', target: 'api1' },
          { id: 'conn2', source: 'api1', target: 'email1' },
          { id: 'conn3', source: 'email1', target: 'end' },
        ]
      },
      {
        id: '2',
        name: 'Order Processing',
        description: 'Automate the order fulfillment process',
        lastEdited: { author: 'Jane Smith', time: '09:45 IST 11/05', timestamp: Date.now() - 86400000 },
        tags: ['order', 'fulfillment'],
        status: 'failed',
        elements: [
          { id: 'start', type: 'start', position: { x: 100, y: 100 }, data: { label: 'Start' } },
          { id: 'api1', type: 'api', position: { x: 100, y: 200 }, data: { label: 'Check Inventory', method: 'GET', url: 'https://api.example.com/inventory' } },
          { id: 'end', type: 'end', position: { x: 100, y: 300 }, data: { label: 'End' } },
        ],
        connections: [
          { id: 'conn1', source: 'start', target: 'api1' },
          { id: 'conn2', source: 'api1', target: 'end' },
        ]
      }
    ];
    setWorkflows(exampleWorkflows);
    localStorage.setItem('workflows', JSON.stringify(exampleWorkflows));
    console.log('Set default workflows:', exampleWorkflows);
  };

  // Save workflows to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('workflows', JSON.stringify(workflows));
      console.log('Saved workflows to localStorage:', workflows);
    }
  }, [workflows, loading]);

  // Add a new workflow
  const addWorkflow = (workflow) => {
    const newWorkflow = {
      ...workflow,
      id: Date.now().toString(),
      lastEdited: { 
        author: JSON.parse(localStorage.getItem('user'))?.name || 'Unknown User', 
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + 
              ' IST ' + new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }),
        timestamp: Date.now()
      },
    };
    setWorkflows([...workflows, newWorkflow]);
    console.log('Added new workflow:', newWorkflow);
  };

  // Update an existing workflow
  const updateWorkflow = (id, updatedWorkflow) => {
    const updatedWorkflows = workflows.map(workflow => 
      workflow.id === id ? {
        ...updatedWorkflow,
        lastEdited: { 
          author: JSON.parse(localStorage.getItem('user'))?.name || 'Unknown User', 
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + 
                ' IST ' + new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }),
          timestamp: Date.now()
        }
      } : workflow
    );
    setWorkflows(updatedWorkflows);
    console.log('Updated workflow:', id, updatedWorkflow);
  };

  // Delete a workflow
  const deleteWorkflow = (id) => {
    const workflowToDelete = workflows.find(w => w.id === id);
    const filteredWorkflows = workflows.filter(workflow => workflow.id !== id);
    setWorkflows(filteredWorkflows);
    console.log('Deleted workflow:', id, workflowToDelete?.name);
  };

  // Get a workflow by ID
  const getWorkflow = (id) => {
    const workflow = workflows.find(workflow => workflow.id === id) || null;
    console.log('Retrieved workflow by ID:', id, workflow?.name);
    return workflow;
  };

  // Execute a workflow (simulate the process)
  const executeWorkflow = (id) => {
    // This is a simple simulation. In a real app, this would trigger actual API calls and emails
    const updatedWorkflows = workflows.map(workflow => {
      if (workflow.id === id) {
        // Randomly determine if workflow passes or fails
        const status = Math.random() > 0.3 ? 'passed' : 'failed';
        console.log(`Executed workflow ${id}: ${workflow.name}, status: ${status}`);
        return { ...workflow, status };
      }
      return workflow;
    });
    setWorkflows(updatedWorkflows);
    return updatedWorkflows.find(w => w.id === id).status;
  };

  return (
    <WorkflowContext.Provider value={{ 
      workflows, 
      addWorkflow, 
      updateWorkflow, 
      deleteWorkflow, 
      getWorkflow,
      executeWorkflow,
      loading 
    }}>
      {children}
    </WorkflowContext.Provider>
  );
};

// Custom hook to use workflow context
export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};
