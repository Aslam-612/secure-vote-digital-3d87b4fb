import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { User, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getElections, getCandidates, castVote } from '@/lib/api';

const VotingPage = () => {
  const { t, lang } = useI18n();
  const { user, token, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [elections, setElections] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [receiptId, setReceiptId] = useState('');
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!token || isAdmin) {
      navigate('/login');
    }
  }, [token, isAdmin, navigate]);

  // Load active elections
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const data = await getElections();
        const active = data.filter((e: any) => e.status === 'ACTIVE');
        setElections(active);
        if (active.length > 0) {
          setSelectedElection(active[0]);
          loadCandidates(active[0].id);
        }
      } catch (e) {
        toast.error('Could not load elections.');
      }
    };
    if (token) fetchElections();
  }, [token]);

  const loadCandidates = async (electionId: number) => {
    try {
      const data = await getCandidates(electionId);
      setCandidates(data);
    } catch (e) {
      toast.error('Could not load candidates.');
    }
  };

  const handleElectionChange = (election: any) => {
    setSelectedElection(election);
    setSelectedCandidate(null);
    loadCandidates(election.id);
  };

  const handleVote = () => {
    if (!selectedCandidate) return;
    setShowConfirm(true);
  };

  const confirmVote = async () => {
    if (!selectedCandidate || !selectedElection || !token) return;
    setLoading(true);
    try {
      const result = await castVote(selectedElection.id, selectedCandidate, token);
      if (result.status === 'SUCCESS') {
        setReceiptId(result.receiptId);
        setVoted(true);
        setShowConfirm(false);
        toast.success('Vote cast successfully!');
      } else {
        toast.error(result.message || 'Could not cast vote.');
        setShowConfirm(false);
      }
    } catch (e) {
      toast.error('Could not connect to server.');
      setShowConfirm(false);
    }
    setLoading(false);
  };

  // Already voted screen
  if (voted) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md border-none text-center shadow-xl">
          <CardContent className="p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">{t.voteSuccess}</h2>
            <div className="mb-6 rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">{t.receiptId}</p>
              <p className="font-mono text-lg font-bold text-foreground">{receiptId}</p>
            </div>
            <Button onClick={() => navigate('/')} variant="secondary" className="w-full">
              {t.backToHome}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">{t.castVote}</h1>
          {selectedElection && (
            <p className="text-lg text-muted-foreground">{selectedElection.title}</p>
          )}
        </div>

        {/* Election selector if multiple */}
        {elections.length > 1 && (
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {elections.map((e: any) => (
              <Button
                key={e.id}
                variant={selectedElection?.id === e.id ? 'default' : 'outline'}
                onClick={() => handleElectionChange(e)}
              >
                {e.title}
              </Button>
            ))}
          </div>
        )}

        <div className="mb-6 rounded-lg border border-accent/50 bg-accent/10 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-accent-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>Select your candidate and click Vote. This action is <strong>irreversible</strong>.</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {candidates.map((c: any) => (
            <Card
              key={c.id}
              className={`cursor-pointer border-2 transition-all hover:shadow-lg ${
                selectedCandidate === c.id
                  ? 'border-secondary shadow-lg ring-2 ring-secondary/30'
                  : 'border-transparent'
              }`}
              onClick={() => setSelectedCandidate(c.id)}
            >
              <CardContent className="p-6">
                <div className="mb-3 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">{c.name}</h3>
                  <p className="mb-2 text-sm font-medium text-secondary">{c.groupName}</p>
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                </div>
                {selectedCandidate === c.id && (
                  <div className="mt-3 flex justify-center">
                    <CheckCircle2 className="h-6 w-6 text-secondary" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button
            size="lg"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-12"
            disabled={!selectedCandidate}
            onClick={handleVote}
          >
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
          {selectedCandidate && (
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="font-semibold text-foreground">
                {candidates.find(c => c.id === selectedCandidate)?.name}
              </p>
              <p className="text-sm text-secondary">
                {candidates.find(c => c.id === selectedCandidate)?.groupName}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              {t.cancel}
            </Button>
            <Button
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={confirmVote}
              disabled={loading}
            >
              {loading ? 'Voting...' : t.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VotingPage;