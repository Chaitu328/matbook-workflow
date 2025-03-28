
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/workflows");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Highbridge</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your complete workflow automation platform that streamlines processes and boosts productivity.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Workflow Management</CardTitle>
            <CardDescription>Create, edit and manage your workflow processes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Easily create API workflows, automate emails, and set up complex business logic with our visual editor.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/login")} className="w-full">Get Started</Button>
          </CardFooter>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>API Integration</CardTitle>
            <CardDescription>Connect to any service with powerful API tools</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Configure API calls with ease, connect to third-party services, and automate your business processes.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/login")} variant="outline" className="w-full">Learn More</Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <Button onClick={() => navigate("/login")} size="lg">
          Log in to your account
        </Button>
      </div>
    </div>
  );
};

export default Index;
