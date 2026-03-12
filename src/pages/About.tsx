import { useI18n } from '@/contexts/I18nContext';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Users, Globe, Server, Eye } from 'lucide-react';

const About = () => {
  const { t } = useI18n();
  const pillars = [
    { icon: Lock, title: 'End-to-End Encryption', desc: 'Every vote is encrypted with AES-256 before storage.' },
    { icon: Users, title: 'Universal Access', desc: 'Designed for colleges, corporations, and public elections.' },
    { icon: Globe, title: 'Multilingual', desc: 'Full support for English and Tamil languages.' },
    { icon: Server, title: 'Scalable Architecture', desc: 'Built to handle thousands of concurrent voters.' },
    { icon: Eye, title: 'Transparent Process', desc: 'Complete audit trails for every action.' },
    { icon: Shield, title: 'Tamper-Proof', desc: 'Atomic transactions prevent duplicate or fraudulent votes.' },
  ];

  return (
    <div className="container px-4 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">{t.aboutTitle}</h1>
        <p className="mb-12 text-lg text-muted-foreground">{t.aboutDesc}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pillars.map((p, i) => (
          <Card key={i} className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                <p.icon className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default About;
