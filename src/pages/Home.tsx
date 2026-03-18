import { Link } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Eye, Globe, Zap, Vote, Users, BarChart3, Lock } from 'lucide-react';
import { getElections } from '@/lib/api';

const features = [
  { icon: Shield, title: 'Bank-Grade Security', desc: 'AES-256 encryption protects every vote cast.' },
  { icon: Eye, title: 'Full Transparency', desc: 'Real-time audit trails and verifiable receipts.' },
  { icon: Globe, title: 'Universal Access', desc: 'Vote from anywhere, in your preferred language.' },
  { icon: Zap, title: 'Instant Results', desc: 'Live vote counting with real-time dashboards.' },
];

const Home = () => {
  const { t } = useI18n();
  const [activeElections, setActiveElections] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { icon: Users, value: '0', label: 'Registered Voters' },
    { icon: Vote, value: '0', label: 'Votes Cast Today' },
    { icon: BarChart3, value: '0', label: 'Active Elections' },
    { icon: Lock, value: '100%', label: 'Encrypted Votes' },
  ]);

  useEffect(() => {
    getElections().then((data: any[]) => {
      if (!Array.isArray(data)) return;
      const active = data.filter((e: any) => e.status === 'ACTIVE');
      setActiveElections(active);
      setStats([
        { icon: Users, value: '-', label: 'Registered Voters' },
        { icon: Vote, value: '-', label: 'Votes Cast Today' },
        { icon: BarChart3, value: String(active.length), label: 'Active Elections' },
        { icon: Lock, value: '100%', label: 'Encrypted Votes' },
      ]);
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary px-4 py-20 text-primary-foreground md:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container relative text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary animate-pulse-glow">
            <Shield className="h-8 w-8 text-secondary-foreground" />
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">Your Vote, Your Voice</h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg opacity-80 md:text-xl">
            Secure, transparent, and accessible digital voting for colleges, organizations, and public elections.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="text-base font-semibold">
              <Link to="/login">Get Started</Link>
            </Button>
            <Button asChild size="lg" className="text-base bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary">
  <Link to="/elections">View Elections</Link>
</Button>
          </div>
        </div>
      </section>

      {/* Stats — properly below hero with padding */}
      <section className="px-4 py-10 bg-background">
        <div className="container">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Card key={i} className="border-none bg-card shadow-lg">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
                    <s.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Why Choose eVoting?</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <Card key={i} className="group border-none bg-card shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 transition-colors group-hover:bg-secondary">
                    <f.icon className="h-7 w-7 text-secondary transition-colors group-hover:text-secondary-foreground" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Active Elections — from real backend */}
      {activeElections.length > 0 && (
        <section className="bg-muted/50 px-4 py-20">
          <div className="container">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">Active Elections</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {activeElections.map((e: any) => (
                <Card key={e.id} className="overflow-hidden border-none shadow-md">
                  <div className="h-1 bg-secondary" />
                  <CardContent className="p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">Active</span>
                      <span className="text-xs text-muted-foreground capitalize">{e.type}</span>
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-foreground">{e.title}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {e.startTime ? new Date(e.startTime).toLocaleDateString() : 'Ongoing'}
                    </p>
                    <Button asChild variant="secondary" size="sm">
                      <Link to="/login">Cast Your Vote</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;