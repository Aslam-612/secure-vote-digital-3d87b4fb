import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Shield, Phone, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { voters } from '@/data/mockData';
import { z } from 'zod';

const mobileSchema = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');
const voterIdSchema = z.string().min(3, 'Enter a valid ID').max(50);
const nameSchema = z.string().trim().min(2, 'Name is required').max(100);

const VoterLogin = () => {
  const { t } = useI18n();
  const { loginAsVoter } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [mobile, setMobile] = useState('');
  const [voterId, setVoterId] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timer, setTimer] = useState(300);
  const [attempts, setAttempts] = useState(3);
  const [resendCount, setResendCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const startTimer = useCallback(() => {
    setTimer(300);
  }, []);

  useEffect(() => {
    if (step !== 'otp' || timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const generateOtp = () => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return String(array[0] % 1000000).padStart(6, '0');
  };

  const handleSendOtp = () => {
    try {
      mobileSchema.parse(mobile);
      voterIdSchema.parse(voterId);
      nameSchema.parse(name);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    // Check pre-registration
    const voter = voters.find(v => v.mobile === mobile);
    if (!voter) {
      toast.error('Mobile number not registered in voter registry. Only pre-registered voters can vote.');
      return;
    }
    if (voter.hasVoted) {
      toast.error('You have already cast your vote in this election.');
      return;
    }

    setLoading(true);
    const newOtp = generateOtp();
    setGeneratedOtp(newOtp);

    // Simulate SMS send
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      startTimer();
      toast.success(`OTP sent! (Demo OTP: ${newOtp})`);
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (timer <= 0) {
      toast.error('OTP has expired. Please resend.');
      return;
    }
    if (otp !== generatedOtp) {
      const remaining = attempts - 1;
      setAttempts(remaining);
      if (remaining <= 0) {
        toast.error('Maximum attempts exceeded. Please try again later.');
        setStep('register');
        setAttempts(3);
        return;
      }
      toast.error(`Invalid OTP. ${remaining} ${t.attemptsLeft}`);
      return;
    }

    const voter = voters.find(v => v.mobile === mobile);
    if (voter) {
      loginAsVoter(mobile, voter.voterId, voter.name, voter.electionId);
      toast.success('Verification successful!');
      navigate('/vote');
    }
  };

  const handleResendOtp = () => {
    if (resendCount >= 3) {
      toast.error('Maximum resend limit reached.');
      return;
    }
    const newOtp = generateOtp();
    setGeneratedOtp(newOtp);
    setResendCount(r => r + 1);
    setAttempts(3);
    startTimer();
    toast.success(`OTP resent! (Demo OTP: ${newOtp})`);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-muted/30 px-4 py-16">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
            <Shield className="h-7 w-7 text-secondary-foreground" />
          </div>
          <CardTitle className="text-2xl">{step === 'register' ? t.login : t.enterOtp}</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'register' ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">{t.mobileNumber}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-10" placeholder="9876543210" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">{t.voterIdLabel}</label>
                <Input placeholder="CSE2025001" value={voterId} onChange={e => setVoterId(e.target.value.slice(0, 50))} maxLength={50} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">{t.fullName}</label>
                <Input placeholder="Full Name" value={name} onChange={e => setName(e.target.value.slice(0, 100))} maxLength={100} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">{t.dateOfBirth}</label>
                <Input type="date" value={dob} onChange={e => setDob(e.target.value)} />
              </div>
              <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={handleSendOtp} disabled={loading}>
                {loading ? t.loading : <>{t.sendOtp} <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Demo voters: 9876543210 (CSE2025001), 9876543214 (SC2025002)
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-center text-sm text-muted-foreground">{t.otpSent}</p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0,1,2,3,4,5].map(i => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="text-center text-sm">
                {timer > 0 ? (
                  <span className="text-muted-foreground">{t.otpExpiry}: <span className="font-mono font-bold text-foreground">{formatTime(timer)}</span></span>
                ) : (
                  <span className="text-destructive">OTP Expired</span>
                )}
              </div>
              <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={handleVerifyOtp}>
                {t.verifyOtp}
              </Button>
              <Button variant="ghost" className="w-full" onClick={handleResendOtp} disabled={resendCount >= 3}>
                <RefreshCw className="mr-2 h-4 w-4" />{t.resendOtp} ({3 - resendCount} left)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoterLogin;
