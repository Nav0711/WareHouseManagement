import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Package, Lock, Mail, Building, User, Activity, ArrowLeft } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regRole, setRegRole] = useState('');
  const [regFocus, setRegFocus] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        const meResp = await fetch('http://localhost:8000/api/v1/auth/me', {
          headers: { 'Authorization': `Bearer ${data.access_token}` },
        });
        const user = await meResp.json();
        
        login(data.access_token, user);
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        navigate('/');
      } else {
        const err = await response.json();
        toast({
          title: "Login failed",
          description: err.detail || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Could not connect to the server.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          full_name: regName,
          company_name: regCompany,
          role_type: regRole,
          inventory_focus: regFocus
        }),
      });

      if (response.ok) {
        // Auto login after reg
        const loginResp = await fetch('http://localhost:8000/api/v1/auth/login-json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: regEmail, password: regPassword }),
        });
        const data = await loginResp.json();
        const user = await response.json();
        login(data.access_token, user);

        toast({
          title: "Registration successful!",
          description: "Glad to have you onboard.",
        });
        navigate('/');
      } else {
        const err = await response.json();
        toast({
          title: "Registration failed",
          description: err.detail || "Error creating account",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Could not connect to the server.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-primary rounded-xl shadow-glow">
            <Package className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-foreground tracking-tight">
          Warehouse Management
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Secure, modern, and intelligent logistics.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="glass border-none shadow-xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-t-lg rounded-b-none p-0 h-14 bg-muted/50">
              <TabsTrigger value="login" className="rounded-tl-lg h-full data-[state=active]:bg-card data-[state=active]:text-primary transition-all">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="rounded-tr-lg h-full data-[state=active]:bg-card data-[state=active]:text-accent transition-all">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="p-0 m-0">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="you@example.com" className="pl-10" required 
                             value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type="password" placeholder="••••••••" className="pl-10" required 
                             value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full h-11" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="register" className="p-0 m-0">
              <form onSubmit={handleRegister}>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>Tell us a bit about yourself to get started.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="reg-name" placeholder="John Doe" className="pl-10" required
                             value={regName} onChange={(e) => setRegName(e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="reg-email" type="email" placeholder="john@example.com" className="pl-10" required
                             value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="reg-password" type="password" placeholder="••••••••" className="pl-10" required
                             value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <h3 className="text-sm font-semibold mb-3">Onboarding Questionnaire</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input id="company" placeholder="Acme Logistics" className="pl-10"
                                 value={regCompany} onChange={(e) => setRegCompany(e.target.value)} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Your Role</Label>
                        <Select onValueChange={setRegRole} value={regRole}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Warehouse Manager</SelectItem>
                            <SelectItem value="operator">Logistics Operator</SelectItem>
                            <SelectItem value="admin">System Admin</SelectItem>
                            <SelectItem value="executive">Executive / Owner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Primary Inventory Focus</Label>
                        <Select onValueChange={setRegFocus} value={regFocus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select primary goods" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="electronics">Electronics</SelectItem>
                            <SelectItem value="perishables">Food & Perishables</SelectItem>
                            <SelectItem value="apparel">Apparel & Fashion</SelectItem>
                            <SelectItem value="industrial">Industrial Equipment</SelectItem>
                            <SelectItem value="mixed">Mixed/General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border mt-2">
                  <Button type="submit" className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Complete Registration"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
