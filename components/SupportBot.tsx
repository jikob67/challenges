import React, { useState } from 'react';
import { generateSupportResponse } from '../services/geminiService';
import { SUPPORT_EMAIL, SUPPORT_LINKS } from '../constants';
import { BotIcon, SendIcon } from './Icons';
import { playSound } from '../services/audioService';

const SupportBot: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async () => {
    if (!query.trim()) return;
    playSound('send');
    setIsLoading(true);
    setResponse('');
    
    try {
        const result = await generateSupportResponse(query);
        setResponse(result);
        playSound('notification');
    } catch (e) {
        setResponse('حدث خطأ غير متوقع.');
        playSound('error');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
          <BotIcon className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-gray-800">الدعم والمساعدة الذكية</h2>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">كيف يمكننا مساعدتك؟</label>
        <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition h-32 resize-none"
            placeholder="مثال: كيف يمكنني تغيير الصورة الرمزية؟"
        />
        <button
            onClick={handleAskAI}
            disabled={isLoading || !query}
            className={`mt-4 w-full py-3 rounded-xl text-white font-bold flex justify-center items-center gap-2 transition
                ${isLoading || !query ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-blue-600 shadow-lg shadow-blue-200'}`}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    جاري التحليل...
                </>
            ) : (
                <>
                    <SendIcon className="w-4 h-4 rotate-180" />
                    اسأل المساعد الذكي
                </>
            )}
        </button>
      </div>

      {response && (
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8 animate-fade-in">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <BotIcon className="w-5 h-5" />
                الإجابة المقترحة:
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{response}</p>
        </div>
      )}

      <div className="border-t pt-6">
        <h3 className="font-bold text-gray-800 mb-4">قنوات دعم إضافية</h3>
        <div className="space-y-3">
            <a href={`mailto:${SUPPORT_EMAIL}`} onClick={() => playSound('click')} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <span className="text-2xl ml-3">📧</span>
                <div>
                    <div className="font-bold text-gray-900">البريد الإلكتروني</div>
                    <div className="text-sm text-gray-500">{SUPPORT_EMAIL}</div>
                </div>
            </a>
            {SUPPORT_LINKS.map((link, i) => (
                <a key={i} href={link} onClick={() => playSound('click')} target="_blank" rel="noreferrer" className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <span className="text-2xl ml-3">🌐</span>
                    <div>
                        <div className="font-bold text-gray-900">مدونة الدعم {i + 1}</div>
                        <div className="text-sm text-gray-500 truncate w-48 dir-ltr">{link}</div>
                    </div>
                </a>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SupportBot;