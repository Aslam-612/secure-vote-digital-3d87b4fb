import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { elections, candidates, voters, auditLogs } from '@/data/mockData';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Vote, TrendingUp, Activity, LogOut, Plus, Upload, Download, FileText, Shield } from 'lucide-react';
import { toast } from 'sonner';

const CHART_COLORS = ['hsl(168, 100%, 39%)', 'hsl(224, 71%, 17%)', 'hsl(40, 95%, 55%)', 'hsl(0, 84%, 60%)', 'hsl(210, 100%, 52%)'];

const AdminDashboard = () => {
  const { t, lang } = useI18n();
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated || role !== 'admin') {
    navigate('/admin-login');
    return null;
  }

  const totalVoters = voters.length;
  const totalVotes = voters.filter(v => v.hasVoted).length;
  const turnout = totalVoters > 0 ? Math.round((totalVotes / totalVoters) * 100) : 0;
  const activeElectionCount = elections.filter(e => e.status === 'active').length;

  const e1Candidates = candidates.filter(c => c.electionId === 'e1');
  const barData = e1Candidates.map(c => ({ name: lang === 'ta' ? c.nameTa : c.name, votes: c.votes }));
  const pieData = e1Candidates.map(c => ({ name: lang === 'ta' ? c.nameTa : c.name, value: c.votes }));

  const stats = [
    { icon: Users, label: t.totalVoters, value: totalVoters, color: 'text-secondary' },
    { icon: Vote, label: t.votesCast, value: totalVotes, color: 'text-info' },
    { icon: TrendingUp, label: t.voterTurnout, value: `${turnout}%`, color: 'text-accent' },
    { icon: Activity, label: t.activeElections, value: activeElectionCount, color: 'text-success' },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Admin {t.dashboard}</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }}>
            <LogOut className="mr-2 h-4 w-4" />{t.logout}
          </Button>
        </div>
      </div>

      <div className="container px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard">{t.dashboard}</TabsTrigger>
            <TabsTrigger value="elections">{t.manageElections}</TabsTrigger>
            <TabsTrigger value="candidates">{t.manageCandidates}</TabsTrigger>
            <TabsTrigger value="voters">{t.manageVoters}</TabsTrigger>
            <TabsTrigger value="results">{t.results}</TabsTrigger>
            <TabsTrigger value="logs">{t.systemLogs}</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {stats.map((s, i) => (
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
                <CardHeader><CardTitle className="text-base">Vote Distribution — CSE CR Election</CardTitle></CardHeader>
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
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
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
              <h2 className="text-xl font-bold text-foreground">{t.manageElections}</h2>
              <Button size="sm" className="bg-secondary text-secondary-foreground" onClick={() => toast.info('Create election form — connect backend to enable')}>
                <Plus className="mr-2 h-4 w-4" />{t.createElection}
              </Button>
            </div>
            <Card className="border-none shadow-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>{t.name}</TableHead>
                    <TableHead>{t.type}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.totalVoters}</TableHead>
                    <TableHead>{t.votesCast}</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {elections.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{lang === 'ta' ? e.titleTa : e.title}</TableCell>
                      <TableCell className="capitalize">{e.type}</TableCell>
                      <TableCell><Badge className={e.status === 'active' ? 'bg-secondary text-secondary-foreground' : ''}>{t[e.status as keyof typeof t]}</Badge></TableCell>
                      <TableCell>{e.totalVoters}</TableCell>
                      <TableCell>{e.votesCast}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 text-xs">{t.edit}</Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive">{t.delete}</Button>
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
              <h2 className="text-xl font-bold text-foreground">{t.manageCandidates}</h2>
              <Button size="sm" className="bg-secondary text-secondary-foreground" onClick={() => toast.info('Add candidate form — connect backend to enable')}>
                <Plus className="mr-2 h-4 w-4" />{t.addCandidate}
              </Button>
            </div>
            <Card className="border-none shadow-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>{t.name}</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Election</TableHead>
                    <TableHead>{t.votes}</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map(c => {
                    const el = elections.find(e => e.id === c.electionId);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{lang === 'ta' ? c.nameTa : c.name}</TableCell>
                        <TableCell>{lang === 'ta' ? c.partyTa : c.party}</TableCell>
                        <TableCell className="text-sm">{el ? (lang === 'ta' ? el.titleTa : el.title) : '-'}</TableCell>
                        <TableCell>{c.votes}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 text-xs">{t.edit}</Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive">{t.delete}</Button>
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
              <h2 className="text-xl font-bold text-foreground">{t.manageVoters}</h2>
              <Button size="sm" variant="outline" onClick={() => toast.info('CSV upload — connect backend to enable')}>
                <Upload className="mr-2 h-4 w-4" />{t.uploadCsv}
              </Button>
            </div>
            <Card className="border-none shadow-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>{t.name}</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Voter ID</TableHead>
                    <TableHead>Voted</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voters.map(v => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.name}</TableCell>
                      <TableCell className="font-mono">{v.mobile}</TableCell>
                      <TableCell>{v.voterId}</TableCell>
                      <TableCell>{v.hasVoted ? <Badge className="bg-secondary text-secondary-foreground">Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{v.registeredAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Results */}
          <TabsContent value="results">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">{t.results}</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.info('Export — connect backend')}>
                  <FileText className="mr-2 h-4 w-4" />{t.exportPdf}
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.info('Export — connect backend')}>
                  <Download className="mr-2 h-4 w-4" />{t.exportCsv}
                </Button>
              </div>
            </div>
            {elections.filter(e => e.status === 'active').map(e => {
              const eCandidates = candidates.filter(c => c.electionId === e.id);
              return (
                <Card key={e.id} className="mb-6 border-none shadow-md">
                  <CardHeader><CardTitle>{lang === 'ta' ? e.titleTa : e.title}</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={eCandidates.map(c => ({ name: lang === 'ta' ? c.nameTa : c.name, votes: c.votes }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="votes" radius={[6,6,0,0]}>
                          {eCandidates.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Logs */}
          <TabsContent value="logs">
            <h2 className="mb-4 text-xl font-bold text-foreground">{t.systemLogs}</h2>
            <Card className="border-none shadow-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Action</TableHead>
                    <TableHead>Voter ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant={log.action.includes('FAIL') ? 'destructive' : 'secondary'} className={log.action.includes('FAIL') ? '' : 'bg-secondary/10 text-secondary'}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.voterId}</TableCell>
                      <TableCell className="text-sm">{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
