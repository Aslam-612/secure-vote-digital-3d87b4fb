import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin = () => {
  const { t } = useI18n();
  const { adminSignIn } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Enter username and password');
      return;
    }
    setLoading(true);
    try {
      const result = await adminSignIn(username, password);
      if (result.status === 'SUCCESS') {
        toast.success('Admin login successful!');
        navigate('/admin');
      } else {
        toast.error(result.message || 'Invalid credentials');
      }
    } catch (e) {
      toast.error('Could not connect to server. Make sure backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-muted/30 px-4 py-16">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Settings className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">{t.adminLogin}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Username
              </label>
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                maxLength={50}
                placeholder="admin"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                maxLength={100}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : <>{t.login} <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Credentials: admin / Admin@123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;