import { useI18n } from '@/contexts/I18nContext';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const guidelinesEn = [
  'Register with your mobile number linked to your Voter ID/Aadhaar/College Roll Number.',
  'You will receive a one-time SMS OTP for identity verification.',
  'OTP is valid for 5 minutes. You have a maximum of 3 attempts.',
  'Once verified, you will see only the election assigned to you.',
  'Review all candidates carefully before casting your vote.',
  'Click "Vote" and confirm in the modal dialog. This action is irreversible.',
  'Your vote is encrypted with AES-256 before storage.',
  'You will receive a vote receipt ID for your records.',
  'Each voter can vote only once per election.',
  'Contact the helpline for any issues during the voting process.',
];

const guidelinesTa = [
  'உங்கள் வாக்காளர் அடையாளம்/ஆதார்/கல்லூரி பதிவு எண்ணுடன் இணைக்கப்பட்ட கைபேசி எண்ணுடன் பதிவு செய்யுங்கள்.',
  'அடையாள சரிபார்ப்புக்கு ஒரு முறை SMS OTP பெறுவீர்கள்.',
  'OTP 5 நிமிடங்களுக்கு செல்லுபடியாகும். அதிகபட்சம் 3 முயற்சிகள்.',
  'சரிபார்க்கப்பட்டவுடன், உங்களுக்கு ஒதுக்கப்பட்ட தேர்தலை மட்டுமே காண்பீர்கள்.',
  'வாக்களிக்கும் முன் அனைத்து வேட்பாளர்களையும் கவனமாக மதிப்பாய்வு செய்யுங்கள்.',
  '"வாக்களி" என்பதைக் கிளிக் செய்து உறுதிப்படுத்தவும். இச்செயல் மாற்ற இயலாதது.',
  'உங்கள் வாக்கு AES-256 குறியாக்கத்துடன் சேமிக்கப்படும்.',
  'உங்கள் பதிவுகளுக்கு வாக்கு ரசீது எண் பெறுவீர்கள்.',
  'ஒவ்வொரு வாக்காளரும் ஒரு தேர்தலில் ஒரு முறை மட்டுமே வாக்களிக்க முடியும்.',
  'வாக்களிப்பு செயல்பாட்டின் போது ஏதேனும் சிக்கல்கள் இருந்தால் உதவி எண்ணைத் தொடர்பு கொள்ளவும்.',
];

const Guidelines = () => {
  const { t, lang } = useI18n();
  const items = lang === 'ta' ? guidelinesTa : guidelinesEn;

  return (
    <div className="container px-4 py-16">
      <h1 className="mb-8 text-center text-4xl font-bold text-foreground">{t.guidelines}</h1>
      <Card className="mx-auto max-w-2xl border-none shadow-md">
        <CardContent className="p-8">
          <ol className="space-y-4">
            {items.map((item, i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <span className="text-sm text-foreground">{item}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default Guidelines;
