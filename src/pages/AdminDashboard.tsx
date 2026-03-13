import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Vote, TrendingUp, Activity, LogOut, Plus, Upload, Download, FileText, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { getDashboard, getVoters, getAdminElections, getAdminCandidates, getResults } from '@/lib/api';

const CHART_COLORS = ['hsl(168, 100%, 39%)', 'hsl(224, 71%, 17%)', 'hsl(40, 95%, 55%)', 'hsl(0, 84%, 60%)', 'hsl(210, 100%, 52%)'];

const AdminDashboard = () => {
  const { t } = useI18n();
  const { token, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const [stats, setStats] = useState<any>({ totalVoters: 0, votesCast: 0, voterTurnout: 0, activeElections: 0 });
  const [elections, setElections] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [voters, setVoters] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !isAdmin) {
      navigate('/admin-login');
      return;
    }
    loadAllData();
  }, [token, isAdmin]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dashData, votersData, electionsData, candidatesData] = await Promise.all([
        getDashboard(token!),
        getVoters(token!),
        getAdminElections(token!),
        getAdminCandidates(token!),
      ]);
      setStats(dashData);
      setVoters(votersData);
      setElections(electionsData);
      setCandidates(candidatesData);

      // Load results for each election
      if (electionsData.length > 0) {
        const resultsData = await Promise.all(
          electionsData.map((e: any) => getResults(e.id, token!))
        );
        setResults(resultsData.flat());
      }
    } catch (e) {
      toast.error('Could not load dashboard data.');
    }
    setLoading(false);
  };

  const statCards = [
    { icon: Users, label: 'Total Registered Voters', value: stats.totalVoters, color: 'text-secondary' },
    { icon: Vote, label: 'Votes Cast', value: stats.votesCast, color: 'text-info' },
    { icon: TrendingUp, label: 'Voter Turnout', value: `${stats.voterTurnout || 0}%`, color: 'text-accent' },
    { icon: Activity, label: 'Active Elections', value: stats.activeElections, color: 'text-success' },
  ];

  // Chart data from first election candidates
  const firstElection = elections[0];
  const firstElectionCandidates = firstElection
    ? candidates.filter((c: any) => c.electionId === firstElection.id)
    : [];
  const barData = firstElectionCandidates.map((c: any) => ({ name: c.name, votes: c.voteCount }));
  const pieData = firstElectionCandidates.map((c: any) => ({ name: c.name, value: c.voteCount }));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-card shadow-sm">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }}>
            <LogOut className="mr-2 h-4 w-4" />Logout
          </Button>
        </div>
      </div>

      <div className="container px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="elections">Manage Elections</TabsTrigger>
            <TabsTrigger value="candidates">Manage Candidates</TabsTrigger>
            <TabsTrigger value="voters">Manage Voters</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {statCards.map((s, i) => (
                <Card key={i} className="border-none shadow-md">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <s.icon className={`h-6 w-6 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">
                    Vote Distribution — {firstElection?.title || 'No Elections'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="votes" radius={[6,6,0,0]}>
                        {barData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader><CardTitle className="text-base">Vote Share</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                        {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Elections */}
          <TabsContent value="elections">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Manage Elections</h2>
              <Button size="sm" className="bg-secondary text-secondary-foreground"
                onClick={() => toast.info('Add election feature coming soon')}>
                <Plus className="mr-2 h-4 w-4" />Create Election
              </Button>
            </div>
            <Card className="border-none shadow-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {elections.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.title}</TableCell>
                      <TableCell className="capitalize">{e.type}</TableCell>
                      <TableCell>
                        <Badge className={e.status === 'ACTIVE' ? 'bg-secondary text-secondary-foreground' : ''}>
                          {e.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive">Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Candidates */}
          <TabsContent value="candidates">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Manage Candidates</h2>
              <Button size="sm" className="bg-secondary text-secondary-foreground"
                onClick={() => toast.info('Add candidate feature coming soon')}>
                <Plus className="mr-2 h-4 w-4" />Add Candidate
              </Button>
            </div>
            <Card className="border-none shadow-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Election</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((c: any) => {
                    const el = elections.find((e: any) => e.id === c.electionId);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{c.groupName}</TableCell>
                        <TableCell className="text-sm">{el ? el.title : '-'}</TableCell>
                        <TableCell>{c.voteCount}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Voters */}
          <TabsContent value="voters">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Manage Voters</h2>
              <Button size="sm" variant="outline"
                onClick={() => toast.info('CSV upload coming soon')}>
                <Upload className="mr-2 h-4 w-4" />Upload CSV
              </Button>
            </div>
            <Card className="border-none shadow-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Voter ID</TableHead>
                    <TableHead>Voted</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voters.map((v: any) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.name}</TableCell>
                      <TableCell className="font-mono">{v.mobile}</TableCell>
                      <TableCell>{v.voterIdNumber}</TableCell>
                      <TableCell>
                        {v.hasVoted
                          ? <Badge className="bg-secondary text-secondary-foreground">Yes</Badge>
                          : <Badge variant="outline">No</Badge>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(v.registeredAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Results */}
          <TabsContent value="results">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Results</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.info('Export PDF coming soon')}>
                  <FileText className="mr-2 h-4 w-4" />Export PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.info('Export CSV coming soon')}>
                  <Download className="mr-2 h-4 w-4" />Export CSV
                </Button>
              </div>
            </div>
            {elections.map((e: any) => {
              const eCandidates = candidates.filter((c: any) => c.electionId === e.id);
              return (
                <Card key={e.id} className="mb-6 border-none shadow-md">
                  <CardHeader><CardTitle>{e.title}</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={eCandidates.map((c: any) => ({ name: c.name, votes: c.voteCount }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="votes" radius={[6,6,0,0]}>
                          {eCandidates.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;