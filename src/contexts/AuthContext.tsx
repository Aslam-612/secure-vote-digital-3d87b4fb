import React, { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'voter' | 'officer' | 'admin' | null;

interface AuthState {
  isAuthenticated: boolean;
  role: Role;
  mobile: string;
  voterId: string;
  name: string;
  assignedElectionId: string;
  hasVoted: boolean;
}

interface AuthContextType extends AuthState {
  loginAsVoter: (mobile: string, voterId: string, name: string, electionId: string) => void;
  loginAsAdmin: () => void;
  logout: () => void;
  markVoted: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false, role: null, mobile: '', voterId: '', name: '', assignedElectionId: '', hasVoted: false,
  });

  const loginAsVoter = (mobile: string, voterId: string, name: string, electionId: string) => {
    setAuth({ isAuthenticated: true, role: 'voter', mobile, voterId, name, assignedElectionId: electionId, hasVoted: false });
  };

  const loginAsAdmin = () => {
    setAuth({ isAuthenticated: true, role: 'admin', mobile: '', voterId: '', name: 'Admin', assignedElectionId: '', hasVoted: false });
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, role: null, mobile: '', voterId: '', name: '', assignedElectionId: '', hasVoted: false });
  };

  const markVoted = () => setAuth(prev => ({ ...prev, hasVoted: true }));

  return (
    <AuthContext.Provider value={{ ...auth, loginAsVoter, loginAsAdmin, logout, markVoted }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
