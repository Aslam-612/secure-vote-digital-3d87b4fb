import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { CheckCircle2, AlertTriangle, MapPin, Building, User } from 'lucide-react';
import { toast } from 'sonner';
import { getElections, getCandidates, castVote } from '@/lib/api';
import { STATE_EMBLEMS } from '@/lib/stateEmblems';

const VotingPage = () => {
  const { t } = useI18n();
  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [elections, setElections] = useState<any[]>([]);
  const [allCandidates, setAllCandidates] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [receiptId, setReceiptId] = useState('');
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedCity, setSelectedCity] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [constituencies, setConstituencies] = useState<string[]>([]);

  useEffect(() => {
    if (!token || isAdmin) navigate('/login');
  }, [token, isAdmin, navigate]);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const data = await getElections();
        const active = data.filter((e: any) => e.status === 'ACTIVE');
        setElections(active);
        if (active.length > 0) {
          setSelectedElection(active[0]);
          await loadCandidates(active[0]);
        }
      } catch (e) { toast.error('Could not load elections.'); }
    };
    if (token) fetchElections();
  }, [token]);

  const getPartyLogo = (election: any, groupName: string): string => {
    if (!election?.parties) return '';
    try {
      const parsed = JSON.parse(election.parties);
      if (Array.isArray(parsed)) {
        const party = parsed.find((p: any) => p.name === groupName);
        return party?.logo || '';
      }
    } catch {}
    return '';
  };

  const loadCandidates = async (election: any) => {
    try {
      const data = await getCandidates(election.id);
      setAllCandidates(data);
      setCandidates(data);
      setSelectedCity(''); setSelectedConstituency('');
      if (election.type === 'Government' && election.description) {
        try {
          const govData = JSON.parse(election.description);
          if (govData.cities) setCities(govData.cities.map((c: any) => c.name));
        } catch {}
      } else {
        setCities([]);
        const uniqueConstituencies = [...new Set(data.map((c: any) => c.constituency).filter(Boolean))] as string[];
        setConstituencies(uniqueConstituencies);
      }
    } catch (e) { toast.error('Could not load candidates.'); }
  };

  const handleElectionChange = async (election: any) => {
    setSelectedElection(election); setSelectedCandidate(null);
    await loadCandidates(election);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city); setSelectedConstituency('');
    if (!city) { setCandidates(allCandidates); setConstituencies([]); return; }
    if (selectedElection?.description) {
      try {
        const govData = JSON.parse(selectedElection.description);
        const cityData = govData.cities?.find((c: any) => c.name === city);
        setConstituencies(cityData?.constituencies || []);
        const cityConstituencies = cityData?.constituencies || [];
        setCandidates(allCandidates.filter((c: any) => !c.constituency || cityConstituencies.includes(c.constituency)));
      } catch { setCandidates(allCandidates); }
    }
  };

  const handleConstituencyChange = (constituency: string) => {
    setSelectedConstituency(constituency);
    if (!constituency) { handleCityChange(selectedCity); return; }
    setCandidates(allCandidates.filter((c: any) => c.constituency === constituency));
  };

  const confirmVote = async () => {
    if (!selectedCandidate || !selectedElection || !token) return;
    setLoading(true);
    try {
      const result = await castVote(selectedElection.id, selectedCandidate, token);
      if (result.status === 'SUCCESS') {
        setReceiptId(result.receiptId); setVoted(true); setShowConfirm(false);
        toast.success('Vote cast successfully!');
      } else {
        toast.error(result.message || 'Could not cast vote.'); setShowConfirm(false);
      }
    } catch (e) { toast.error('Could not connect to server.'); setShowConfirm(false); }
    setLoading(false);
  };

  // Get election state
  const getElectionState = (election: any) => {
    try { return JSON.parse(election?.description || '{}').state || ''; } catch { return ''; }
  };

  const getElectionStateEmblem = (election: any) => {
    const state = getElectionState(election);
    return state ? STATE_EMBLEMS[state] || '' : '';
  };

  // Get candidate city from election data
  const getCandidateCity = (election: any, constituency: string) => {
    try {
      const govData = JSON.parse(election?.description || '{}');
      const city = govData.cities?.find((c: any) => c.constituencies?.includes(constituency));
      return city?.name || '';
    } catch { return ''; }
  };

  if (voted) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md border-none text-center shadow-xl">
          <CardContent className="p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">{t.voteSuccess}</h2>
            <div className="mb-6 rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">{t.receiptId}</p>
              <p className="font-mono text-lg font-bold text-foreground">{receiptId}</p>
            </div>
            <Button onClick={() => navigate('/')} variant="secondary" className="w-full">{t.backToHome}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedCandidateData = candidates.find(c => c.id === selectedCandidate);

  return (
    <div className="container px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
<div className="mb-8 text-center">
  
  <h1 className="mb-2 text-3xl font-bold text-foreground">{t.castVote}</h1>
  {selectedElection && getElectionStateEmblem(selectedElection) && (
    <div className="mb-3 flex justify-center">
      <img
  src={getElectionStateEmblem(selectedElection)}
  onError={(e) => {
    e.currentTarget.src = "/state-emblems/default.png";
  }}
  alt={`${getElectionState(selectedElection)} emblem`}
  className="h-16 w-16 rounded-full border bg-card object-contain p-1 shadow-sm"
/>
    </div>
  )}
  {selectedElection && (
    <div className="flex flex-col items-center gap-1">
      <p className="text-lg text-muted-foreground">{selectedElection.title}</p>
      {getElectionState(selectedElection) && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {getElectionState(selectedElection)}
        </span>
      )}
    </div>
  )}
