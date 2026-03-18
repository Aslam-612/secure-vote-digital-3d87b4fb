import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Vote, TrendingUp, Activity, LogOut, Plus, Upload, Download, FileText, Shield, X } from 'lucide-react';
import { toast } from 'sonner';
import { getDashboard, getVoters, getAdminElections, getAdminCandidates, getResults, uploadVotersCsv, addCandidate, updateCandidate, deleteCandidate, addElection, updateElection, deleteElection } from '@/lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const CHART_COLORS = ['hsl(168, 100%, 39%)', 'hsl(224, 71%, 17%)', 'hsl(40, 95%, 55%)', 'hsl(0, 84%, 60%)', 'hsl(210, 100%, 52%)'];

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir',
  'Ladakh','Lakshadweep','Puducherry'
];

const emptyCandidate = { name: '', age: '', gender: '', groupName: '', constituency: '', position: '', phone: '', description: '', electionId: '', photo: '' };
const emptyElection = { title: '', type: '', parties: '', startTime: '', endTime: '', status: 'UPCOMING', state: '' };

// City-Constituency structure: [{ name: 'Chennai', constituencies: ['North', 'South'] }]
type CityEntry = { name: string; constituencies: string[] };

const AdminDashboard = () => {
  const { t } = useI18n();
  const { token, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>({ totalVoters: 0, votesCast: 0, voterTurnout: 0, activeElections: 0 });
  const [elections, setElections] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [voters, setVoters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Candidate modal
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [candidateForm, setCandidateForm] = useState<any>(emptyCandidate);
  const [candidateErrors, setCandidateErrors] = useState<any>({});
  const [candidateSubmitting, setCandidateSubmitting] = useState(false);
  const [showDeleteCandidateConfirm, setShowDeleteCandidateConfirm] = useState<any>(null);
  const [candidateSelectedCity, setCandidateSelectedCity] = useState('');

  // Election modal
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [editingElection, setEditingElection] = useState<any>(null);
  const [electionForm, setElectionForm] = useState<any>(emptyElection);
  const [electionErrors, setElectionErrors] = useState<any>({});
  const [electionSubmitting, setElectionSubmitting] = useState(false);
  const [showDeleteElectionConfirm, setShowDeleteElectionConfirm] = useState<any>(null);
  const [partyInput, setPartyInput] = useState('');
  const [partyList, setPartyList] = useState<string[]>([]);
  const [cityEntries, setCityEntries] = useState<CityEntry[]>([]);
  const [cityInput, setCityInput] = useState('');
  const [selectedCityForConstituency, setSelectedCityForConstituency] = useState('');
  const [constituencyInput, setConstituencyInput] = useState('');

  useEffect(() => {
    if (!token || !isAdmin) { navigate('/admin-login'); return; }
    loadAllData();
  }, [token, isAdmin]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dashData, votersData, electionsData, candidatesData] = await Promise.all([
        getDashboard(token!), getVoters(token!), getAdminElections(token!), getAdminCandidates(token!),
      ]);
      setStats(dashData); setVoters(votersData); setElections(electionsData); setCandidates(candidatesData);
    } catch (e) { toast.error('Could not load dashboard data.'); }
    setLoading(false);
  };

  // Parse city-constituency JSON from election description
  const parseCityEntries = (description: string): CityEntry[] => {
    try {
      const parsed = JSON.parse(description);
      if (parsed.cities) return parsed.cities;
    } catch {}
    return [];
  };

  const getElectionGovData = (election: any) => {
    try { return JSON.parse(election.description || '{}'); } catch { return {}; }
  };

  // ── Election Modal ─────────────────────────────────
  const openAddElectionModal = () => {
    setEditingElection(null);
    setElectionForm(emptyElection);
    setPartyList([]); setPartyInput('');
    setCityEntries([]); setCityInput('');
    setSelectedCityForConstituency(''); setConstituencyInput('');
    setElectionErrors({});
    setShowElectionModal(true);
  };

  const openEditElectionModal = (e: any) => {
    setEditingElection(e);
    const govData = getElectionGovData(e);
    setElectionForm({
      title: e.title || '', type: e.type || '',
      parties: e.parties || '', startTime: e.startTime ? e.startTime.slice(0, 16) : '',
      endTime: e.endTime ? e.endTime.slice(0, 16) : '', status: e.status || 'UPCOMING',
      state: govData.state || ''
    });
    setPartyList(e.parties ? e.parties.split(',').map((p: string) => p.trim()).filter(Boolean) : []);
    setCityEntries(govData.cities || []);
    setCityInput(''); setSelectedCityForConstituency(''); setConstituencyInput('');
    setElectionErrors({});
    setShowElectionModal(true);
  };

  const addParty = () => {
    const p = partyInput.trim();
    if (!p) return;
    if (partyList.map(x => x.toLowerCase()).includes(p.toLowerCase())) { toast.error('Party already added!'); return; }
    setPartyList([...partyList, p]); setPartyInput('');
  };

  const addCity = () => {
    const c = cityInput.trim();
    if (!c) return;
    if (cityEntries.map(x => x.name.toLowerCase()).includes(c.toLowerCase())) { toast.error('City already added!'); return; }
    setCityEntries([...cityEntries, { name: c, constituencies: [] }]);
    setCityInput('');
    setSelectedCityForConstituency(c);
  };

  const addConstituencyToCity = () => {
    const con = constituencyInput.trim();
    if (!con || !selectedCityForConstituency) return;
    setCityEntries(cityEntries.map(city => {
      if (city.name === selectedCityForConstituency) {
        if (city.constituencies.map(x => x.toLowerCase()).includes(con.toLowerCase())) {
          toast.error('Constituency already added!'); return city;
        }
        return { ...city, constituencies: [...city.constituencies, con] };
      }
      return city;
    }));
    setConstituencyInput('');
  };

  const removeConstituencyFromCity = (cityName: string, con: string) => {
    setCityEntries(cityEntries.map(city =>
      city.name === cityName ? { ...city, constituencies: city.constituencies.filter(c => c !== con) } : city
    ));
  };

  const validateElectionForm = () => {
    const errors: any = {};
    if (!electionForm.title.trim()) errors.title = 'Election name is required';
    if (!electionForm.type) errors.type = 'Election level is required';
    if (!electionForm.status) errors.status = 'Status is required';
    if (!electionForm.startTime) errors.startTime = 'Start date & time is required';
    if (!electionForm.endTime) errors.endTime = 'End date & time is required';
    if (electionForm.startTime && electionForm.endTime && electionForm.startTime >= electionForm.endTime)
      errors.endTime = 'End time must be after start time';
    if (electionForm.type === 'Government' && !electionForm.state) errors.state = 'State is required';
    const duplicate = elections.find((e: any) =>
      e.title.toLowerCase() === electionForm.title.trim().toLowerCase() &&
      (!editingElection || e.id !== editingElection.id)
    );
    if (duplicate) errors.title = 'An election with this name already exists';
    setElectionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleElectionSubmit = async () => {
    if (!validateElectionForm()) return;
    setElectionSubmitting(true);
    try {
      const govDescription = electionForm.type === 'Government'
        ? JSON.stringify({ state: electionForm.state, cities: cityEntries })
        : '';
      const allConstituencies = cityEntries.flatMap(c => c.constituencies);
      const payload = {
        ...electionForm,
        parties: partyList.join(','),
        constituency: allConstituencies.join(','),
        description: govDescription,
      };
      if (editingElection) {
        await updateElection(editingElection.id, payload, token!);
        toast.success('Election updated successfully!');
      } else {
        await addElection(payload, token!);
        toast.success('Election created successfully!');
      }
      setShowElectionModal(false);
      loadAllData();
    } catch (e) { toast.error('Failed to save election.'); }
    setElectionSubmitting(false);
  };

  const handleDeleteElection = async (id: number) => {
    try {
      await deleteElection(id, token!);
      toast.success('Election deleted!');
      setShowDeleteElectionConfirm(null);
      loadAllData();
    } catch (e) { toast.error('Failed to delete election.'); }
  };

  // ── Candidate Modal ────────────────────────────────
  const openAddCandidateModal = () => {
    setEditingCandidate(null);
    setCandidateForm(emptyCandidate);
    setCandidateSelectedCity('');
    setCandidateErrors({});
    setShowCandidateModal(true);
  };

  const openEditCandidateModal = (c: any) => {
    setEditingCandidate(c);
    setCandidateForm({
      name: c.name || '', age: c.age || '', gender: c.gender || '',
      groupName: c.groupName || '', constituency: c.constituency || '',
      position: c.position || '', phone: c.phone || '',
      description: c.description || '', electionId: c.electionId || '', photo: c.photo || ''
    });
    // Try to find city from constituency
    const el = elections.find((e: any) => e.id === c.electionId);
    if (el) {
      const govData = getElectionGovData(el);
      if (govData.cities) {
        const cityWithCon = govData.cities.find((city: CityEntry) =>
          city.constituencies.includes(c.constituency)
        );
        if (cityWithCon) setCandidateSelectedCity(cityWithCon.name);
      }
    }
    setCandidateErrors({});
    setShowCandidateModal(true);
  };

  const getPartiesForElection = (electionId: string) => {
    const el = elections.find((e: any) => e.id === Number(electionId));
    if (!el || !el.parties) return [];
    return el.parties.split(',').map((p: string) => p.trim()).filter(Boolean);
  };

  const getCitiesForElection = (electionId: string): CityEntry[] => {
    const el = elections.find((e: any) => e.id === Number(electionId));
    if (!el) return [];
    return parseCityEntries(el.description || '');
  };

  const getConstituenciesForCity = (electionId: string, cityName: string): string[] => {
    const cities = getCitiesForElection(electionId);
    const city = cities.find(c => c.name === cityName);
    return city ? city.constituencies : [];
  };

  const isGovernmentElection = (electionId: string) => {
    const el = elections.find((e: any) => e.id === Number(electionId));
    return el?.type === 'Government';
  };

  const getSimpleConstituencies = (electionId: string): string[] => {
    const el = elections.find((e: any) => e.id === Number(electionId));
    if (!el || !el.constituency) return [];
    return el.constituency.split(',').map((c: string) => c.trim()).filter(Boolean);
  };

  const validateCandidateForm = () => {
    const errors: any = {};
    if (!candidateForm.name.trim()) errors.name = 'Full name is required';
    if (!candidateForm.age || isNaN(candidateForm.age) || candidateForm.age < 18 || candidateForm.age > 100)
      errors.age = 'Valid age (18-100) is required';
    if (!candidateForm.gender) errors.gender = 'Gender is required';
    if (!candidateForm.groupName) errors.groupName = 'Party is required';
    if (!candidateForm.position.trim()) errors.position = 'Position is required';
    if (!candidateForm.phone.trim() || candidateForm.phone.length < 10) errors.phone = 'Valid phone number is required';
    if (!candidateForm.electionId) errors.electionId = 'Election is required';
    const duplicate = candidates.find((c: any) =>
      c.name.toLowerCase() === candidateForm.name.trim().toLowerCase() &&
      c.electionId === Number(candidateForm.electionId) &&
      (!editingCandidate || c.id !== editingCandidate.id)
    );
    if (duplicate) errors.name = 'A candidate with this name already exists in this election';
    setCandidateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCandidateSubmit = async () => {
    if (!validateCandidateForm()) return;
    setCandidateSubmitting(true);
    try {
      const payload = { ...candidateForm, age: Number(candidateForm.age), electionId: Number(candidateForm.electionId), voteCount: editingCandidate?.voteCount || 0 };
      if (editingCandidate) {
        await updateCandidate(editingCandidate.id, payload, token!);
        toast.success('Candidate updated successfully!');
      } else {
        await addCandidate(payload, token!);
        toast.success('Candidate added successfully!');
      }
      setShowCandidateModal(false);
      loadAllData();
    } catch (e) { toast.error('Failed to save candidate.'); }
    setCandidateSubmitting(false);
  };

  const handleDeleteCandidate = async (id: number) => {
    try {
      await deleteCandidate(id, token!);
      toast.success('Candidate deleted!');
      setShowDeleteCandidateConfirm(null);
      loadAllData();
    } catch (e) { toast.error('Failed to delete candidate.'); }
  };
const exportPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('eVoting Results Report', 14, 20);
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  let y = 40;
  elections.forEach((e: any) => {
    const eCandidates = candidates.filter((c: any) => c.electionId === e.id);
    doc.setFontSize(13);
    doc.text(`Election: ${e.title}`, 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`Status: ${e.status} | Level: ${e.type}`, 14, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [['Candidate', 'Party', 'Position', 'Votes']],
      body: eCandidates.map((c: any) => [c.name, c.groupName || '-', c.position || '-', c.voteCount]),
      theme: 'grid',
      headStyles: { fillColor: [0, 168, 120] },
      margin: { left: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 15;
  });
  doc.save('evoting-results.pdf');
  toast.success('PDF downloaded!');
};

const exportCSV = () => {
  let csv = 'Election,Candidate,Party,Position,Constituency,Votes\n';
  elections.forEach((e: any) => {
    const eCandidates = candidates.filter((c: any) => c.electionId === e.id);
    eCandidates.forEach((c: any) => {
      csv += `"${e.title}","${c.name}","${c.groupName || ''}","${c.position || ''}","${c.constituency || ''}",${c.voteCount}\n`;
    });
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'evoting-results.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast.success('CSV downloaded!');
};
  const statCards = [
    { icon: Users, label: 'Total Registered Voters', value: stats.totalVoters, color: 'text-secondary' },
    { icon: Vote, label: 'Votes Cast', value: stats.votesCast, color: 'text-info' },
    { icon: TrendingUp, label: 'Voter Turnout', value: `${stats.voterTurnout || 0}%`, color: 'text-accent' },
    { icon: Activity, label: 'Active Elections', value: stats.activeElections, color: 'text-success' },
  ];

  const firstElection = elections[0];
  const firstElectionCandidates = firstElection ? candidates.filter((c: any) => c.electionId === firstElection.id) : [];
  const barData = firstElectionCandidates.map((c: any) => ({ name: c.name, votes: c.voteCount }));
  const pieData = firstElectionCandidates.map((c: any) => ({ name: c.name, value: c.voteCount }));

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
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

      {/* Election Modal */}
      {showElectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editingElection ? 'Edit Election' : 'Create Election'}</h2>
              <button onClick={() => setShowElectionModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Election Name *</label>
                  <Input placeholder="e.g. Tamil Nadu Assembly Election 2026" value={electionForm.title}
                    onChange={e => setElectionForm({ ...electionForm, title: e.target.value })}
                    className={electionErrors.title ? 'border-red-500' : ''} />
                  {electionErrors.title && <p className="text-xs text-red-500 mt-1">{electionErrors.title}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Election Level *</label>
                  <select className={`w-full border rounded-md px-3 py-2 text-sm bg-background ${electionErrors.type ? 'border-red-500' : 'border-input'}`}
                    value={electionForm.type}
                    onChange={e => { setElectionForm({ ...electionForm, type: e.target.value, state: '' }); setCityEntries([]); }}>
                    <option value="">Select level</option>
                    <option value="College">College</option>
                    <option value="Department">Department</option>
                    <option value="Government">Government</option>
                  </select>
                  {electionErrors.type && <p className="text-xs text-red-500 mt-1">{electionErrors.type}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Status *</label>
                  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                    value={electionForm.status} onChange={e => setElectionForm({ ...electionForm, status: e.target.value })}>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date & Time *</label>
                  <Input type="datetime-local" value={electionForm.startTime}
                    onChange={e => setElectionForm({ ...electionForm, startTime: e.target.value })}
                    className={electionErrors.startTime ? 'border-red-500' : ''} />
                  {electionErrors.startTime && <p className="text-xs text-red-500 mt-1">{electionErrors.startTime}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">End Date & Time *</label>
                  <Input type="datetime-local" value={electionForm.endTime}
                    onChange={e => setElectionForm({ ...electionForm, endTime: e.target.value })}
                    className={electionErrors.endTime ? 'border-red-500' : ''} />
                  {electionErrors.endTime && <p className="text-xs text-red-500 mt-1">{electionErrors.endTime}</p>}
                </div>
              </div>

              {/* Government Level: State → City → Constituency */}
              {electionForm.type === 'Government' && (
                <div className="p-4 bg-muted/40 rounded-lg border border-dashed space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">🏛️ Government Election — Location</h3>

                  {/* State Dropdown */}
                  <div>
                    <label className="text-sm font-medium">State *</label>
                    <select className={`w-full border rounded-md px-3 py-2 text-sm bg-background ${electionErrors.state ? 'border-red-500' : 'border-input'}`}
                      value={electionForm.state}
                      onChange={e => { setElectionForm({ ...electionForm, state: e.target.value }); setCityEntries([]); setCityInput(''); setSelectedCityForConstituency(''); }}>
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {electionErrors.state && <p className="text-xs text-red-500 mt-1">{electionErrors.state}</p>}
                  </div>

                  {/* City Add */}
                  {electionForm.state && (
                    <div>
                      <label className="text-sm font-medium">Add Cities in {electionForm.state}</label>
                      <div className="flex gap-2 mt-1">
                        <Input placeholder="e.g. Chennai" value={cityInput}
                          onChange={e => setCityInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addCity()} />
                        <Button type="button" variant="outline" onClick={addCity}>Add</Button>
                      </div>
                    </div>
                  )}

                  {/* City List with Constituencies */}
                  {cityEntries.length > 0 && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Cities & Constituencies</label>

                      {/* Select City to add constituency */}
                      <div>
                        <label className="text-xs text-muted-foreground">Select city to add constituency:</label>
                        <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1"
                          value={selectedCityForConstituency}
                          onChange={e => { setSelectedCityForConstituency(e.target.value); setConstituencyInput(''); }}>
                          <option value="">Select city</option>
                          {cityEntries.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>

                      {selectedCityForConstituency && (
                        <div className="flex gap-2">
                          <Input placeholder={`Add constituency in ${selectedCityForConstituency}`}
                            value={constituencyInput}
                            onChange={e => setConstituencyInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addConstituencyToCity()} />
                          <Button type="button" variant="outline" onClick={addConstituencyToCity}>Add</Button>
                        </div>
                      )}

                      {/* Display cities with constituencies */}
                      {cityEntries.map((city, ci) => (
                        <div key={ci} className="bg-background rounded-lg p-3 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold">📍 {city.name}</span>
                            <button onClick={() => { setCityEntries(cityEntries.filter((_, i) => i !== ci)); if (selectedCityForConstituency === city.name) setSelectedCityForConstituency(''); }}
                              className="text-destructive text-xs hover:underline">Remove city</button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {city.constituencies.length === 0
                              ? <span className="text-xs text-muted-foreground">No constituencies added</span>
                              : city.constituencies.map((con, conI) => (
                                <span key={conI} className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full text-xs">
                                  {con}
                                  <button onClick={() => removeConstituencyFromCity(city.name, con)}><X className="h-3 w-3" /></button>
                                </span>
                              ))
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Non-Government: Simple Constituency */}
              {electionForm.type && electionForm.type !== 'Government' && (
                <div>
                  <label className="text-sm font-medium">
                    {electionForm.type === 'Department' ? 'Departments / Areas' : 'Areas / Zones'}
                  </label>
                  <div className="flex gap-2 mt-1">
                    <Input placeholder={electionForm.type === 'Department' ? 'e.g. CSE Department' : 'e.g. Final Year'}
                      value={constituencyInput}
                      onChange={e => setConstituencyInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { const c = constituencyInput.trim(); if (c) { setCityEntries([{ name: 'default', constituencies: [...(cityEntries[0]?.constituencies || []), c] }]); setConstituencyInput(''); } } }} />
                    <Button type="button" variant="outline" onClick={() => {
                      const c = constituencyInput.trim();
                      if (!c) return;
                      const existing = cityEntries[0]?.constituencies || [];
                      if (existing.map(x => x.toLowerCase()).includes(c.toLowerCase())) { toast.error('Already added!'); return; }
                      setCityEntries([{ name: 'default', constituencies: [...existing, c] }]);
                      setConstituencyInput('');
                    }}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(cityEntries[0]?.constituencies || []).map((c, i) => (
                      <span key={i} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs">
                        {c}
                        <button onClick={() => setCityEntries([{ name: 'default', constituencies: (cityEntries[0]?.constituencies || []).filter((_, j) => j !== i) }])}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Parties */}
              <div>
                <label className="text-sm font-medium">Parties Allowed</label>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="e.g. ABC Party" value={partyInput}
                    onChange={e => setPartyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addParty()} />
                  <Button type="button" variant="outline" onClick={addParty}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {partyList.map((p, i) => (
                    <span key={i} className="flex items-center gap-1 bg-secondary/20 text-secondary px-2 py-1 rounded-full text-xs">
                      {p}
                      <button onClick={() => setPartyList(partyList.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowElectionModal(false)}>Cancel</Button>
              <Button className="flex-1 bg-secondary text-secondary-foreground" onClick={handleElectionSubmit} disabled={electionSubmitting}>
                {electionSubmitting ? 'Saving...' : editingElection ? 'Update Election' : 'Create Election'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Election Confirm */}
      {showDeleteElectionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-2xl p-6">
            <h2 className="text-lg font-bold mb-2">Delete Election</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Are you sure you want to delete <strong>{showDeleteElectionConfirm.title}</strong>?
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteElectionConfirm(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={() => handleDeleteElection(showDeleteElectionConfirm.id)}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Modal */}
      {showCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editingCandidate ? 'Edit Candidate' : 'Add Candidate'}</h2>
              <button onClick={() => setShowCandidateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">🧍 Basic Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input placeholder="Enter full name" value={candidateForm.name}
                      onChange={e => setCandidateForm({ ...candidateForm, name: e.target.value })}
                      className={candidateErrors.name ? 'border-red-500' : ''} />
                    {candidateErrors.name && <p className="text-xs text-red-500 mt-1">{candidateErrors.name}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Age *</label>
                    <Input type="number" placeholder="Age" value={candidateForm.age}
                      onChange={e => setCandidateForm({ ...candidateForm, age: e.target.value })}
                      className={candidateErrors.age ? 'border-red-500' : ''} />
                    {candidateErrors.age && <p className="text-xs text-red-500 mt-1">{candidateErrors.age}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Gender *</label>
                    <select className={`w-full border rounded-md px-3 py-2 text-sm bg-background ${candidateErrors.gender ? 'border-red-500' : 'border-input'}`}
                      value={candidateForm.gender} onChange={e => setCandidateForm({ ...candidateForm, gender: e.target.value })}>
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {candidateErrors.gender && <p className="text-xs text-red-500 mt-1">{candidateErrors.gender}</p>}
                  </div>
                </div>
              </div>

              {/* Election Info */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">🏛️ Election Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Election *</label>
                    <select className={`w-full border rounded-md px-3 py-2 text-sm bg-background ${candidateErrors.electionId ? 'border-red-500' : 'border-input'}`}
                      value={candidateForm.electionId}
                      onChange={e => { setCandidateForm({ ...candidateForm, electionId: e.target.value, groupName: '', constituency: '' }); setCandidateSelectedCity(''); }}>
                      <option value="">Select election</option>
                      {elections.map((e: any) => <option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                    {candidateErrors.electionId && <p className="text-xs text-red-500 mt-1">{candidateErrors.electionId}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Party *</label>
                    {getPartiesForElection(candidateForm.electionId).length > 0 ? (
                      <select className={`w-full border rounded-md px-3 py-2 text-sm bg-background ${candidateErrors.groupName ? 'border-red-500' : 'border-input'}`}
                        value={candidateForm.groupName} onChange={e => setCandidateForm({ ...candidateForm, groupName: e.target.value })}>
                        <option value="">Select party</option>
                        {getPartiesForElection(candidateForm.electionId).map((p: string, i: number) => (
                          <option key={i} value={p}>{p}</option>
                        ))}
                      </select>
                    ) : (
                      <Input placeholder={candidateForm.electionId ? 'No parties defined — type freely' : 'Select election first'}
                        value={candidateForm.groupName}
                        onChange={e => setCandidateForm({ ...candidateForm, groupName: e.target.value })}
                        className={candidateErrors.groupName ? 'border-red-500' : ''} />
                    )}
                    {candidateErrors.groupName && <p className="text-xs text-red-500 mt-1">{candidateErrors.groupName}</p>}
                  </div>

                  {/* Government: show city then constituency */}
                  {candidateForm.electionId && isGovernmentElection(candidateForm.electionId) && (
                    <>
                      <div>
                        <label className="text-sm font-medium">City</label>
                        <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                          value={candidateSelectedCity}
                          onChange={e => { setCandidateSelectedCity(e.target.value); setCandidateForm({ ...candidateForm, constituency: '' }); }}>
                          <option value="">Select city</option>
                          {getCitiesForElection(candidateForm.electionId).map((c, i) => (
                            <option key={i} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Constituency</label>
                        <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                          value={candidateForm.constituency}
                          onChange={e => setCandidateForm({ ...candidateForm, constituency: e.target.value })}
                          disabled={!candidateSelectedCity}>
                          <option value="">Select constituency</option>
                          {getConstituenciesForCity(candidateForm.electionId, candidateSelectedCity).map((c, i) => (
                            <option key={i} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Non-Government: simple constituency */}
                  {candidateForm.electionId && !isGovernmentElection(candidateForm.electionId) && (
                    <div>
                      <label className="text-sm font-medium">Constituency / Area</label>
                      {getSimpleConstituencies(candidateForm.electionId).length > 0 ? (
                        <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                          value={candidateForm.constituency} onChange={e => setCandidateForm({ ...candidateForm, constituency: e.target.value })}>
                          <option value="">Select area</option>
                          {getSimpleConstituencies(candidateForm.electionId).map((c, i) => (
                            <option key={i} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <Input placeholder="No areas defined" disabled value="" />
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Position *</label>
                    <Input placeholder="e.g. President / CR" value={candidateForm.position}
                      onChange={e => setCandidateForm({ ...candidateForm, position: e.target.value })}
                      className={candidateErrors.position ? 'border-red-500' : ''} />
                    {candidateErrors.position && <p className="text-xs text-red-500 mt-1">{candidateErrors.position}</p>}
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">📞 Contact</h3>
                <div>
                  <label className="text-sm font-medium">Phone Number *</label>
                  <Input placeholder="Enter phone number" value={candidateForm.phone}
                    onChange={e => setCandidateForm({ ...candidateForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className={candidateErrors.phone ? 'border-red-500' : ''} />
                  {candidateErrors.phone && <p className="text-xs text-red-500 mt-1">{candidateErrors.phone}</p>}
                </div>
              </div>

              {/* Profile */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">🖼️ Profile</h3>
                <div>
                  <label className="text-sm font-medium">Short Description (optional)</label>
                  <textarea className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background resize-none"
                    rows={3} placeholder="Brief description about the candidate"
                    value={candidateForm.description} onChange={e => setCandidateForm({ ...candidateForm, description: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowCandidateModal(false)}>Cancel</Button>
              <Button className="flex-1 bg-secondary text-secondary-foreground" onClick={handleCandidateSubmit} disabled={candidateSubmitting}>
                {candidateSubmitting ? 'Saving...' : editingCandidate ? 'Update Candidate' : 'Add Candidate'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Candidate Confirm */}
      {showDeleteCandidateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-2xl p-6">
            <h2 className="text-lg font-bold mb-2">Delete Candidate</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Are you sure you want to delete <strong>{showDeleteCandidateConfirm.name}</strong>?
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteCandidateConfirm(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={() => handleDeleteCandidate(showDeleteCandidateConfirm.id)}>Delete</Button>
            </div>
          </div>
        </div>
      )}

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
                <CardHeader><CardTitle className="text-base">Vote Distribution — {firstElection?.title || 'No Elections'}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis /><Tooltip />
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
              <Button size="sm" className="bg-secondary text-secondary-foreground" onClick={openAddElectionModal}>
                <Plus className="mr-2 h-4 w-4" />Create Election
              </Button>
            </div>
            <Card className="border-none shadow-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead><TableHead>Level</TableHead>
                    <TableHead>Parties</TableHead><TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {elections.map((e: any) => {
                    const govData = getElectionGovData(e);
                    return (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">
                          {e.title}
                          {e.type === 'Government' && govData.state && (
                            <p className="text-xs text-muted-foreground mt-0.5">📍 {govData.state}</p>
                          )}
                        </TableCell>
                        <TableCell className="capitalize">{e.type}</TableCell>
                        <TableCell className="text-sm">
                          {e.parties ? e.parties.split(',').map((p: string, i: number) => (
                            <span key={i} className="inline-block bg-muted px-1.5 py-0.5 rounded text-xs mr-1 mb-1">{p.trim()}</span>
                          )) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={e.status === 'ACTIVE' ? 'bg-secondary text-secondary-foreground' : ''}>{e.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEditElectionModal(e)}>Edit</Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => setShowDeleteElectionConfirm(e)}>Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Candidates */}
          <TabsContent value="candidates">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Manage Candidates</h2>
              <Button size="sm" className="bg-secondary text-secondary-foreground" onClick={openAddCandidateModal}>
                <Plus className="mr-2 h-4 w-4" />Add Candidate
              </Button>
            </div>
            <Card className="border-none shadow-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead><TableHead>Party</TableHead>
                    <TableHead>Position</TableHead><TableHead>Election</TableHead>
                    <TableHead>Votes</TableHead><TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((c: any) => {
                    const el = elections.find((e: any) => e.id === c.electionId);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{c.groupName}</TableCell>
                        <TableCell>{c.position || '-'}</TableCell>
                        <TableCell className="text-sm">{el ? el.title : '-'}</TableCell>
                        <TableCell>{c.voteCount}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEditCandidateModal(c)}>Edit</Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => setShowDeleteCandidateConfirm(c)}>Delete</Button>
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
              <Button size="sm" variant="outline" onClick={() => {
                const input = document.createElement('input');
                input.type = 'file'; input.accept = '.csv';
                input.onchange = async (e: any) => {
                  const file = e.target.files[0]; if (!file) return;
                  try {
                    const result = await uploadVotersCsv(file, token!);
                    if (result.status === 'SUCCESS') { toast.success(result.message); loadAllData(); }
                    else toast.error(result.message);
                  } catch (err) { toast.error('CSV upload failed.'); }
                };
                input.click();
              }}>
                <Upload className="mr-2 h-4 w-4" />Upload CSV
              </Button>
            </div>
            <Card className="border-none shadow-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead><TableHead>Mobile</TableHead>
                    <TableHead>Aadhar</TableHead><TableHead>Voted</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voters.map((v: any) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.name}</TableCell>
                      <TableCell className="font-mono">{v.mobile}</TableCell>
                      <TableCell className="font-mono">{v.aadharNumber || '-'}</TableCell>
                      <TableCell>
                        {v.hasVoted ? <Badge className="bg-secondary text-secondary-foreground">Yes</Badge> : <Badge variant="outline">No</Badge>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(v.registeredAt).toLocaleDateString()}</TableCell>
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
                <Button size="sm" variant="outline" onClick={exportPDF}>
  <FileText className="mr-2 h-4 w-4" />Export PDF
</Button>
<Button size="sm" variant="outline" onClick={exportCSV}>
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
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis /><Tooltip />
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