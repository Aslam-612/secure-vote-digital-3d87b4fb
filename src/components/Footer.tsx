import { Link } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary">
                <Shield className="h-5 w-5 text-secondary-foreground" />
              </div>
              <span className="font-bold">eVoting Portal</span>
            </div>
            <p className="text-sm opacity-70">{t.portalTitle}</p>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/about" className="hover:opacity-100">{t.about}</Link></li>
              <li><Link to="/how-it-works" className="hover:opacity-100">{t.howItWorks}</Link></li>
              <li><Link to="/elections" className="hover:opacity-100">{t.elections}</Link></li>
              <li><Link to="/guidelines" className="hover:opacity-100">{t.guidelines}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/privacy" className="hover:opacity-100">{t.privacyPolicy}</Link></li>
              <li><Link to="/security-policy" className="hover:opacity-100">{t.securityPolicy}</Link></li>
              <li><Link to="/guidelines" className="hover:opacity-100">{t.votingGuidelines}</Link></li>
              <li><Link to="/faq" className="hover:opacity-100">{t.faq}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">{t.contact}</h3>
            <ul className="space-y-2 text-sm opacity-70">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 1800-XXX-XXXX</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@evoting.in</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> India</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-4">
        <div className="container text-center text-xs opacity-60">
          {t.copyright}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
