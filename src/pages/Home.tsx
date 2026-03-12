import { Link } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Eye, Globe, Zap, Vote, Users, BarChart3, Lock } from 'lucide-react';
import { elections } from '@/data/mockData';

const features = [
  { icon: Shield, titleKey: 'featSecure' as const, descKey: 'featSecureDesc' as const },
  { icon: Eye, titleKey: 'featTransparent' as const, descKey: 'featTransparentDesc' as const },
  { icon: Globe, titleKey: 'featAccessible' as const, descKey: 'featAccessibleDesc' as const },
  { icon: Zap, titleKey: 'featFast' as const, descKey: 'featFastDesc' as const },
];

const stats = [
  { icon: Users, value: '15,665', label: 'Registered Voters' },
  { icon: Vote, value: '390', label: 'Votes Cast Today' },
  { icon: BarChart3, value: '4', label: 'Active Elections' },
  { icon: Lock, value: '100%', label: 'Encrypted Votes' },
];

const Home = () => {
  const { t, lang } = useI18n();
  const activeElections = elections.filter(e => e.status === 'active');

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
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl animate-fade-in">{t.heroTitle}</h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg opacity-80 md:text-xl">{t.heroSubtitle}</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="text-base font-semibold">
              <Link to="/login">{t.getStarted}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-base text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/elections">{t.viewElections}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="-mt-8 px-4">
        <div className="container">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Card key={i} className="border-none bg-card shadow-lg animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
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
                  <h3 className="mb-2 font-semibold text-foreground">{t[f.titleKey]}</h3>
                  <p className="text-sm text-muted-foreground">{t[f.descKey]}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Active Elections */}
      {activeElections.length > 0 && (
        <section className="bg-muted/50 px-4 py-20">
          <div className="container">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">{t.activeElections}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {activeElections.map(e => (
                <Card key={e.id} className="overflow-hidden border-none shadow-md">
                  <div className="h-1 bg-secondary" />
                  <CardContent className="p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">{t.active}</span>
                      <span className="text-xs text-muted-foreground">{Math.round((e.votesCast / e.totalVoters) * 100)}% turnout</span>
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-foreground">{lang === 'ta' ? e.titleTa : e.title}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">{e.totalVoters} voters • {e.votesCast} votes cast</p>
                    <Button asChild variant="secondary" size="sm">
                      <Link to="/login">{t.castVote}</Link>
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
