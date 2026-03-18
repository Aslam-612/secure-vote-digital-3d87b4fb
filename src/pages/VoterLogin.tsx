import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, Phone } from 'lucide-react';

const VoterLogin = () => {
  const navigate = useNavigate();
  const { loginWithOtp, requestOtp } = useAuth();

  const [aadhar, setAadhar] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'aadhar' | 'otp'>('aadhar');
  const [loading, setLoading] = useState(false);
  const [maskedMobile, setMaskedMobile] = useState('');

  const handleSendOtp = async () => {
    if (aadhar.length !== 12) {
      toast.error('Please enter a valid 12-digit Aadhar number');
      return;
    }
    setLoading(true);
    try {
      const result = await requestOtp(aadhar);
      if (result.status === 'SUCCESS') {
        setMaskedMobile(result.mobile || '');
        setStep('otp');
        toast.success('OTP sent to your registered mobile number!');
      } else {
        toast.error(result.message || 'Aadhar not registered. Contact admin.');
      }
    } catch (e) {
      toast.error('Backend is not running or unreachable.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const result = await loginWithOtp(aadhar, otp);
      if (result.status === 'SUCCESS') {
        toast.success(`Welcome, ${result.voterName}!`);
        navigate('/vote');
      } else {
        toast.error(result.message || 'Invalid OTP');
      }
    } catch (e) {
      toast.error('Verification failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Voter Login</CardTitle>
          <p className="text-muted-foreground text-sm">
            {step === 'aadhar'
              ? 'Enter your Aadhar number to receive OTP'
              : `OTP sent to ${maskedMobile}`}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'aadhar' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Aadhar Number</label>
                <Input
                  placeholder="Enter 12-digit Aadhar number"
                  value={aadhar}
                  onChange={e => setAadhar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  maxLength={12}
                />
                <p className="text-xs text-muted-foreground">
                  {aadhar.length}/12 digits
                </p>
              </div>
              <Button
                className="w-full"
                onClick={handleSendOtp}
                disabled={loading || aadhar.length !== 12}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter OTP</label>
                <Input
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}>
                {loading ? 'Verifying...' : 'Verify OTP & Login'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => { setStep('aadhar'); setOtp(''); }}
                disabled={loading}>
                ← Change Aadhar
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoterLogin;