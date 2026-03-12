import { useI18n } from '@/contexts/I18nContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { elections } from '@/data/mockData';
import { Calendar, Users } from 'lucide-react';

const statusColor = (s: string) => {
  if (s === 'active') return 'bg-secondary text-secondary-foreground';
  if (s === 'upcoming') return 'bg-accent text-accent-foreground';
  return 'bg-muted text-muted-foreground';
};

const Elections = () => {
  const { t, lang } = useI18n();

  return (
    <div className="container px-4 py-16">
      <h1 className="mb-8 text-center text-4xl font-bold text-foreground">{t.elections}</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {elections.map(e => (
          <Card key={e.id} className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
            <div className={`h-1 ${e.status === 'active' ? 'bg-secondary' : e.status === 'upcoming' ? 'bg-accent' : 'bg-muted-foreground/30'}`} />
            <CardContent className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <Badge className={statusColor(e.status)}>{t[e.status as keyof typeof t]}</Badge>
                <span className="text-xs capitalize text-muted-foreground">{e.type}</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{lang === 'ta' ? e.titleTa : e.title}</h3>
              <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(e.startTime).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" />{e.totalVoters} voters</span>
              </div>
              {e.status === 'active' && (
                <div className="mb-4">
                  <div className="mb-1 flex justify-between text-xs"><span>{t.voterTurnout}</span><span>{Math.round((e.votesCast / e.totalVoters) * 100)}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${(e.votesCast / e.totalVoters) * 100}%` }} />
                  </div>
                </div>
              )}
              {e.status === 'active' && (
                <Button asChild variant="secondary" size="sm"><Link to="/login">{t.castVote}</Link></Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Elections;
