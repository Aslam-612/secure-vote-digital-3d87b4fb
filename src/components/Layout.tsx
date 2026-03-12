import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import AccessibilityBar from './AccessibilityBar';

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen flex-col">
    <AccessibilityBar />
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default Layout;
