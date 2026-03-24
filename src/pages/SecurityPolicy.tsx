import { Lock, ShieldCheck, KeyRound, Server, AlertTriangle, Mail, Phone } from 'lucide-react';

const SecurityPolicy = () => {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10">
          <ShieldCheck className="h-7 w-7 text-secondary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Security Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>
      </div>

      <div className="space-y-8 text-sm text-foreground leading-relaxed">

        <section>
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-semibold">1. Authentication & OTP</h2>
          </div>
          <ul className="space-y-1 list-disc list-inside text-muted-foreground">
            <li>Voters authenticate using Aadhaar number + SMS OTP</li>
            <li>OTPs are hashed with BCrypt before storage — never stored as plain text</li>
            <li>OTPs expire after 5 minutes and are invalidated after a single use</li>
            <li>Maximum 3 incorrect OTP attempts before lockout</li>
            <li>Test bypass available only for designated test numbers in development</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-semibold">2. Data Encryption</h2>
          </div>
          <ul className="space-y-1 list-disc list-inside text-muted-foreground">
            <li>All votes encrypted using AES-256 CBC before storage</li>
            <li>Aadhaar numbers masked in all frontend displays</li>
            <li>HTTPS enforced for all API communication in production</li>
            <li>JWT tokens signed and validated on every protected request</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Server className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-semibold">3. Session Management</h2>
          </div>
          <ul className="space-y-1 list-disc list-inside text-muted-foreground">
            <li>JWT tokens expire after 24 hours</li>
            <li>Stateless authentication — no server-side sessions stored</li>
            <li>Role-based access control (VOTER vs ADMIN) enforced on all endpoints</li>
            <li>Admin access requires separate credentials and JWT role validation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">4. Voting Integrity</h2>
          <ul className="space-y-1 list-disc list-inside text-muted-foreground">
            <li>Each voter can cast only one vote per election (enforced at DB level)</li>
            <li>Constituency-based eligibility verified before vote is accepted</li>
            <li>Voter age validation: minimum 18 years (calculated from DOB)</li>
            <li>Candidate age validation: minimum 25 years</li>
            <li>All votes generate a unique encrypted receipt ID</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-semibold">5. Responsible Disclosure</h2>
          </div>
          <p className="text-muted-foreground">
            If you discover a security vulnerability in this system, please report it responsibly
            by contacting our security team. Do not attempt to exploit vulnerabilities or access
            data that does not belong to you.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Phone className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-semibold">6. Contact</h2>
          </div>
          <div className="flex flex-col gap-1 text-muted-foreground">
            <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@evoting.in</span>
            <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> 1800-XXX-XXXX</span>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SecurityPolicy;