import { useI18n } from '@/contexts/I18nContext';
import { elections } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock } from 'lucide-react';

const Schedule = () => {
  const { t, lang } = useI18n();

  return (
    <div className="container px-4 py-16">
      <h1 className="mb-8 text-center text-4xl font-bold text-foreground">{t.schedule}</h1>
      <div className="overflow-hidden rounded-lg border bg-card shadow-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>{t.name}</TableHead>
              <TableHead>{t.type}</TableHead>
              <TableHead>{t.startTime}</TableHead>
              <TableHead>{t.endTime}</TableHead>
              <TableHead>{t.status}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {elections.map(e => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{lang === 'ta' ? e.titleTa : e.title}</TableCell>
                <TableCell className="capitalize">{e.type}</TableCell>
                <TableCell><span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(e.startTime).toLocaleString()}</span></TableCell>
                <TableCell><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(e.endTime).toLocaleString()}</span></TableCell>
                <TableCell><Badge variant={e.status === 'active' ? 'default' : 'secondary'} className={e.status === 'active' ? 'bg-secondary text-secondary-foreground' : ''}>{t[e.status as keyof typeof t]}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Schedule;
