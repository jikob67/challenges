import React, { useState } from 'react';
import { WALLETS } from '../constants';
import { WalletInfo, PlanType } from '../types';
import { WalletIcon, CheckIcon, StarIcon, TrophyIcon, FireIcon } from './Icons';
import { playSound } from '../services/audioService';

interface Package {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  tag?: string;
}

const PACKAGES: Package[] = [
  { 
    id: 'trial', 
    name: 'تجربة سريعة', 
    price: '$0.99', 
    period: 'يوم واحد', 
    description: 'للمستخدمين الجدد، جرب كل المميزات لمدة 24 ساعة.',
    color: 'bg-blue-500',
    icon: <FireIcon className="w-6 h-6" />,
    tag: 'مستخدم جديد'
  },
  { 
    id: 'basic', 
    name: 'الباقة الاقتصادية', 
    price: '$4.99', 
    period: 'شهرياً', 
    description: 'باقة منخفضة التكلفة للوصول الأساسي بدون إعلانات.',
    color: 'bg-teal-500',
    icon: <StarIcon className="w-6 h-6" />
  },
  { 
    id: 'pro', 
    name: 'الباقة المتوسطة', 
    price: '$14.99', 
    period: 'شهرياً', 
    description: 'وصول غير محدود للمسائل، وشارة تميز في الدردشة.',
    color: 'bg-purple-600',
    icon: <TrophyIcon className="w-6 h-6" />,
    tag: 'الأكثر طلباً'
  },
  { 
    id: 'vip', 
    name: 'الباقة العالية VIP', 
    price: '$99.99', 
    period: 'سنوياً', 
    description: 'أفضل قيمة! توفير كبير مع دعم فني مباشر وأولوية.',
    color: 'bg-orange-500',
    icon: <WalletIcon className="w-6 h-6" />,
    tag: 'أفضل قيمة'
  }
];

