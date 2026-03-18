import { useI18n } from '@/contexts/I18nContext';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getElections } from '@/lib/api';
import { Calendar, Users, Zap } from 'lucide-react';

const Elections = () => {
  const { t } = useI18n();
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getElections().then((data: any) => {
      if (Array.isArray(data)) setElections(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Loading elections...</p>
    </div>
  );

  const activeElections = elections.filter(e => e.status === 'ACTIVE');
  const otherElections = elections.filter(e => e.status !== 'ACTIVE');

  return (
    <div className="container px-4 py-16">
      <h1 className="mb-8 text-center text-4xl font-bold text-foreground">Elections</h1>

      {/* Active Elections — highlighted */}
      {activeElections.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-secondary" />
            <h2 className="text-xl font-bold text-secondary">Active Now</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {activeElections.map(e => (
              <Card key={e.id} className="overflow-hidden border-2 border-secondary shadow-lg ring-2 ring-secondary/20 transition-all hover:shadow-xl">
                <div className="h-1.5 bg-secondary" />
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge className="bg-secondary text-secondary-foreground animate-pulse">🟢 Active</Badge>
                    <span className="text-xs capitalize text-muted-foreground">{e.type}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{e.title}</h3>
                  <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {e.startTime ? new Date(e.startTime).toLocaleDateString() : 'Ongoing'}
                    </span>
                  </div>
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/login">Cast Your Vote →</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other Elections */}
      {otherElections.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">All Elections</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {otherElections.map(e => (
              <Card key={e.id} className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
                <div className={`h-1 ${e.status === 'UPCOMING' ? 'bg-accent' : 'bg-muted-foreground/30'}`} />
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge className={e.status === 'UPCOMING' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}>
                      {e.status}
                    </Badge>
                    <span className="text-xs capitalize text-muted-foreground">{e.type}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{e.title}</h3>
                  <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {e.startTime ? new Date(e.startTime).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {elections.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No elections available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default Elections;