</div>
        {/* Election selector */}
        {elections.length > 1 && (
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {elections.map((e: any) => (
              <Button key={e.id}
                variant={selectedElection?.id === e.id ? 'default' : 'outline'}
                onClick={() => handleElectionChange(e)}>
                {e.title}
              </Button>
            ))}
          </div>
        )}

        {/* City & Constituency Filter */}
        {(cities.length > 0 || constituencies.length > 0) && (
          <div className="mb-6 p-4 bg-muted/40 rounded-lg border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">🗺️ Filter by Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cities.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> City
                  </label>
                  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                    value={selectedCity} onChange={e => handleCityChange(e.target.value)}>
                    <option value="">All Cities</option>
                    {cities.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
              {constituencies.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Building className="h-3 w-3" /> Constituency
                  </label>
                  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                    value={selectedConstituency} onChange={e => handleConstituencyChange(e.target.value)}
                    disabled={cities.length > 0 && !selectedCity}>
                    <option value="">All Constituencies</option>
                    {constituencies.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>
            {(selectedCity || selectedConstituency) && (
              <button className="mt-2 text-xs text-secondary hover:underline"
                onClick={() => { setSelectedCity(''); setSelectedConstituency(''); setCandidates(allCandidates); setConstituencies([]); }}>
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Warning */}
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <span>Select your candidate and click Vote. This action is <strong>irreversible</strong>.</span>
          </div>
        </div>

        {/* Candidates */}
        {candidates.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>No candidates found for the selected filter.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {candidates.map((c: any) => {
              const partyLogo = getPartyLogo(selectedElection, c.groupName);
              const candidateCity = getCandidateCity(selectedElection, c.constituency);
              const electionState = getElectionState(selectedElection);
              const isSelected = selectedCandidate === c.id;

              return (
                <div key={c.id}
                  onClick={() => setSelectedCandidate(c.id)}
                  className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-200 hover:shadow-xl bg-card overflow-hidden ${
                    isSelected
                      ? 'border-secondary shadow-xl ring-4 ring-secondary/20 scale-[1.02]'
                      : 'border-border hover:border-secondary/50 hover:scale-[1.01]'
                  }`}>

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Party color banner */}
                  <div className={`h-2 w-full ${isSelected ? 'bg-secondary' : 'bg-muted'}`} />

                  <div className="p-5">
                    {/* Party Logo — BIG */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className="h-24 w-24 flex items-center justify-center">
  {partyLogo ? (
    <img src={partyLogo} alt={c.groupName} className="h-24 w-24 object-contain" />
  ) : (
    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
      <User className="h-10 w-10 text-muted-foreground" />
    </div>
  )}
</div>
                        {/* Party name badge */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <span className="bg-secondary text-secondary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                            {c.groupName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Candidate Name */}
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-bold text-foreground">{c.name}</h3>
                      {c.position && (
                        <p className="text-sm text-muted-foreground mt-0.5">{c.position}</p>
                      )}
                    </div>

                    {/* Location Info */}
                    <div className="mt-4 space-y-1.5 rounded-lg bg-muted/50 p-3">
                      {c.constituency && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Building className="h-3 w-3 shrink-0 text-secondary" />
                          <span className="font-medium text-foreground">{c.constituency}</span>
                          <span className="text-muted-foreground">constituency</span>
                        </div>
                      )}
                      {candidateCity && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0 text-secondary" />
                          <span className="font-medium text-foreground">{candidateCity}</span>
                          <span className="text-muted-foreground">city</span>
                        </div>
                      )}
                      {electionState && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="text-secondary">🏛️</span>
                          <span className="font-medium text-foreground">{electionState}</span>
                          <span className="text-muted-foreground">state</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {c.description && (
                      <p className="mt-3 text-xs text-muted-foreground text-center line-clamp-2">{c.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Button size="lg"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-16 py-6 text-base rounded-xl shadow-lg"
            disabled={!selectedCandidate}
            onClick={() => setShowConfirm(true)}>
            {t.castVote}
          </Button>
        </div>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.confirmVote}</DialogTitle>
            <DialogDescription>{t.confirmVoteMsg}</DialogDescription>
          </DialogHeader>
          {selectedCandidateData && (
            <div className="rounded-lg bg-muted p-4 text-center space-y-2">
              {/* Party logo in confirm dialog */}
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full border-2 border-muted bg-background flex items-center justify-center overflow-hidden">
                  {getPartyLogo(selectedElection, selectedCandidateData.groupName) ? (
                    <img src={getPartyLogo(selectedElection, selectedCandidateData.groupName)}
                      alt={selectedCandidateData.groupName} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              </div>
              <p className="font-bold text-lg text-foreground">{selectedCandidateData.name}</p>
              <p className="text-sm text-secondary font-medium">{selectedCandidateData.groupName}</p>
              {selectedCandidateData.constituency && (
                <p className="text-xs text-muted-foreground">📍 {selectedCandidateData.constituency}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>{t.cancel}</Button>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={confirmVote} disabled={loading}>
              {loading ? 'Voting...' : t.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VotingPage;