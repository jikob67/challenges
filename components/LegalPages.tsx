import React from 'react';
import { XMarkIcon } from './Icons';

interface LegalPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<LegalPageProps> = ({ onBack }) => (
  <div className="bg-white min-h-full p-6 animate-fade-in pb-24">
    <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/90 backdrop-blur-sm py-4 border-b border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800">شروط الاستخدام</h2>
      <button onClick={onBack} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
        <XMarkIcon className="w-6 h-6 text-gray-600" />
      </button>
    </div>
    
    <div className="space-y-6 text-gray-600 leading-relaxed text-sm">
      <section>
        <h3 className="font-bold text-gray-900 mb-2">1. مقدمة</h3>
        <p>مرحباً بك في تطبيق Challenges. باستخداك لهذا التطبيق، فإنك توافق على الالتزام بشروط وأحكام الاستخدام هذه. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام التطبيق.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 mb-2">2. الحسابات والأمان</h3>
        <p>عند إنشاء حساب، يجب عليك تقديم معلومات دقيقة وكاملة. أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك وعن جميع الأنشطة التي تحدث تحت حسابك.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 mb-2">3. السلوك المسموح به</h3>
        <p>يجب استخدام التطبيق لأغراض قانونية فقط. يمنع منعاً باتاً:</p>
        <ul className="list-disc list-inside mt-2 space-y-1 bg-gray-50 p-3 rounded-xl">
            <li>مضايقة أو الإساءة للآخرين في الدردشة أو التعليقات.</li>
            <li>نشر محتوى غير لائق أو مسيء.</li>
            <li>محاولة اختراق التطبيق أو التلاعب بالنتائج.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 mb-2">4. الملكية الفكرية</h3>
        <p>جميع المحتويات الموجودة في التطبيق، بما في ذلك النصوص والرسومات والشعارات، هي ملك لتطبيق Challenges ومحمية بموجب قوانين حقوق النشر.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 mb-2">5. الاشتراكات والمدفوعات</h3>
        <p>الاشتراكات المميزة تتطلب دفع رسوم محددة. جميع المدفوعات نهائية وغير قابلة للاسترداد إلا وفقاً لتقدير إدارة التطبيق.</p>
      </section>
      
      <section>
        <h3 className="font-bold text-gray-900 mb-2">6. إنهاء الخدمة</h3>
        <p>نحتفظ بالحق في إنهاء أو تعليق حسابك فوراً، دون إشعار مسبق، إذا انتهكت هذه الشروط.</p>
      </section>
    </div>
  </div>
);

export const PrivacyPage: React.FC<LegalPageProps> = ({ onBack }) => (
  <div className="bg-white min-h-full p-6 animate-fade-in pb-24">
    <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/90 backdrop-blur-sm py-4 border-b border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800">سياسة الخصوصية</h2>
      <button onClick={onBack} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
        <XMarkIcon className="w-6 h-6 text-gray-600" />
      </button>
    </div>
    
    <div className="space-y-6 text-gray-600 leading-relaxed text-sm">
      <section>
        <h3 className="font-bold text-gray-900 mb-2">1. المعلومات التي نجمعها</h3>
        <p>نقوم بجمع المعلومات التي تقدمها لنا مباشرة، مثل:</p>
        <ul className="list-disc list-inside mt-2 space-y-1 bg-gray-50 p-3 rounded-xl">
            <li>اسم المستخدم والبريد الإلكتروني.</li>
            <li>صورة الملف الشخصي.</li>
            <li>بيانات اللعب والتقدم (المستويات، النقاط).</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 mb-2">2. كيف نستخدم معلوماتك</h3>
        <p>نستخدم المعلومات التي نجمعها من أجل:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
            <li>تشغيل وصيانة وتحسين التطبيق.</li>
            <li>تخصيص تجربتك وحفظ تقدمك في اللعبة.</li>
            <li>إرسال إشعارات هامة وتحديثات.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 mb-2">3. مشاركة المعلومات</h3>
        <p>لا نقوم ببيع أو تأجير معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلومات مجهولة المصدر لأغراض التحليل وتحسين الأداء.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 mb-2">4. أمن البيانات</h3>
        <p>نحن نتخذ تدابير أمنية معقولة لحماية معلوماتك من الوصول غير المصرح به أو التغيير أو الإفصاح أو الإتلاف.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 mb-2">5. حقوقك</h3>
        <p>لديك الحق في طلب الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها. يمكنك التواصل مع الدعم الفني لممارسة هذه الحقوق.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 mb-2">6. اتصل بنا</h3>
        <p>إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر: <br/> <span className="text-primary font-bold dir-ltr">jikob67@gmail.com</span></p>
      </section>
    </div>
  </div>
);