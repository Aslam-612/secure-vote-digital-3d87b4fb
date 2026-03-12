import { useI18n } from '@/contexts/I18nContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqsEn = [
  { q: 'Who can vote using this platform?', a: 'Only pre-registered voters whose mobile numbers are linked to their Voter ID, Aadhaar, or College Roll Number in the voter registry can participate.' },
  { q: 'How is my vote kept secret?', a: 'Your vote is encrypted with AES-256 encryption before being stored. The system ensures vote secrecy through end-to-end encryption.' },
  { q: 'What if I don\'t receive the OTP?', a: 'You can resend the OTP up to 3 times. Each OTP is valid for 5 minutes. If issues persist, contact the helpline.' },
  { q: 'Can I vote more than once?', a: 'No. The system enforces a strict one-person-one-vote policy using atomic database transactions and unique constraints.' },
  { q: 'What types of elections are supported?', a: 'College student council, corporate internal, public constituency, and organization committee elections.' },
  { q: 'Is the platform accessible?', a: 'Yes. The platform supports WCAG compliance, high contrast mode, font resizing, and bilingual support (English and Tamil).' },
  { q: 'How do I get my vote receipt?', a: 'After successfully casting your vote, you will receive a unique encrypted receipt ID on the confirmation screen.' },
];

const faqsTa = [
  { q: 'இந்த தளத்தைப் பயன்படுத்தி யார் வாக்களிக்க முடியும்?', a: 'வாக்காளர் பதிவேட்டில் கைபேசி எண் இணைக்கப்பட்ட முன்பதிவு செய்யப்பட்ட வாக்காளர்கள் மட்டுமே பங்கேற்க முடியும்.' },
  { q: 'என் வாக்கு எப்படி ரகசியமாக வைக்கப்படுகிறது?', a: 'உங்கள் வாக்கு AES-256 குறியாக்கத்துடன் சேமிக்கப்படுகிறது.' },
  { q: 'OTP வரவில்லை என்றால் என்ன செய்வது?', a: 'நீங்கள் 3 முறை வரை OTP மீண்டும் அனுப்பலாம். ஒவ்வொரு OTP-யும் 5 நிமிடங்களுக்கு செல்லுபடியாகும்.' },
  { q: 'ஒன்றுக்கு மேற்பட்ட முறை வாக்களிக்க முடியுமா?', a: 'இல்லை. கணினி கடுமையான ஒரு நபர்-ஒரு வாக்குக் கொள்கையை செயல்படுத்துகிறது.' },
  { q: 'என்ன வகையான தேர்தல்கள் ஆதரிக்கப்படுகின்றன?', a: 'கல்லூரி மாணவர் சபை, நிறுவன உள், பொது தொகுதி மற்றும் அமைப்பு குழு தேர்தல்கள்.' },
  { q: 'தளம் அணுகக்கூடியதா?', a: 'ஆம். அதிக வேறுபாடு முறை, எழுத்துரு அளவு மாற்றம் மற்றும் இருமொழி ஆதரவு.' },
  { q: 'வாக்கு ரசீதை எப்படி பெறுவது?', a: 'வாக்களித்த பிறகு, உறுதிப்படுத்தல் திரையில் தனிப்பட்ட ரசீது எண் பெறுவீர்கள்.' },
];

const FAQ = () => {
  const { t, lang } = useI18n();
  const faqs = lang === 'ta' ? faqsTa : faqsEn;

  return (
    <div className="container px-4 py-16">
      <h1 className="mb-8 text-center text-4xl font-bold text-foreground">{t.faq}</h1>
      <div className="mx-auto max-w-2xl">
        <Accordion type="single" collapsible>
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-foreground">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQ;
