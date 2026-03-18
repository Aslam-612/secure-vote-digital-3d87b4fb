import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getAdminCandidates, getAdminElections } from '@/lib/api';
import { User } from 'lucide-react';

const Candidates = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [elections, setElections] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/api/voting/elections').then(r => r.json()),
      fetch('http://localhost:8080/api/voting/elections').then(r => r.json())
    ]).catch(() => {});

    // Fetch elections publicly
    fetch('http://localhost:8080/api/voting/elections')
      .then(r => r.json())
      .then(async (electionsData: any[]) => {
        if (!Array.isArray(electionsData)) return;
        setElections(electionsData);
        // Fetch candidates for each election
        const allCandidates: any[] = [];
        for (const e of electionsData) {
          try {
            const res = await fetch(`http://localhost:8080/api/voting/elections/${e.id}/candidates`);
            const cands = await res.json();
            if (Array.isArray(cands)) {
              allCandidates.push(...cands.map((c: any) => ({ ...c, electionId: e.id, electionTitle: e.title })));
            }
          } catch {}
        }
        setCandidates(allCandidates);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? candidates : candidates.filter(c => c.electionId === Number(filter));

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Loading candidates...</p>
    </div>
  );

  return (
    <div className="container px-4 py-16">
      <h1 className="mb-8 text-center text-4xl font-bold text-foreground">Candidates</h1>

      {/* Filter by election */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button onClick={() => setFilter('all')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filter === 'all' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
          All
        </button>
        {elections.map((e: any) => (
          <button key={e.id} onClick={() => setFilter(String(e.id))}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filter === String(e.id) ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {e.title}
          </button>
        ))}
      </div>

      {/* Candidates Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No candidates found.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c: any) => (
            <Card key={c.id} className="border-none shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-muted">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">{c.name}</h3>
                  <p className="mb-1 text-sm font-medium text-secondary">{c.groupName || '-'}</p>
                  {c.position && <p className="mb-1 text-xs text-muted-foreground">Position: {c.position}</p>}
                  {c.constituency && <p className="mb-1 text-xs text-muted-foreground">Constituency: {c.constituency}</p>}
                  {c.description && <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">{c.electionTitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Candidates;