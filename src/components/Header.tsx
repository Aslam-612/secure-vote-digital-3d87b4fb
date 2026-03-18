import { useState } from 'react';
import { Link, NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, Phone, Globe, Menu, X, User, LogOut, Settings } from 'lucide-react';

const Header = () => {
  const { t, toggleLang } = useI18n();
  const { user, isAdmin, logout } = useAuth();
  const isAuthenticated = !!user;
  const role = isAdmin ? 'admin' : 'voter';
  const name = user?.name || '';
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: t.home, path: '/' },
    { label: t.about, path: '/about' },
    { label: t.howItWorks, path: '/how-it-works' },
    { label: t.elections, path: '/elections' },
    { label: t.candidates, path: '/candidates' },
    { label: t.schedule, path: '/schedule' },
    { label: t.faq, path: '/faq' },
    { label: t.contact, path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-primary text-primary-foreground shadow-lg">
      {/* Top bar */}
      <div className="border-b border-primary-foreground/10 bg-primary/95">
        <div className="container flex h-8 items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" />
            <span>{t.helpline}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary-foreground hover:bg-primary-foreground/10" onClick={toggleLang}>
              <Globe className="mr-1 h-3 w-3" />
              {t.langToggle}
            </Button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Shield className="h-6 w-6 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight md:text-base">{t.portalTitle}</h1>
            <p className="text-[10px] opacity-70">eVoting Portal</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map(item => (
            <RouterNavLink key={item.path} to={item.path}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-primary-foreground/10 ${isActive ? 'bg-secondary text-secondary-foreground' : ''}`
              }>
              {item.label}
            </RouterNavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs md:inline">
                <User className="mr-1 inline h-3 w-3" />{name}
              </span>
              {role === 'admin' && (
                <Button variant="ghost" size="sm" className="text-xs text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/admin')}>
                  <Settings className="mr-1 h-3 w-3" />{t.dashboard}
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-xs text-primary-foreground hover:bg-primary-foreground/10" onClick={() => { logout(); navigate('/'); }}>
                <LogOut className="mr-1 h-3 w-3" />{t.logout}
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="secondary" size="sm" className="text-xs" onClick={() => navigate('/login')}>
                {t.login}
              </Button>
              <Button variant="ghost" size="sm" className="text-xs text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/admin-login')}>
                {t.adminLogin}
              </Button>
            </div>
          )}
          <Button variant="ghost" size="sm" className="text-primary-foreground lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-primary-foreground/10 bg-primary p-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map(item => (
              <RouterNavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary-foreground/10 ${isActive ? 'bg-secondary text-secondary-foreground' : ''}`
                }>
                {item.label}
              </RouterNavLink>
            ))}
            {!isAuthenticated && (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="mt-2 rounded-md bg-secondary px-3 py-2 text-center text-sm font-medium text-secondary-foreground">
                  {t.login}
                </Link>
                <Link to="/admin-login" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-center text-sm hover:bg-primary-foreground/10">
                  {t.adminLogin}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;