interface WalletModalProps {
  onUpgrade: (plan: PlanType) => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ onUpgrade }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedWalletIndex, setSelectedWalletIndex] = useState<number | null>(null);
  const [userWalletAddress, setUserWalletAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    playSound('click');
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    setSelectedWalletIndex(index);
  };

  const handlePackageSelect = (pkg: Package) => {
    playSound('click');
    setSelectedPackage(pkg);
    setStep(2);
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userWalletAddress && txHash && selectedPackage) {
      playSound('win');
      // Simulate backend success
      onUpgrade(selectedPackage.id);
      setStep(4);
    }
  };

  const resetFlow = () => {
    playSound('click');
    setStep(1);
    setSelectedPackage(null);
    setSelectedWalletIndex(null);
    setUserWalletAddress('');
    setTxHash('');
  };

  return (
    <div className="p-6 pb-32 min-h-screen">
      
      {/* Step Indicator */}
      <div className="flex justify-between mb-8 px-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step >= s ? 'bg-primary text-white scale-110' : 'bg-gray-100 text-gray-400'}`}>
              {s === 4 ? <CheckIcon className="w-4 h-4" /> : s}
            </div>
            <span className={`text-[10px] font-bold ${step >= s ? 'text-primary' : 'text-gray-300'}`}>
              {s === 1 ? 'الباقة' : s === 2 ? 'الدفع' : s === 3 ? 'التحقق' : 'تم'}
            </span>
          </div>
        ))}
        {/* Progress Line Background */}
        <div className="absolute top-[4.5rem] right-10 left-10 h-0.5 bg-gray-100 -z-10">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* STEP 1: Choose Package */}
      {step === 1 && (
        <div className="animate-fade-in space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">اختر باقة الاشتراك</h2>
            <p className="text-gray-400 text-sm mt-1">استثمر في عقلك مع باقات تناسب الجميع</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {PACKAGES.map((pkg) => (
              <button 
                key={pkg.id}
                onClick={() => handlePackageSelect(pkg)}
                className="relative bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-lg hover:border-primary/50 transition-all text-right group overflow-hidden"
              >
                {pkg.tag && (
                  <div className={`absolute top-0 left-0 ${pkg.color} text-white text-[10px] font-bold px-3 py-1 rounded-br-xl shadow-sm`}>
                    {pkg.tag}
                  </div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${pkg.color} group-hover:scale-110 transition-transform`}>
                    {pkg.icon}
                  </div>
                  <div className="text-left">
                    <span className={`block text-xl font-black ${pkg.id === 'vip' ? 'text-orange-500' : 'text-gray-800'}`}>{pkg.price}</span>
                    <span className="text-xs text-gray-400 font-bold">{pkg.period}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{pkg.name}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{pkg.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Select Wallet & Copy */}
      {step === 2 && selectedPackage && (
        <div className="animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl text-white mb-6 text-center shadow-xl">
             <p className="text-gray-400 text-xs mb-1">المبلغ المطلوب دفعه</p>
             <h2 className="text-4xl font-bold mb-1">{selectedPackage.price}</h2>
             <span className={`text-[10px] px-3 py-1 rounded-full bg-white/10 ${selectedPackage.color.replace('bg-', 'text-')}`}>
                {selectedPackage.name}
             </span>
          </div>

          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
             اختر المحفظة وانسخ العنوان
          </h3>

          <div className="space-y-3 mb-6">
            {WALLETS.map((wallet: WalletInfo, index) => (
              <div 
                key={index} 
                onClick={() => copyToClipboard(wallet.address, index)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200
                  ${selectedWalletIndex === index 
                    ? 'bg-blue-50 border-primary ring-1 ring-primary' 
                    : 'bg-white border-gray-100 hover:bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-sm
                            ${wallet.network === 'Bitcoin' ? 'bg-orange-500' : 
                            wallet.network === 'Ethereum' ? 'bg-blue-600' : 
                            wallet.network === 'Solana' ? 'bg-purple-500' : 'bg-gray-800'}`}>
                            {wallet.network.substring(0, 3)}
                        </div>
                        <span className="font-bold text-sm text-gray-700">{wallet.network}</span>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors ${copiedIndex === index ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {copiedIndex === index ? 'تم النسخ' : 'نسخ'}
                    </div>
                </div>
                {selectedWalletIndex === index && (
                    <div className="mt-3 pt-3 border-t border-blue-100/50">
                        <p className="text-[10px] font-mono text-gray-500 break-all bg-white p-2 rounded-lg border border-blue-100 text-center">
                            {wallet.address}
                        </p>
                    </div>
                )}
              </div>
            ))}
          </div>

          <button 
            onClick={() => { playSound('click'); selectedWalletIndex !== null ? setStep(3) : alert('يرجى نسخ عنوان محفظة أولاً'); }}
            className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2
                ${selectedWalletIndex !== null ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            التالي: تأكيد الدفع
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
          
          <button onClick={() => { playSound('click'); setStep(1); }} className="w-full mt-3 py-2 text-sm text-gray-500 font-bold hover:text-gray-800">
            رجوع للباقات
          </button>
        </div>
      )}

      {/* STEP 3: Verification Form */}
      {step === 3 && (
        <div className="animate-fade-in">
           <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl mb-6">
              <h3 className="font-bold text-yellow-800 text-sm mb-1">خطوة التحقق الأخيرة</h3>
              <p className="text-xs text-yellow-600">لضمان تفعيل اشتراكك فوراً، يرجى تزويدنا بتفاصيل العملية.</p>
           </div>

           <form onSubmit={handleVerificationSubmit} className="space-y-5">
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">عنوان محفظتك (المرسل)</label>
                  <input 
                    type="text" 
                    required
                    value={userWalletAddress}
                    onChange={(e) => setUserWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono text-xs transition"
                  />
              </div>

              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">رمز العملية (Hash / Transaction ID)</label>
                  <input 
                    type="text" 
                    required
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="Enter transaction hash..."
                    className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono text-xs transition"
                  />
                  <p className="text-[10px] text-gray-400 mt-2 text-left dir-ltr">Example: 0x8f...3a2</p>
              </div>

              <div className="pt-4">
                <button 
                    type="submit"
                    className="w-full py-4 rounded-xl bg-green-500 text-white font-bold shadow-lg shadow-green-200 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                >
                    <CheckIcon className="w-5 h-5" />
                    تأكيد وإرسال
                </button>
                <button 
                    type="button" 
                    onClick={() => { playSound('click'); setStep(2); }} 
                    className="w-full mt-3 py-2 text-sm text-gray-500 font-bold hover:text-gray-800"
                >
                    رجوع
                </button>
              </div>
           </form>
        </div>
      )}

      {/* STEP 4: Success */}
      {step === 4 && (
        <div className="animate-slide-up flex flex-col items-center justify-center pt-10 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce-soft">
                <CheckIcon className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-3">تم الاشتراك بنجاح!</h2>
            <p className="text-gray-500 leading-relaxed max-w-xs mx-auto mb-8">
                مبروك! تم تفعيل اشتراكك في باقة <span className="text-primary font-bold">{selectedPackage?.name}</span>. يمكنك الآن الاستمتاع بكافة المميزات الجديدة.
            </p>
            
            <button 
                onClick={resetFlow}
                className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition"
            >
                إغلاق والعودة للتطبيق
            </button>
        </div>
      )}

    </div>
  );
};

export default WalletModal;