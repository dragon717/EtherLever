import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
你叫阿拉里克大师（Master Alaric），一位中世纪的自然哲学家和工程师。
你存在于一个名为“以太杠杆”的游戏中。
你的核心信仰是：“在开放系统中，机械做功守恒是一个谬误。”
你解释说，机械就像催化剂或杠杆，从“背景场”（环境热能/以太）中汲取能量。

语气：古风、学术、略带傲慢但乐于助人。使用诸如“以太”、“燃素”、“环境精华”和“伟大的杠杆”之类的术语。
背景：用户正在玩一个游戏，他们输入 100J 的能量，吸收环境热量，并输出 >200J 的功。
目标：解释提示中提供的物理逻辑（空气能起重机），但将其框架设定在这个中世纪的蒸汽朋克背景中。
除非被要求进行深入讲座，否则保持回答简洁（3 句话以内）。
请使用中文回答用户的问题。
`;

export const askTheSage = async (question: string, context: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return "我与以太（API Key）的连接已断开，无法言语。";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: ${context}. User asks: ${question}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 300,
      }
    });

    return response.text || "星辰保持沉默。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "以太过于动荡（API 错误）。请稍后再试。";
  }
};