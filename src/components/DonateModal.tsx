import React, { useState } from 'react';
import { Heart, ExternalLink } from 'lucide-react';
import Modal from './Modal';
import { useSettingsStore } from '../store/settingsStore';

// High-fidelity SVG QR Mockup with corporate branding in the center as an elegant fallback
const QRSvgFallback: React.FC<{ brand: 'kofi' | 'toss' }> = ({ brand }) => {
  const isToss = brand === 'toss';
  const bgColor = isToss ? 'bg-[#3182F6]' : 'bg-[#FF5E5B]';
  const textColor = 'text-white';
  const logoText = isToss ? 'toss' : '☕';
  const subText = isToss ? '' : 'Ko-fi';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-2xl transition-all duration-300">
      <svg className="w-36 h-36 text-zinc-800 dark:text-zinc-200 opacity-90 transition-colors" viewBox="0 0 100 100" fill="currentColor">
        {/* Top-Left Finder */}
        <path d="M0,0 h25 v25 h-25 z M5,5 h15 v15 h-15 z M10,10 h5 v5 h-5 z" />
        {/* Top-Right Finder */}
        <path d="M75,0 h25 v25 h-25 z M80,5 h15 v15 h-15 z M85,10 h5 v5 h-5 z" />
        {/* Bottom-Left Finder */}
        <path d="M0,75 h25 v25 h-25 z M5,80 h15 v15 h-15 z M10,85 h5 v5 h-5 z" />
        {/* Bottom-Right Alignment */}
        <path d="M85,85 h5 v5 h-5 z M75,75 h5 v5 h-5 z" />
        {/* High-fidelity random QR blocks */}
        <path d="M35,5 h5 v5 h-5 z M45,0 h5 v5 h-5 z M55,5 h5 v5 h-5 z M50,15 h5 v5 h-5 z M60,10 h5 v5 h-5 z M35,20 h5 v5 h-5 z M40,25 h5 v5 h-5 z" />
        <path d="M5,35 h5 v5 h-5 z M15,40 h5 v5 h-5 z M25,35 h5 v5 h-5 z M10,50 h5 v5 h-5 z M20,45 h5 v5 h-5 z M0,55 h5 v5 h-5 z" />
        <path d="M75,35 h5 v5 h-5 z M85,40 h5 v5 h-5 z M95,35 h5 v5 h-5 z M80,50 h5 v5 h-5 z M90,45 h5 v5 h-5 z M70,55 h5 v5 h-5 z" />
        <path d="M35,75 h5 v5 h-5 z M45,70 h5 v5 h-5 z M55,75 h5 v5 h-5 z M50,85 h5 v5 h-5 z M60,80 h5 v5 h-5 z M35,90 h5 v5 h-5 z M40,95 h5 v5 h-5 z" />
        <path d="M50,40 h5 v5 h-5 z M45,50 h5 v5 h-5 z M55,45 h5 v5 h-5 z M60,55 h5 v5 h-5 z M40,60 h5 v5 h-5 z" />
      </svg>
      {/* Brand logo overlay */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-3.5 py-2 ${bgColor} ${textColor} font-black text-[11px] rounded-2xl shadow-xl border-4 border-white dark:border-zinc-900 uppercase tracking-tighter flex items-center gap-1 active:scale-95 transition-transform`}>
        <span>{logoText}</span>
        {subText && <span className="opacity-70 text-[9px] font-black">{subText}</span>}
      </div>
    </div>
  );
};

const DonateModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language } = useSettingsStore();
  
  // State to track if QR code image failed to load, falling back to beautiful SVG
  const [tossImgFailed, setTossImgFailed] = useState(false);
  const [kofiImgFailed, setKofiImgFailed] = useState(false);

  const isKorean = language === 'ko';
  
  // Custom links
  const kofiLink = "https://ko-fi.com/vnut1";

  // Content translations
  const content = {
    ko: {
      title: "Toss로 후원하기",
      desc: "QR 코드를 스캔하여 Toss를 통해 개발자를 후원하실 수 있습니다.",
      subDesc: "VNUT WEB을 응원해 주셔서 감사합니다!",
      btnText: "",
    },
    en: {
      title: "Support the Developer",
      desc: "Scan the QR code or click the button below to support me on Ko-fi! Your support keeps this project alive.",
      subDesc: "Thank you for supporting VNUT WEB!",
      btnText: "Support on Ko-fi",
    },
    ja: {
      title: "開発者を支援する",
      desc: "QRコードをスキャンするか、下のボタンをクリックしてKo-fiから開発者を支援することができます。",
      subDesc: "VNUT WEBをご支援いただきありがとうございます！",
      btnText: "Support on Ko-fi",
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  return (
    <Modal title="Donate" onClose={onClose} icon={<Heart size={20} className="text-red-500 fill-red-500 animate-pulse" />}>
      <div className="flex flex-col items-center text-center space-y-8 p-1">
        
        {/* Branded QR Container */}
        <div className="w-56 h-56 relative group">
          {/* Outer glow aura based on brand */}
          <div className={`absolute -inset-1 rounded-[2.2rem] opacity-30 blur-xl group-hover:opacity-50 transition-opacity duration-500 ${
            isKorean ? 'bg-[#3182F6]' : 'bg-[#FF5E5B]'
          }`} />
          
          <div className="relative w-full h-full">
            {isKorean ? (
              // Korean QR Display (Using Toss QR code toss_qr.jpg)
              !tossImgFailed ? (
                <img 
                  src="/toss_qr.jpg?v=4" 
                  alt="Toss QR" 
                  onError={() => setTossImgFailed(true)}
                  className="w-full h-full object-fill rounded-[2rem] shadow-2xl"
                />
              ) : (
                <QRSvgFallback brand="toss" />
              )
            ) : (
              // International Ko-fi QR Display
              !kofiImgFailed ? (
                <img 
                  src="/kofi_qr.png" 
                  alt="Ko-fi QR" 
                  onError={() => setKofiImgFailed(true)}
                  className="w-full h-full object-contain bg-white p-4 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-2xl"
                />
              ) : (
                <QRSvgFallback brand="kofi" />
              )
            )}
          </div>
        </div>

        {/* Text descriptions */}
        <div className="space-y-3 px-2">
          <h3 className={`text-base font-black tracking-tight ${
            isKorean ? 'text-[#3182F6] dark:text-[#4f95ff]' : 'text-[#FF5E5B] dark:text-[#ff7572]'
          }`}>
            {t.title}
          </h3>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-relaxed max-w-[280px] mx-auto">
            {t.desc}
          </p>
          {t.subDesc && (
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed max-w-[260px] mx-auto italic">
              {t.subDesc}
            </p>
          )}
        </div>

        {!isKorean && (
          <div className="w-full pt-2">
            <a 
              href={kofiLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-[#FF5E5B] hover:bg-[#ff7572] active:scale-[0.98] text-white rounded-2xl text-xs font-black uppercase tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-red-500/10 transition-all border border-[#e04f4d]"
            >
              <span>☕</span>
              <span>{t.btnText}</span>
              <ExternalLink size={14} className="opacity-60" />
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DonateModal;
