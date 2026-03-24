import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

try {
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (error) {
  console.error("Error initializing GoogleGenAI:", error);
}

export const generateSupportResponse = async (userQuery: string): Promise<string> => {
  if (!ai) return "عذراً، خدمة المساعد الذكي غير متوفرة حالياً. الرجاء التواصل عبر البريد الإلكتروني.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userQuery,
      config: {
        systemInstruction: "أنت مساعد دعم فني ذكي لتطبيق 'Challenges - تحديات'. التطبيق عبارة عن لعبة مسائل رياضية ومنصة تواصل اجتماعي. أجب على استفسارات المستخدمين بأسلوب ودود ومختصر باللغة العربية. إذا واجهت مشكلة لا تستطيع حلها، اطلب منهم مراسلة jikob67@gmail.com.",
      }
    });
    return response.text || "لم أستطع فهم سؤالك، هل يمكنك إعادة الصياغة؟";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.";
  }
};
