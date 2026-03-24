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
import { getDashboard, getVoters, getAdminElections, getAdminCandidates, uploadVotersCsv, addCandidate, updateCandidate, deleteCandidate, addElection, updateElection, deleteElection } from '@/lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { STATE_EMBLEMS } from '@/lib/stateEmblems';

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

const calculateAge = (dob: string) => {
  if (!dob) return '-';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const emptyCandidate = { name: '', age: '', gender: '', groupName: '', constituency: '', position: '', phone: '', description: '', electionId: '', photo: '', dateOfBirth: '' };
const emptyElection = { title: '', type: '', parties: '', startTime: '', endTime: '', status: 'UPCOMING', state: '' };
type PartyEntry = { name: string; logo: string };

type CityEntry = { name: string; constituencies: string[] };

// ── Voter Filter Section ───────────────────────────
const VoterFilterSection = ({ token, voters }: { token: string, voters: any[] }) => {
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState('');
const [selectedCity, setSelectedCity] = useState('');
const [selectedConstituency, setSelectedConstituency] = useState('');
const [constituencies, setConstituencies] = useState<string[]>([]);
const [filteredVoters, setFilteredVoters] = useState<any[]>(voters);
  const [loadingFilter, setLoadingFilter] = useState(false);

  useEffect(() => { setFilteredVoters(voters); }, [voters]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/admin/voters/states`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setStates(data.filter(Boolean));
    }).catch(() => {});
  }, [token]);

  const handleStateChange = async (state: string) => {
  setSelectedState(state); setSelectedCity(''); setCities([]);
  setSelectedConstituency(''); setConstituencies([]);
  if (state) {
    fetch(`http://localhost:8080/api/admin/voters/cities?state=${encodeURIComponent(state)}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCities(data.filter(Boolean));
    }).catch(() => {});
    applyFilterFull(state, '', '');
  } else { applyFilterFull('', '', ''); }
};

