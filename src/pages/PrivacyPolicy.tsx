import { Shield, Eye, Lock, Database, Phone, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10">
          <Shield className="h-7 w-7 text-secondary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>
      </div>

      <div className="space-y-8 text-sm text-foreground leading-relaxed">

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-semibold">1. Information We Collect</h2>
          </div>
          <p className="text-muted-foreground">We collect the following personal information to facilitate the voting process:</p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
            <li>Full name and date of birth</li>
            <li>Aadhaar number (stored securely, never shared)</li>
            <li>Mobile number (used only for OTP verification)</li>
            <li>State, city, and constituency details</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Database className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-semibold">2. How We Use Your Data</h2>
          </div>
          <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
            <li>To verify voter identity via Aadhaar-based OTP authentication</li>
            <li>To ensure each voter casts only one vote per election</li>
            <li>To enforce constituency-based voting restrictions</li>
            <li>To generate anonymized vote receipts</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-semibold">3. Data Security</h2>
          </div>
          <p className="text-muted-foreground">
            All sensitive data including Aadhaar numbers are encrypted using AES-256 CBC encryption.
            Votes are stored anonymously and cannot be linked back to individual voters.
            OTPs are hashed using BCrypt and expire within 5 minutes of generation.
            JWT tokens used for session management expire after 24 hours.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">4. Data Sharing</h2>
          <p className="text-muted-foreground">
            We do not sell, rent, or share your personal data with any third party.
            Data may only be disclosed if required by law or court order.
            SMS services are used solely for OTP delivery and do not retain message content.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">5. Data Retention</h2>
          <p className="text-muted-foreground">
            Voter registration data is retained for the duration of the electoral cycle.
            OTP logs are purged automatically after expiry. Vote receipts are retained for
            audit purposes as required by election regulations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">6. Your Rights</h2>
          <ul className="space-y-1 list-disc list-inside text-muted-foreground">
            <li>Right to access your registered information</li>
            <li>Right to request correction of inaccurate data</li>
            <li>Right to request deletion of your account (subject to election laws)</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Phone className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-semibold">7. Contact</h2>
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

export default PrivacyPolicy;