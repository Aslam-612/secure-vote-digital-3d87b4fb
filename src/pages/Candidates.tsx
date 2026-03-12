import { useI18n } from '@/contexts/I18nContext';
import { Card, CardContent } from '@/components/ui/card';
import { candidates, elections } from '@/data/mockData';
import { User } from 'lucide-react';
import { useState } from 'react';

const Candidates = () => {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? candidates : candidates.filter(c => c.electionId === filter);

  return (
    <div className="container px-4 py-16">
      <h1 className="mb-8 text-center text-4xl font-bold text-foreground">{t.candidates}</h1>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button onClick={() => setFilter('all')} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filter === 'all' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>All</button>
        {elections.map(e => (
          <button key={e.id} onClick={() => setFilter(e.id)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filter === e.id ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {lang === 'ta' ? e.titleTa : e.title}
          </button>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(c => (
          <Card key={c.id} className="border-none shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-muted">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">{lang === 'ta' ? c.nameTa : c.name}</h3>
                <p className="mb-2 text-sm font-medium text-secondary">{lang === 'ta' ? c.partyTa : c.party}</p>
                <p className="text-sm text-muted-foreground">{lang === 'ta' ? c.descriptionTa : c.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Candidates;
