import { useI18n } from '@/contexts/I18nContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const Contact = () => {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    toast.success('Message sent successfully!');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="container px-4 py-16">
      <h1 className="mb-8 text-center text-4xl font-bold text-foreground">{t.contact}</h1>
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        <Card className="border-none shadow-md">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 text-secondary" />
              <div><p className="font-medium text-foreground">Phone</p><p className="text-sm text-muted-foreground">1800-XXX-XXXX (Toll Free)</p></div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-5 w-5 text-secondary" />
              <div><p className="font-medium text-foreground">Email</p><p className="text-sm text-muted-foreground">support@evoting.in</p></div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-secondary" />
              <div><p className="font-medium text-foreground">Address</p><p className="text-sm text-muted-foreground">eVoting Portal HQ, India</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder={t.fullName} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={100} />
              <Input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} maxLength={255} />
              <Textarea placeholder="Message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} maxLength={1000} rows={4} />
              <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