const handleCityChange = async (city: string) => {
  setSelectedCity(city); setSelectedConstituency(''); setConstituencies([]);
  if (city) {
    fetch(`http://localhost:8080/api/admin/voters/constituencies?city=${encodeURIComponent(city)}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setConstituencies(data.filter(Boolean));
    }).catch(() => {});
  }
  applyFilterFull(selectedState, city, '');
};

const handleConstituencyChange = async (constituency: string) => {
  setSelectedConstituency(constituency);
  applyFilterFull(selectedState, selectedCity, constituency);
};

const applyFilterFull = async (state: string, city: string, constituency: string) => {
  setLoadingFilter(true);
  try {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (city) params.append('city', city);
    if (constituency) params.append('constituency', constituency);
    const res = await fetch(`http://localhost:8080/api/admin/voters/filter?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setFilteredVoters(data);
  } catch {}
  setLoadingFilter(false);
};
  const clearFilters = () => {
  setSelectedState(''); setSelectedCity(''); setCities([]);
  setSelectedConstituency(''); setConstituencies([]);
  setFilteredVoters(voters);
};

  const groupedByState: Record<string, any[]> = {};
  filteredVoters.forEach(v => {
    const s = v.state || 'Unknown';
    if (!groupedByState[s]) groupedByState[s] = [];
    groupedByState[s].push(v);
  });

  return (
    <div>
      <Card className="border-none shadow-md mb-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Filter by State</label>
              <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                value={selectedState} onChange={e => handleStateChange(e.target.value)}>
                <option value="">All States</option>
                {states.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
  <label className="text-xs font-medium text-muted-foreground mb-1 block">Filter by City</label>
  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
    value={selectedCity} onChange={e => handleCityChange(e.target.value)} disabled={!selectedState}>
    <option value="">All Cities</option>
    {cities.map((c, i) => <option key={i} value={c}>{c}</option>)}
  </select>
</div>
<div className="flex-1 min-w-[150px]">
  <label className="text-xs font-medium text-muted-foreground mb-1 block">Filter by Constituency</label>
  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
    value={selectedConstituency} onChange={e => handleConstituencyChange(e.target.value)} disabled={!selectedCity}>
    <option value="">All Constituencies</option>
    {constituencies.map((c, i) => <option key={i} value={c}>{c}</option>)}
  </select>
</div>
            <div className="flex gap-2 items-center">
              <Badge variant="outline" className="text-xs">
                {filteredVoters.length} voter{filteredVoters.length !== 1 ? 's' : ''} found
              </Badge>
              {(selectedState || selectedCity) && (
                <Button size="sm" variant="ghost" onClick={clearFilters} className="text-xs h-8">
                  <X className="h-3 w-3 mr-1" />Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {loadingFilter ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : Object.keys(groupedByState).length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No voters found.</p>
      ) : (
        Object.entries(groupedByState).map(([state, stateVoters]) => (
          <div key={state} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-foreground">📍 {state}</span>
              <Badge variant="outline" className="text-xs">{stateVoters.length} voters</Badge>
            </div>
            {(() => {
              const cityGroups: Record<string, any[]> = {};
              stateVoters.forEach(v => {
                const c = v.city || 'Unknown City';
                if (!cityGroups[c]) cityGroups[c] = [];
                cityGroups[c].push(v);
              });
              return Object.entries(cityGroups).map(([city, cityVoters]) => (
                <div key={city} className="mb-4 ml-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-muted-foreground">🏙️ {city}</span>
                    <Badge variant="outline" className="text-xs">{cityVoters.length} voters</Badge>
                  </div>
                  <Card className="border-none shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Name</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>D.O.B</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead>Aadhar</TableHead>
                          <TableHead>State</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Constituency</TableHead>
                          <TableHead>Voted</TableHead>
                          <TableHead>Registered</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
  {cityVoters.map((v: any) => (
    <TableRow key={v.id}>
      <TableCell className="font-medium">{v.name}</TableCell>

{/* Age */}
<TableCell>{calculateAge(v.dateOfBirth)}</TableCell>

{/* DOB */}
<TableCell>{v.dateOfBirth || '-'}</TableCell>

{/* Mobile */}
<TableCell className="font-mono text-sm">{v.mobile}</TableCell>

{/* Aadhar */}
<TableCell className="font-mono text-sm">{v.aadharNumber || '-'}</TableCell>

{/* State */}
<TableCell className="text-sm">{v.state || '-'}</TableCell>

{/* City */}
<TableCell className="text-sm">{v.city || '-'}</TableCell>

{/* Constituency */}
<TableCell className="text-sm">{v.constituency || '-'}</TableCell>

{/* Voted */}
<TableCell>
  {v.hasVoted
    ? <Badge className="bg-secondary text-secondary-foreground">Yes</Badge>
    : <Badge variant="outline">No</Badge>}
</TableCell>

{/* Registered */}
<TableCell className="text-sm text-muted-foreground">
  {new Date(v.registeredAt).toLocaleDateString()}
</TableCell>
    </TableRow>
  ))}
</TableBody>
                    </Table>
                  </Card>
                </div>
              ));
            })()}
          </div>
        ))
      )}
    </div>
  );
};

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

  // Election filters
  const [electionLevelFilter, setElectionLevelFilter] = useState('');
  const [electionNameFilter, setElectionNameFilter] = useState('');

  const [candidateElectionFilter, setCandidateElectionFilter] = useState('');
const [candidateStateFilter, setCandidateStateFilter] = useState('');
const [candidateCityFilter, setCandidateCityFilter] = useState('');
const [candidateConstituencyFilter, setCandidateConstituencyFilter] = useState('');
const [candidatePartyFilter, setCandidatePartyFilter] = useState('');
const [selectedDashboardElection, setSelectedDashboardElection] = useState<any>(null);

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
const [partyList, setPartyList] = useState<PartyEntry[]>([]);
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

  const openAddElectionModal = () => {
    setEditingElection(null); setElectionForm(emptyElection);
    setPartyList([]); setPartyInput('');
    setCityEntries([]); setCityInput('');
    setSelectedCityForConstituency(''); setConstituencyInput('');
    setElectionErrors({}); setShowElectionModal(true);
  };

  const openEditElectionModal = (e: any) => {
    setEditingElection(e);
    const govData = getElectionGovData(e);
    setElectionForm({
      title: e.title || '', type: e.type || '', parties: e.parties || '',
      startTime: e.startTime ? e.startTime.slice(0, 16) : '',
      endTime: e.endTime ? e.endTime.slice(0, 16) : '',
      status: e.status || 'UPCOMING', state: govData.state || ''
    });
    try {
  const parsed = JSON.parse(e.parties || '[]');
  setPartyList(Array.isArray(parsed) ? parsed : e.parties.split(',').map((p: string) => ({ name: p.trim(), logo: '' })).filter((p: PartyEntry) => p.name));
} catch {
  setPartyList(e.parties ? e.parties.split(',').map((p: string) => ({ name: p.trim(), logo: '' })).filter((p: PartyEntry) => p.name) : []);
}
    setCityEntries(govData.cities || []);
    setCityInput(''); setSelectedCityForConstituency(''); setConstituencyInput('');
    setElectionErrors({}); setShowElectionModal(true);
  };

  const addParty = () => {
  const p = partyInput.trim();
  if (!p) return;
  if (partyList.map(x => x.name.toLowerCase()).includes(p.toLowerCase())) { toast.error('Party already added!'); return; }
  setPartyList([...partyList, { name: p, logo: '' }]); setPartyInput('');
};

  const addCity = () => {
    const c = cityInput.trim();
    if (!c) return;
    if (cityEntries.map(x => x.name.toLowerCase()).includes(c.toLowerCase())) { toast.error('City already added!'); return; }
    setCityEntries([...cityEntries, { name: c, constituencies: [] }]);
    setCityInput(''); setSelectedCityForConstituency(c);
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
    console.log('Submit clicked, form:', electionForm);
  console.log('Validation result:', validateElectionForm());
  if (!validateElectionForm()) return;
  setElectionSubmitting(true);
  try {
    const govDescription = electionForm.type === 'Government'
      ? JSON.stringify({ state: electionForm.state, cities: cityEntries }) : null;
    const allConstituencies = cityEntries.flatMap(c => c.constituencies);
    
    // Check payload size
    const partiesJson = JSON.stringify(partyList);
    if (partiesJson.length > 5000000) {
      toast.error('Party logos are too large! Use smaller images under 500KB.');
      setElectionSubmitting(false);
      return;
    }

    const payload = {
      title: electionForm.title,
      type: electionForm.type,
      status: electionForm.status,
      startTime: electionForm.startTime,
      endTime: electionForm.endTime,
      parties: partiesJson,
      constituency: allConstituencies.join(','),
      description: govDescription,
    };

    console.log('Payload size:', JSON.stringify(payload).length);

    const payloadStr = JSON.stringify(payload);
console.log('Payload size (bytes):', payloadStr.length);
console.log('Parties size (bytes):', partiesJson.length);

    if (editingElection) {
      await updateElection(editingElection.id, payload, token!);
      toast.success('Election updated successfully!');
    } else {
      await addElection(payload, token!);
      toast.success('Election created successfully!');
    }
    setShowElectionModal(false); loadAllData();
  } catch (e: any) { 
      console.error('Full error:', e);
      console.error('Error message:', e?.message);
      toast.error('Failed to save election: ' + e?.message); 
    }
  setElectionSubmitting(false);
};

  const handleDeleteElection = async (id: number) => {
    try {
      await deleteElection(id, token!);
      toast.success('Election deleted!');
      setShowDeleteElectionConfirm(null); loadAllData();
    } catch (e) { toast.error('Failed to delete election.'); }
  };

  const openAddCandidateModal = () => {
    setEditingCandidate(null); setCandidateForm(emptyCandidate);
    setCandidateSelectedCity(''); setCandidateErrors({}); setShowCandidateModal(true);
  };

  const openEditCandidateModal = (c: any) => {
    setEditingCandidate(c);
    setCandidateForm({
  name: c.name || '', age: c.age || '', gender: c.gender || '',
  groupName: c.groupName || '', constituency: c.constituency || '',
  position: c.position || '', phone: c.phone || '',
  description: c.description || '', electionId: c.electionId || '', 
  photo: c.photo || '', dateOfBirth: c.dateOfBirth || ''
});
    const el = elections.find((e: any) => e.id === c.electionId);
    if (el) {
      const govData = getElectionGovData(el);
      if (govData.cities) {
        const cityWithCon = govData.cities.find((city: CityEntry) => city.constituencies.includes(c.constituency));
        if (cityWithCon) setCandidateSelectedCity(cityWithCon.name);
      }
    }
    setCandidateErrors({}); setShowCandidateModal(true);
  };

  const getPartiesForElection = (electionId: string) => {
  const el = elections.find((e: any) => e.id === Number(electionId));
  if (!el || !el.parties) return [];
  try {
    const parsed = JSON.parse(el.parties);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return el.parties.split(',').map((p: string) => ({ name: p.trim(), logo: '' })).filter((p: PartyEntry) => p.name);
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
    if (!candidateForm.age || isNaN(candidateForm.age) || candidateForm.age < 25 || candidateForm.age > 100)
  errors.age = 'Candidate must be at least 25 years old';
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
      setShowCandidateModal(false); loadAllData();
    } catch (e) { toast.error('Failed to save candidate.'); }
    setCandidateSubmitting(false);
  };

  const handleDeleteCandidate = async (id: number) => {
    try {
      await deleteCandidate(id, token!);
      toast.success('Candidate deleted!');
      setShowDeleteCandidateConfirm(null); loadAllData();
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
    a.href = url; a.download = 'evoting-results.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };


const dashboardElection = selectedDashboardElection || elections[0];
const dashboardCandidates = dashboardElection ? candidates.filter((c: any) => c.electionId === dashboardElection.id) : [];
const barData = dashboardCandidates.map((c: any) => ({ name: c.name, votes: c.voteCount }));
const pieData = dashboardCandidates.map((c: any) => ({ name: c.name, value: c.voteCount }));
  const filteredElections = elections.filter((e: any) =>
    (!electionLevelFilter || e.type === electionLevelFilter) &&
    (!electionNameFilter || e.title.toLowerCase().includes(electionNameFilter.toLowerCase()))
  );
   // Calculate stats based on selected dashboard election
const dashboardVotesCast = dashboardCandidates.reduce((sum: number, c: any) => sum + (c.voteCount || 0), 0);
const dashboardTotalVoters = dashboardElection
  ? voters.filter((v: any) => {
      if (dashboardElection.type === 'Government') {
        const govData = getElectionGovData(dashboardElection);
        return v.state && govData.state && v.state.toLowerCase() === govData.state.toLowerCase();
      }
      return true;
    }).length
  : voters.length;
const dashboardTurnout = dashboardTotalVoters > 0
  ? Math.round((dashboardVotesCast / dashboardTotalVoters) * 100)
  : 0;
const activeElectionsCount = elections.filter((e: any) => e.status === 'ACTIVE').length;

const statCards = [
  { icon: Users, label: dashboardElection ? `Registered Voters (${dashboardElection.type === 'Government' ? getElectionGovData(dashboardElection).state || 'All' : 'All'})` : 'Total Registered Voters', value: dashboardTotalVoters, color: 'text-secondary' },
  { icon: Vote, label: 'Votes Cast', value: dashboardVotesCast, color: 'text-info' },
  { icon: TrendingUp, label: 'Voter Turnout', value: `${dashboardTurnout}%`, color: 'text-accent' },
  { icon: Activity, label: 'Active Elections', value: activeElectionsCount, color: 'text-success' },
];

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

              {electionForm.type === 'Government' && (
                <div className="p-4 bg-muted/40 rounded-lg border border-dashed space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">🏛️ Government Election — Location</h3>
                  <div>
                    <label className="text-sm font-medium">State *</label>
                    <select className={`w-full border rounded-md px-3 py-2 text-sm bg-background ${electionErrors.state ? 'border-red-500' : 'border-input'}`}
                      value={electionForm.state}
onChange={e => { 
  const stateName = e.target.value;
  const autoLogo = STATE_EMBLEMS[stateName] || '';
  setElectionForm({ ...electionForm, state: stateName, stateLogo: autoLogo }); 
  setCityEntries([]); setCityInput(''); setSelectedCityForConstituency(''); 
}}>                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {electionErrors.state && <p className="text-xs text-red-500 mt-1">{electionErrors.state}</p>}
                  </div>
                  {electionErrors.state && <p className="text-xs text-red-500 mt-1">{electionErrors.state}</p>}

{/* ADD THIS BLOCK ↓ */}
{electionForm.state && STATE_EMBLEMS[electionForm.state] && (
  <div className="mt-2 flex items-center gap-3 p-2 bg-background rounded-lg border w-fit">
    <img
      src={STATE_EMBLEMS[electionForm.state]}
      alt={electionForm.state}
      className="h-10 w-10 object-contain rounded-full border"
    />
    <span className="text-sm font-medium text-foreground">{electionForm.state}</span>
  </div>
)}
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
                  {cityEntries.length > 0 && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Cities & Constituencies</label>
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
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
    <Input placeholder="e.g. DMK, ADMK" value={partyInput}
      onChange={e => setPartyInput(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && addParty()} />
    <Button type="button" variant="outline" onClick={addParty}>Add</Button>
  </div>
  <div className="flex flex-col gap-2 mt-2">
    {partyList.map((p, i) => (
      <div key={i} className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg border">
        {/* Logo preview */}
        <div className="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
          {p.logo ? (
            <img src={p.logo} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground">Logo</span>
          )}
        </div>
        <span className="text-sm font-medium flex-1">{p.name}</span>
        {/* Upload logo */}
        <label className="cursor-pointer text-xs text-secondary hover:underline">
          {p.logo ? 'Change' : 'Upload Logo'}
          <input type="file" accept="image/*" className="hidden"
            onChange={e => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 2000000) { toast.error('Logo must be under 2MB!'); return; }
  
  // Compress image using canvas
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const maxSize = 100; // resize to max 100x100px
    let { width, height } = img;
    if (width > height) {
      if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
    } else {
      if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, width, height);
    const compressed = canvas.toDataURL('image/jpeg', 0.7);
    setPartyList(partyList.map((party, j) =>
      j === i ? { ...party, logo: compressed } : party
    ));
    URL.revokeObjectURL(url);
  };
  img.src = url;
}} />
        </label>
        <button onClick={() => setPartyList(partyList.filter((_, j) => j !== i))}>
          <X className="h-4 w-4 text-destructive" />
        </button>
      </div>
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
  <label className="text-sm font-medium">Date of Birth *</label>
  <Input
  type="date"
  max={new Date(new Date().getFullYear() - 25, 11, 31)
    .toISOString()
    .split("T")[0]}
  value={candidateForm.dateOfBirth || ''}
  onChange={e => {
    const dob = e.target.value;

    if (!dob) {
      setCandidateForm({ ...candidateForm, dateOfBirth: '', age: '' });
      return;
    }

    const birth = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    setCandidateForm({
      ...candidateForm,
      dateOfBirth: dob,
      age: String(age)
    });
  }}
    className={candidateErrors.age ? 'border-red-500' : ''} />
  {candidateForm.dateOfBirth && (
    <p className="text-xs text-muted-foreground mt-1">
      Age: {candidateForm.age} years
      {Number(candidateForm.age) < 25 && <span className="text-red-500 ml-1">— must be 25+</span>}
    </p>
  )}
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
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {getPartiesForElection(candidateForm.electionId).map((p: any, i: number) => (
                  <div key={i}
                    onClick={() => setCandidateForm({ ...candidateForm, groupName: p.name })}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      candidateForm.groupName === p.name
                        ? 'border-secondary bg-secondary/10 ring-2 ring-secondary/30'
                        : 'border-input hover:border-secondary/50'
                    }`}>
                    <div className="h-8 w-8 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                      {p.logo ? (
                        <img src={p.logo} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-bold">{p.name.slice(0, 2)}</span>
                      )}
                    </div>
                    <span className="text-xs font-medium">{p.name}</span>
                    {candidateForm.groupName === p.name && (
                      <span className="ml-auto text-secondary">✓</span>
                    )}
                  </div>
                ))}
              </div>
              {candidateErrors.groupName && <p className="text-xs text-red-500">{candidateErrors.groupName}</p>}
            </div>
          ) : (
            <Input placeholder={candidateForm.electionId ? 'No parties defined — type freely' : 'Select election first'}
              value={candidateForm.groupName}
              onChange={e => setCandidateForm({ ...candidateForm, groupName: e.target.value })}
              className={candidateErrors.groupName ? 'border-red-500' : ''} />
          )}
          {candidateErrors.groupName && !getPartiesForElection(candidateForm.electionId).length && <p className="text-xs text-red-500 mt-1">{candidateErrors.groupName}</p>}
                  </div>
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
            {/* Election selector for charts */}
<div className="mb-4 flex items-center gap-3">
  <label className="text-sm font-medium text-muted-foreground">View results for:</label>
  <select className="border border-input rounded-md px-3 py-2 text-sm bg-background"
    value={dashboardElection?.id || ''}
    onChange={e => {
      const el = elections.find((el: any) => el.id === Number(e.target.value));
      setSelectedDashboardElection(el || null);
    }}>
    {elections.map((e: any) => (
      <option key={e.id} value={e.id}>{e.title}</option>
    ))}
  </select>
  {dashboardElection && (
    <span className="text-xs text-muted-foreground">
      {dashboardElection.status} • {dashboardCandidates.length} candidates
    </span>
  )}
</div>

<div className="grid gap-6 lg:grid-cols-2">
  <Card className="border-none shadow-md">
    <CardHeader><CardTitle className="text-base">Vote Distribution — {dashboardElection?.title || 'No Elections'}</CardTitle></CardHeader>
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
                <CardHeader><CardTitle className="text-base">Vote Share — {dashboardElection?.title || 'No Elections'}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
  <PieChart>
    <Pie
      data={pieData}
      cx="50%"
      cy="50%"
      outerRadius={80}
      dataKey="value"
      label={({ name, percent, value }) => {
        if (value === 0) return null;
        return `${name} (${(percent * 100).toFixed(0)}%)`;
      }}
      labelLine={false}
    >
      {pieData.map((_, i) => (
        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
      ))}
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
            {/* Filter Bar */}
            <div className="mb-4 flex flex-wrap gap-3 items-center p-4 bg-muted/40 rounded-lg border">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Election:</label>
                <input type="text" placeholder="Search election name..."
                  className="border border-input rounded-md px-3 py-1.5 text-sm bg-background w-full"
                  value={electionNameFilter} onChange={e => setElectionNameFilter(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Level:</label>
                <select className="border border-input rounded-md px-3 py-1.5 text-sm bg-background"
                  value={electionLevelFilter} onChange={e => setElectionLevelFilter(e.target.value)}>
                  <option value="">All Levels</option>
                  <option value="College">College</option>
                  <option value="Department">Department</option>
                  <option value="Government">Government</option>
                </select>
              </div>
              {(electionLevelFilter || electionNameFilter) && (
                <button className="text-xs text-secondary hover:underline"
                  onClick={() => { setElectionLevelFilter(''); setElectionNameFilter(''); }}>
                  Clear filters
                </button>
              )}
              <Badge variant="outline" className="text-xs ml-auto">
                {filteredElections.length} elections
              </Badge>
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
                  {filteredElections.map((e: any) => {
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
                          {e.parties ? (() => {
  try {
    const parsed = JSON.parse(e.parties);
    if (Array.isArray(parsed)) return parsed.map((p: any, i: number) => (
      <span key={i} className="inline-flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded text-xs mr-1 mb-1">
        {p.logo && <img src={p.logo} alt={p.name} className="h-3 w-3 rounded-full object-cover" />}
        {p.name}
      </span>
    ));
  } catch {}
  return e.parties.split(',').map((p: string, i: number) => (
    <span key={i} className="inline-block bg-muted px-1.5 py-0.5 rounded text-xs mr-1 mb-1">{p.trim()}</span>
  ));
})() : '-'}
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

{/* Candidate Filter Bar */}
<div className="mb-4 p-4 bg-muted/40 rounded-lg border">
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">Election</label>
      <select className="w-full border border-input rounded-md px-3 py-1.5 text-sm bg-background"
        value={candidateElectionFilter} onChange={e => { setCandidateElectionFilter(e.target.value); setCandidateStateFilter(''); setCandidateCityFilter(''); setCandidateConstituencyFilter(''); setCandidatePartyFilter(''); }}>
        <option value="">All Elections</option>
        {elections.map((e: any) => <option key={e.id} value={String(e.id)}>{e.title}</option>)}
      </select>
    </div>
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">State</label>
      <select className="w-full border border-input rounded-md px-3 py-1.5 text-sm bg-background"
        value={candidateStateFilter} onChange={e => { setCandidateStateFilter(e.target.value); setCandidateCityFilter(''); setCandidateConstituencyFilter(''); }}>
        <option value="">All States</option>
        {[...new Set(elections.filter((e: any) => {
          try { const d = JSON.parse(e.description || '{}'); return d.state; } catch { return false; }
        }).map((e: any) => { try { return JSON.parse(e.description).state; } catch { return ''; } }))].filter(Boolean).map((s: any, i) => (
          <option key={i} value={s}>{s}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">City</label>
      <select className="w-full border border-input rounded-md px-3 py-1.5 text-sm bg-background"
        value={candidateCityFilter} onChange={e => { setCandidateCityFilter(e.target.value); setCandidateConstituencyFilter(''); }}>
        <option value="">All Cities</option>
        {(() => {
          const el = candidateElectionFilter ? elections.find((e: any) => e.id === Number(candidateElectionFilter)) : null;
          const cities = el ? parseCityEntries(el.description || '') : [];
          return cities.map((c, i) => <option key={i} value={c.name}>{c.name}</option>);
        })()}
      </select>
    </div>
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">Constituency</label>
      <select className="w-full border border-input rounded-md px-3 py-1.5 text-sm bg-background"
        value={candidateConstituencyFilter} onChange={e => setCandidateConstituencyFilter(e.target.value)}>
        <option value="">All Constituencies</option>
        {(() => {
          const el = candidateElectionFilter ? elections.find((e: any) => e.id === Number(candidateElectionFilter)) : null;
          if (!el) return [];
          const cities = parseCityEntries(el.description || '');
          const cityData = candidateCityFilter ? cities.find(c => c.name === candidateCityFilter) : null;
          const cons = cityData ? cityData.constituencies : cities.flatMap(c => c.constituencies);
          return cons.map((c, i) => <option key={i} value={c}>{c}</option>);
        })()}
      </select>
    </div>
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">Party</label>
      <select className="w-full border border-input rounded-md px-3 py-1.5 text-sm bg-background"
        value={candidatePartyFilter} onChange={e => setCandidatePartyFilter(e.target.value)}>
        <option value="">All Parties</option>
        {[...new Set(candidates.map((c: any) => c.groupName).filter(Boolean))].map((p: any, i) => (
          <option key={i} value={p}>{p}</option>
        ))}
      </select>
    </div>
  </div>
  {(candidateElectionFilter || candidateStateFilter || candidateCityFilter || candidateConstituencyFilter || candidatePartyFilter) && (
    <div className="flex items-center justify-between mt-3">
      <Badge variant="outline" className="text-xs">
        {candidates.filter((c: any) => {
          const el = elections.find((e: any) => e.id === c.electionId);
          const govData = el ? getElectionGovData(el) : {};
          return (!candidateElectionFilter || c.electionId === Number(candidateElectionFilter)) &&
            (!candidateStateFilter || govData.state === candidateStateFilter) &&
            (!candidateCityFilter || (() => { const cities = parseCityEntries(el?.description || ''); return cities.find(city => city.name === candidateCityFilter)?.constituencies.includes(c.constituency); })()) &&
            (!candidateConstituencyFilter || c.constituency === candidateConstituencyFilter) &&
            (!candidatePartyFilter || c.groupName === candidatePartyFilter);
        }).length} candidates found
      </Badge>
      <button className="text-xs text-secondary hover:underline"
        onClick={() => { setCandidateElectionFilter(''); setCandidateStateFilter(''); setCandidateCityFilter(''); setCandidateConstituencyFilter(''); setCandidatePartyFilter(''); }}>
        Clear filters
      </button>
    </div>
  )}
</div>

<Card className="border-none shadow-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead><TableHead>Party</TableHead>
<TableHead>Position</TableHead><TableHead>Election</TableHead>
<TableHead>State</TableHead><TableHead>City</TableHead>
<TableHead>Constituency</TableHead>
<TableHead>Votes</TableHead><TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.filter((c: any) => {
  const el = elections.find((e: any) => e.id === c.electionId);
  const govData = el ? getElectionGovData(el) : {};
  return (!candidateElectionFilter || c.electionId === Number(candidateElectionFilter)) &&
    (!candidateStateFilter || govData.state === candidateStateFilter) &&
    (!candidateCityFilter || (() => { const cities = parseCityEntries(el?.description || ''); return cities.find((city: CityEntry) => city.name === candidateCityFilter)?.constituencies.includes(c.constituency); })()) &&
    (!candidateConstituencyFilter || c.constituency === candidateConstituencyFilter) &&
    (!candidatePartyFilter || c.groupName === candidatePartyFilter);
}).map((c: any) => {
  const el = elections.find((e: any) => e.id === c.electionId);
                    return (
                      <TableRow key={c.id}>
                       <TableCell className="font-medium">{c.name}</TableCell>
<TableCell>{c.groupName}</TableCell>
<TableCell>{c.position || '-'}</TableCell>
<TableCell className="text-sm">{el ? el.title : '-'}</TableCell>
<TableCell className="text-sm">{el ? getElectionGovData(el).state || '-' : '-'}</TableCell>
<TableCell className="text-sm">{(() => {
  if (!el) return '-';
  const cities = parseCityEntries(el.description || '');
  const city = cities.find((city: CityEntry) => city.constituencies.includes(c.constituency));
  return city ? city.name : '-';
})()}</TableCell>
<TableCell className="text-sm">{c.constituency || '-'}</TableCell>
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
            <VoterFilterSection token={token!} voters={voters} />
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

  const exportElectionPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('eVoting Results Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Election: ${e.title}`, 14, 30);
    doc.text(`Status: ${e.status} | Level: ${e.type}`, 14, 38);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 46);
    autoTable(doc, {
      startY: 55,
      head: [['Candidate', 'Party', 'Position', 'Constituency', 'Votes']],
      body: eCandidates.map((c: any) => [c.name, c.groupName || '-', c.position || '-', c.constituency || '-', c.voteCount]),
      theme: 'grid',
      headStyles: { fillColor: [0, 168, 120] },
      margin: { left: 14 },
    });
    doc.save(`${e.title}-results.pdf`);
    toast.success(`PDF downloaded for ${e.title}!`);
  };

  const exportElectionCSV = () => {
    let csv = 'Candidate,Party,Position,Constituency,Votes\n';
    eCandidates.forEach((c: any) => {
      csv += `"${c.name}","${c.groupName || ''}","${c.position || ''}","${c.constituency || ''}",${c.voteCount}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${e.title}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`CSV downloaded for ${e.title}!`);
  };

  return (
    <Card key={e.id} className="mb-6 border-none shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{e.title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {e.type} • {e.status}
              {e.endTime && ` • Ends: ${new Date(e.endTime).toLocaleString()}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={exportElectionPDF}>
              <FileText className="mr-2 h-4 w-4" />PDF
            </Button>
            <Button size="sm" variant="outline" onClick={exportElectionCSV}>
              <Download className="mr-2 h-4 w-4" />CSV
            </Button>
          </div>
        </div>
      </CardHeader>
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