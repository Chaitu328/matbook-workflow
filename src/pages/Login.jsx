
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  Container, 
  Paper, 
  Grid,
  Divider,
  IconButton
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import AppleIcon from '@mui/icons-material/Apple';
import Image1 from '../images/login_1.png'
import Image2 from '../images/login_2.png'
import logo from '../images/logo.png'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    if (user) {
      navigate('/workflows');
    }

    // Check if there's a remembered user
    const remembered = localStorage.getItem('rememberMe');
    if (remembered) {
      setRememberMe(true);
      setEmail(localStorage.getItem('email') || '');
      setPassword(localStorage.getItem('password') || '');
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Simple validation
      if (!email || !password) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      // Simple login (in a real app, you would authenticate with a server)
      login({ email, name: email.split('@')[0], password }, rememberMe);
      toast({
        title: "Success",
        description: "You've been logged in successfully!",
      });
      navigate('/workflows');
    } else {
      // Simple validation
      if (!email || !password || !name) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      // Simple registration (in a real app, you would register with a server)
      register({ email, name, password });
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      navigate('/workflows');
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email first",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password reset initiated",
      description: "Check your email for instructions",
    });
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        backgroundImage: `url(${Image1}), url(${Image2})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Left Side with Branding */}
      <Box 
        sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 5,
          width: '50%',
          color: 'white',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <img 
            src={logo} 
            alt="HighBridge Logo" 
            style={{ width: '60px', height: 'auto', marginRight: '10px' }} 
          />
          <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold' }}>
            HighBridge
          </Typography>
        </Box>
        <Typography variant="h3" sx={{ mb: 4 }}>
          Building the Future...
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: '600px' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Typography>
      </Box>

      {/* Right Side with Login Form */}
      <Box 
        sx={{ 
          width: { xs: '100%', md: '50%' }, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: 2
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            width: '100%', 
            maxWidth: '450px', 
            padding: 4, 
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
            WELCOME BACK!
          </Typography>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
            Log In to your Account
          </Typography>
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <TextField
                fullWidth
                margin="normal"
                id="name"
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type here..."
                sx={{ mb: 2 }}
              />
            )}
            
            <TextField
              fullWidth
              margin="normal"
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Type here..."
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Password</Typography>
              {isLogin && (
                <Button 
                  variant="text" 
                  color="primary" 
                  size="small" 
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </Button>
              )}
            </Box>
            
            <TextField
              fullWidth
              margin="normal"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type here..."
              sx={{ mb: 2 }}
            />
            
            {isLogin && (
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label="Remember me"
                sx={{ mb: 2 }}
              />
            )}
            
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              color="error"
              sx={{ 
                py: 1.5, 
                mb: 2,
                backgroundColor: '#EA384C',
                '&:hover': {
                  backgroundColor: '#d42e41',
                }
              }}
            >
              Log In
            </Button>
            
            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <Divider sx={{ flexGrow: 1 }} />
              <Typography variant="body2" sx={{ mx: 2, color: 'text.secondary' }}>
                Or
              </Typography>
              <Divider sx={{ flexGrow: 1 }} />
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  sx={{ 
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1
                  }}
                >
                  <Box sx={{ ml: 7 }}>Log In with Google</Box>
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FacebookIcon />}
                  sx={{ 
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1
                  }}
                >
                  <Box sx={{ ml: 7 }}>Log In with Facebook</Box>
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AppleIcon />}
                  sx={{ 
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1
                  }}
                >
                  <Box sx={{ ml: 7 }}>Log In with Apple</Box>
                </Button>
              </Grid>
            </Grid>
            
            <Typography variant="body2" align="center">
              New User? <Button 
                variant="text" 
                onClick={() => setIsLogin(!isLogin)}
                sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}
              >
                SIGN UP HERE
              </Button>
            </Typography>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
