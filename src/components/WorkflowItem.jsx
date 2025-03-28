
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWorkflow } from '@/context/WorkflowContext';
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, MoreVertical, Check, X, Play, Edit, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const WorkflowItem = ({ workflow }) => {
  const navigate = useNavigate();
  const { executeWorkflow, deleteWorkflow } = useWorkflow();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExecuteDialog, setShowExecuteDialog] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExecute = () => {
    const result = executeWorkflow(workflow.id);
    setShowExecuteDialog(false);
    
    toast({
      title: result === 'passed' ? "Process Executed Successfully" : "Process Execution Failed",
      description: result === 'passed' 
        ? `Process '${workflow.name}' completed with success` 
        : `Process '${workflow.name}' failed during execution`,
      variant: result === 'passed' ? "default" : "destructive",
    });
  };

  const handleDelete = () => {
    deleteWorkflow(workflow.id);
    setShowDeleteDialog(false);
    
    toast({
      title: "Process Deleted",
      description: `Process '${workflow.name}' has been deleted`,
    });
  };

  const handleEdit = () => {
    navigate(`/process/${workflow.id}`);
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{workflow.name}</CardTitle>
            <CardDescription className="mt-1">ID: {workflow.id}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowExecuteDialog(true)} size="sm" variant="outline" className="flex items-center gap-1">
              <Play className="h-4 w-4" />
              Execute
            </Button>
            <Button onClick={handleEdit} size="sm" variant="outline" className="flex items-center gap-1">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-md bg-white shadow-lg z-50 border">
                  <Button
                    variant="ghost"
                    className="flex w-full items-center justify-start px-3 py-2 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setShowDropdown(false);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-gray-500 mb-2">
          Last edited by: {workflow.lastEdited.author} | {workflow.lastEdited.time}
        </div>
        <p className="text-sm mb-3">{workflow.description}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {workflow.tags.map((tag, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="block pt-0">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full flex items-center justify-center">
              Details
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="p-3 rounded bg-gray-50">
              <div className="flex items-center mb-3">
                <span className="font-medium mr-2">Status:</span>
                {workflow.status === 'passed' ? (
                  <span className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    Passed
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <X className="h-4 w-4 mr-1" />
                    Failed
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm"><span className="font-medium">Elements:</span> {workflow.elements.length}</p>
                <p className="text-sm"><span className="font-medium">Steps:</span> {workflow.connections.length}</p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardFooter>

      {/* Execute Confirmation Dialog */}
      <Dialog open={showExecuteDialog} onOpenChange={setShowExecuteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Execute Process</DialogTitle>
            <DialogDescription>
              Are you sure you want to execute process '{workflow.name}'?
              <p className="text-red-500 mt-2">You cannot undo this step.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExecuteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExecute}>
              Execute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Process</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete process '{workflow.name}'?
              <p className="text-red-500 mt-2">You cannot undo this step.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WorkflowItem;
