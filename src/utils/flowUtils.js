
// Helper functions for the flow diagram

// Draw a curved line between two points
export const drawConnection = (startX, startY, endX, endY, ctx) => {
  // Calculate control points for a curved line
  const controlPointX1 = startX;
  const controlPointY1 = startY + (endY - startY) / 2;
  const controlPointX2 = endX;
  const controlPointY2 = startY + (endY - startY) / 2;

  // Draw the path
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.bezierCurveTo(
    controlPointX1, controlPointY1,
    controlPointX2, controlPointY2,
    endX, endY
  );
  ctx.stroke();
  
  // Draw the arrow head
  drawArrowhead(endX, endY, ctx);
};

// Draw arrowhead at the end of a connection
export const drawArrowhead = (x, y, ctx) => {
  const arrowSize = 8;
  
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - arrowSize, y - arrowSize);
  ctx.lineTo(x - arrowSize, y + arrowSize);
  ctx.closePath();
  ctx.fill();
};

// Get connection point coordinates for a node
export const getConnectionPoints = (node) => {
  const sourceX = node.position.x + 90; // center of the node (assuming width is 180px)
  const sourceY = node.position.y + 80; // bottom of the node (assuming height is ~80px)
  
  return { x: sourceX, y: sourceY };
};

// Generate a unique ID for new nodes and connections
export const generateId = (prefix = 'node') => {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create a new workflow element
export const createNewElement = (type, x, y) => {
  const element = {
    id: generateId(type),
    type,
    position: { x, y },
    data: { label: capitalizeFirstLetter(type) }
  };
  
  // Add specific properties based on type
  switch(type) {
    case 'api':
      element.data.method = 'GET';
      element.data.url = '';
      element.data.headers = '';
      element.data.body = '';
      break;
    case 'email':
      element.data.to = '';
      element.data.subject = '';
      element.data.message = '';
      break;
    case 'text':
      element.data.content = '';
      break;
    default:
      break;
  }
  
  return element;
};

// Helper to capitalize first letter
export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Check if a workflow is valid (has at least start, end and one element between them)
export const isWorkflowValid = (elements, connections) => {
  // Check if we have start and end nodes
  const hasStart = elements.some(el => el.type === 'start');
  const hasEnd = elements.some(el => el.type === 'end');
  
  // Check if we have at least one element that's not start or end
  const hasMiddleElement = elements.some(el => el.type !== 'start' && el.type !== 'end');
  
  // Check if we have at least two connections (start→something and something→end)
  const hasEnoughConnections = connections.length >= 2;
  
  return hasStart && hasEnd && hasMiddleElement && hasEnoughConnections;
};
