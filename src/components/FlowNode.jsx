
import React, { useState } from 'react';
import { Trash2, Link, Maximize2, Minimize2, Settings } from "lucide-react";

const FlowNode = ({ 
  node, 
  onUpdate, 
  onDelete, 
  onConnect, 
  onClick, 
  isConnecting, 
  setIsConnecting, 
  startNode,
  onAddElementClick
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(node.position);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(true);

  // Determine if this node is the current connection start
  const isStartNode = startNode === node.id;
  
  // Get node appearance based on type
  const getNodeAppearance = () => {
    switch(node.type) {
      case 'start':
        return {
          background: '#8BC34A',
          textColor: 'white',
          width: '100px',
          height: '100px',
          borderRadius: '50px',
          border: 'none'
        };
      case 'end':
        return {
          background: '#EA384C',
          textColor: 'white',
          width: '100px',
          height: '100px',
          borderRadius: '50px',
          border: 'none'
        };
      case 'api':
        return {
          background: '#FFFFFF',
          textColor: '#333',
          width: '220px',
          border: '1px solid #ddd'
        };
      case 'email':
        return {
          background: '#FFFFFF',
          textColor: '#333',
          width: '220px',
          border: '1px solid #ddd'
        };
      case 'text':
        return {
          background: '#FFFFFF',
          textColor: '#333',
          width: '220px',
          border: '1px solid #ddd'
        };
      default:
        return {
          background: 'white',
          textColor: '#333',
          width: '180px',
          border: '1px solid #ddd'
        };
    }
  };

  const handleMouseDown = (e) => {
    // Prevent starting drag if clicking on buttons
    if (
      e.target.tagName === 'BUTTON' || 
      e.target.closest('button') || 
      e.target.tagName === 'svg' || 
      e.target.tagName === 'path'
    ) {
      return;
    }
    
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newPos = {
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      };
      
      // Boundary check could be added here
      
      setPosition(newPos);
      
      // Update the node position in parent component
      onUpdate({
        ...node,
        position: newPos
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleConnect = (e) => {
    e.stopPropagation();
    onConnect(node.id);
  };

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Add mouse event listeners for drag functionality
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Update local position when node prop changes
  React.useEffect(() => {
    setPosition(node.position);
  }, [node.position]);

  const appearance = getNodeAppearance();

  const isCircularNode = node.type === 'start' || node.type === 'end';

  // Show the + button directly below Start node
  const showAddButton = node.type === 'start';
  
  // Handler for node clicking - don't allow clicking on start/end nodes
  const handleNodeClick = () => {
    if (!isCircularNode && onClick) {
      onClick(node);
    }
  };
  
  return (
    <>
      <div
        className="absolute rounded-md shadow-md flex flex-col cursor-grab transition-all duration-150"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          background: appearance.background,
          color: appearance.textColor,
          width: appearance.width,
          height: isCircularNode ? appearance.height : 'auto',
          zIndex: isDragging ? 10 : 1,
          borderRadius: isCircularNode ? appearance.borderRadius : '8px',
          padding: isCircularNode ? 0 : '16px',
          border: appearance.border,
          alignItems: isCircularNode ? 'center' : 'flex-start',
          justifyContent: isCircularNode ? 'center' : 'flex-start'
        }}
        onMouseDown={handleMouseDown}
        onClick={handleNodeClick}
      >
        {isCircularNode ? (
          <div className="font-medium text-lg">{node.data.label}</div>
        ) : (
          <>
            <div className="flex justify-between items-center w-full">
              <h3 className="font-medium">{node.data.label}</h3>
              
              <div className="flex gap-1">
                <button
                  onClick={toggleExpand}
                  className="p-1 rounded-full hover:bg-gray-100"
                  title={isExpanded ? "Minimize" : "Maximize"}
                >
                  {isExpanded ? <Minimize2 size={16} color="#666" /> : <Maximize2 size={16} color="#666" />}
                </button>
                
                {!isCircularNode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick && onClick(node);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100"
                    title="Configure"
                  >
                    <Settings size={16} color="#666" />
                  </button>
                )}
                
                {!isCircularNode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(node.id);
                    }}
                    className="p-1 rounded-full hover:bg-red-100"
                    title="Delete node"
                  >
                    <Trash2 size={16} color="#EA384C" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Additional node content based on type and expanded state */}
            {isExpanded && (
              <div className="mt-2 text-sm">
                {node.type === 'api' && (
                  <div className="text-xs">
                    <div className="font-medium">{node.data.method || 'GET'}</div>
                    <div className="truncate text-gray-600">{node.data.url || 'No URL configured'}</div>
                  </div>
                )}
                
                {node.type === 'email' && (
                  <div className="text-xs">
                    <div className="truncate">Email: <span className="text-gray-600">{node.data.to || 'No recipient'}</span></div>
                  </div>
                )}
                
                {node.type === 'text' && (
                  <div className="text-xs truncate text-gray-600">
                    {node.data.content ? node.data.content.substring(0, 50) + '...' : 'No content'}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        
        {/* Connection visual indicator */}
        {isConnecting && !isStartNode && (
          <div 
            className="absolute inset-0 border-2 border-blue-400 rounded-md pointer-events-none"
            style={{ 
              zIndex: 5,
              borderRadius: isCircularNode ? appearance.borderRadius : '8px'
            }}
          />
        )}
      </div>

      {/* Add + button directly below start node */}
      {showAddButton && (
        <button
          className="absolute z-10 h-8 w-8 bg-white hover:bg-gray-100 text-black rounded-full flex items-center justify-center shadow-md border border-gray-200"
          style={{
            left: `${position.x + parseInt(appearance.width, 10) / 2 - 16}px`,
            top: `${position.y + parseInt(appearance.height, 10) + 10}px`
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onAddElementClick) {
              onAddElementClick(position.x, position.y + parseInt(appearance.height, 10) + 60);
            }
          }}
        >
          +
        </button>
      )}
    </>
  );
};

export default FlowNode;
