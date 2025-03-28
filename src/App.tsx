
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import WorkflowList from "./pages/WorkflowList";
import ProcessEditor from "./pages/ProcessEditor";
import NotFound from "./pages/NotFound";
import { WorkflowProvider } from "./context/WorkflowContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    primary: {
      main: '#8BC34A', // green from the start node
    },
    secondary: {
      main: '#EA384C', // red from the end node
    },
    error: {
      main: '#EA384C',
    },
    background: {
      default: '#F8F3E6', // beige background from process editor
    },
  },
  typography: {
    fontFamily: 'poppins',
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <WorkflowProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/workflows" element={<WorkflowList />} />
                <Route path="/process/:id" element={<ProcessEditor />} />
                <Route path="/process/new" element={<ProcessEditor />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </WorkflowProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
