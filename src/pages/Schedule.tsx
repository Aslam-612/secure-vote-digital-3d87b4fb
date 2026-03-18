import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock } from 'lucide-react';

const Schedule = () => {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/voting/elections')
      .then(r => r.json())
      .then((data: any) => { if (Array.isArray(data)) setElections(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'ACTIVE') return 'bg-secondary text-secondary-foreground';
    if (status === 'UPCOMING') return 'bg-accent text-accent-foreground';
    return 'bg-muted text-muted-foreground';
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Loading schedule...</p>
    </div>
  );

  return (
    <div className="container px-4 py-16">
      <h1 className="mb-8 text-center text-4xl font-bold text-foreground">Election Schedule</h1>
      <div className="overflow-hidden rounded-lg border bg-card shadow-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {elections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No elections scheduled.
                </TableCell>
              </TableRow>
            ) : (
              elections.map((e: any) => (
                <TableRow key={e.id} className={e.status === 'ACTIVE' ? 'bg-secondary/5 border-l-4 border-l-secondary' : ''}>
                  <TableCell className="font-medium">{e.title}</TableCell>
                  <TableCell className="capitalize">{e.type}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {e.startTime ? new Date(e.startTime).toLocaleString() : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {e.endTime ? new Date(e.endTime).toLocaleString() : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(e.status)}>{e.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Schedule;