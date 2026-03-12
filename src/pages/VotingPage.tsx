import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { candidates, elections } from '@/data/mockData';
import { User, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const VotingPage = () => {
  const { t, lang } = useI18n();
  const { assignedElectionId, hasVoted, markVoted, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [receiptId, setReceiptId] = useState('');
  const [voted, setVoted] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (hasVoted || voted) {
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
              <p className="font-mono text-lg font-bold text-foreground">{receiptId || 'EVR-XXXXXX'}</p>
            </div>
            <Button onClick={() => navigate('/')} variant="secondary" className="w-full">{t.backToHome}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const election = elections.find(e => e.id === assignedElectionId);
  const electionCandidates = candidates.filter(c => c.electionId === assignedElectionId);

  const handleVote = () => {
    if (!selectedCandidate) return;
    setShowConfirm(true);
  };

  const confirmVote = () => {
    // Generate receipt
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    const receipt = 'EVR-' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase().slice(0, 12);
    setReceiptId(receipt);
    markVoted();
    setVoted(true);
    setShowConfirm(false);
    toast.success(t.voteSuccess);
  };

  return (
    <div className="container px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">{t.castVote}</h1>
          {election && (
            <p className="text-lg text-muted-foreground">{lang === 'ta' ? election.titleTa : election.title}</p>
          )}
        </div>

        <div className="mb-6 rounded-lg border border-accent/50 bg-accent/10 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-accent-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>Select your candidate and click Vote. This action is <strong>irreversible</strong>.</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {electionCandidates.map(c => (
            <Card key={c.id} className={`cursor-pointer border-2 transition-all hover:shadow-lg ${selectedCandidate === c.id ? 'border-secondary shadow-lg ring-2 ring-secondary/30' : 'border-transparent'}`}
              onClick={() => setSelectedCandidate(c.id)}>
              <CardContent className="p-6">
                <div className="mb-3 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">{lang === 'ta' ? c.nameTa : c.name}</h3>
                  <p className="mb-2 text-sm font-medium text-secondary">{lang === 'ta' ? c.partyTa : c.party}</p>
                  <p className="text-xs text-muted-foreground">{lang === 'ta' ? c.descriptionTa : c.description}</p>
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
          <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-12" disabled={!selectedCandidate} onClick={handleVote}>
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
                {lang === 'ta' ? electionCandidates.find(c => c.id === selectedCandidate)?.nameTa : electionCandidates.find(c => c.id === selectedCandidate)?.name}
              </p>
              <p className="text-sm text-secondary">
                {lang === 'ta' ? electionCandidates.find(c => c.id === selectedCandidate)?.partyTa : electionCandidates.find(c => c.id === selectedCandidate)?.party}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>{t.cancel}</Button>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={confirmVote}>{t.confirm}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VotingPage;
