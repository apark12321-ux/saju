import { GoogleGenAI } from "@google/genai";
import { SajuData } from "../lib/saju";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getSajuInterpretation(data: SajuData, name: string, gender: string) {
  const prompt = `
    당신은 정통 명리학의 대가입니다. 다음 사주 정보를 바탕으로 사용자 '${name}'(${gender})의 인생 운세를 심층적으로 분석해주세요.
    
    [사주 정보]
    - 연주: ${data.yearStem}${data.yearBranch}
    - 월주: ${data.monthStem}${data.monthBranch}
    - 일주: ${data.dayStem}${data.dayBranch}
    - 시주: ${data.hourStem}${data.hourBranch}
    - 오행 분포: 목(${data.fiveElements.wood}), 화(${data.fiveElements.fire}), 토(${data.fiveElements.earth}), 금(${data.fiveElements.metal}), 수(${data.fiveElements.water})
    - 띠: ${data.zodiac}
    
    분석은 다음 항목을 포함해야 하며, 마크다운(Markdown) 형식으로 읽기 쉽게 작성해주세요.
    전통적인 용어와 현대적인 해석을 조화롭게 섞어주세요.
    구글 애드센스 광고가 들어갈 수 있도록 내용을 풍부하게 작성해야 합니다. (최소 1000자 이상)
    
    1. 총평: 전체적인 운의 흐름과 기운
    2. 성격 및 특징: 타고난 성향과 성격의 장단점
    3. 재물운 및 직업운: 어떤 직업이 어울리며 재물은 어떻게 쌓이는가
    4. 연애 및 결혼운: 인연의 특징과 시기
    5. 건강운: 주의해야 할 신체 부위와 생활 습관
    6. 개운법: 부족한 오행을 보충하거나 운을 좋게 만드는 법 (예: 색상, 방향, 숫자)
    
    정중하고 지혜로운 말투로 작성해주세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "운세를 분석하는 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}

export async function getNameReading(name: string, sajuData: SajuData) {
  const prompt = `
    당신은 성명학 권위자입니다. 성함 '${name}'이(가) 사용자의 사주와 얼마나 잘 어울리는지 분석해주세요.
    사용자 사주 오행 분포: 목(${sajuData.fiveElements.wood}), 화(${sajuData.fiveElements.fire}), 토(${sajuData.fiveElements.earth}), 금(${sajuData.fiveElements.metal}), 수(${sajuData.fiveElements.water})
    
    분석 항목:
    1. 이름의 수리 및 음양 조화
    2. 사주와의 오행 보완 관계 (사주에 부족한 기운을 이름이 채워주는지)
    3. 종합 평가 및 추천 (부족하다면 보충하면 좋을 오행 제안)
    
    마크다운 형식으로 작성해주세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "이름 감명 중에 오류가 발생했습니다.";
  }
}

export async function getDailyHoroscope(zodiac: string) {
  const prompt = `
    당신은 오늘의 운세를 알려주는 점성술사입니다. '${zodiac}띠'의 오늘 하루 운세를 구체적으로 분석해주세요.
    
    포함할 내용:
    1. 총운 (별점 5개 만점 기준)
    2. 연애운, 금전운, 사업운
    3. 오늘의 행운 아이템 (색상, 숫자, 장소)
    
    친절하고 긍정적인 말투로 마크다운 형식으로 작성해주세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "오늘의 운세를 가져오는 중에 오류가 발생했습니다.";
  }
}
