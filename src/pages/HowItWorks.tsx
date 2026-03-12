import { useI18n } from '@/contexts/I18nContext';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, ShieldCheck, Vote, Receipt } from 'lucide-react';

const HowItWorks = () => {
  const { t } = useI18n();
  const steps = [
    { icon: UserPlus, title: t.step1Title, desc: t.step1Desc, num: '01' },
    { icon: ShieldCheck, title: t.step2Title, desc: t.step2Desc, num: '02' },
    { icon: Vote, title: t.step3Title, desc: t.step3Desc, num: '03' },
    { icon: Receipt, title: t.step4Title, desc: t.step4Desc, num: '04' },
  ];

  return (
    <div className="container px-4 py-16">
      <h1 className="mb-12 text-center text-4xl font-bold text-foreground">{t.howTitle}</h1>
      <div className="mx-auto max-w-3xl">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-6 pb-12 last:pb-0">
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground font-bold text-lg">
                {s.num}
              </div>
              {i < steps.length - 1 && <div className="mt-2 h-full w-0.5 bg-border" />}
            </div>
            <Card className="flex-1 border-none shadow-md">
              <CardContent className="p-6">
                <div className="mb-2 flex items-center gap-3">
                  <s.icon className="h-5 w-5 text-secondary" />
                  <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
