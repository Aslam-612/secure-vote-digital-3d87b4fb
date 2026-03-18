import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Eye, Type } from 'lucide-react';

const AccessibilityBar = () => {
  const { t } = useI18n();
  const [fontSize, setFontSize] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const sizes = ['font-size-sm', 'font-size-md', 'font-size-lg', 'font-size-xl'];
  const sizeLabels = ['A-', 'A', 'A+', 'A++'];

  const changeFontSize = (idx: number) => {
  setFontSize(idx);
  document.body.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg', 'font-size-xl');
  document.body.classList.add(sizes[idx]);
};

  const toggleContrast = () => {
    setHighContrast(!highContrast);
    document.documentElement.classList.toggle('high-contrast');
  };

  return (
    <div className="flex h-8 items-center justify-end gap-2 bg-muted px-4 text-xs">
      <span className="flex items-center gap-1"><Type className="h-3 w-3" />{t.fontSize}:</span>
      {sizeLabels.map((label, idx) => (
        <Button key={idx} variant={fontSize === idx ? "secondary" : "ghost"} size="sm"
          className="h-5 px-1.5 text-[10px]" onClick={() => changeFontSize(idx)}>
          {label}
        </Button>
      ))}
      <Button variant={highContrast ? "secondary" : "ghost"} size="sm" className="h-5 gap-1 px-1.5 text-[10px]" onClick={toggleContrast}>
        <Eye className="h-3 w-3" />{t.highContrast}
      </Button>
    </div>
  );
};

export default AccessibilityBar;
