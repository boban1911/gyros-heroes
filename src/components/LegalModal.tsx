import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, title, content }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md transition-opacity">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-hero-blue-dark border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0 bg-hero-blue-dark/50">
          <h2 className="font-montserrat font-bold text-2xl md:text-3xl text-hero-yellow uppercase tracking-wider">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-white hover:text-hero-yellow transition-colors rounded-full hover:bg-white/10"
            aria-label="Zatvori"
          >
            <X size={28} />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto grow custom-scrollbar">
          <div className="font-montserrat text-white/90 text-[15px] md:text-[16px] leading-relaxed">
            {content}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LegalModal;
