import { GoogleGenAI } from "@google/genai";
import { SajuData } from "../lib/saju";

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY가 설정되지 않았습니다. 사이트 관리자에게 문의하세요.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

/**
 * 사주 정보를 바탕으로 심층 해석을 생성합니다.
 */
export async function getSajuInterpretation(data: SajuData, name: string, gender: string) {
  const prompt = `
    당신은 30년 경력의 정통 명리학 대가입니다. 다음 사주 팔자 정보를 바탕으로 사용자 '${name}'(${gender})의 인생 운세를 심층적으로 분석해주세요.
    
    [사주 정보]
    - 연주: ${data.yearStem}${data.yearBranch}
    - 월주: ${data.monthStem}${data.monthBranch}
    - 일주: ${data.dayStem}${data.dayBranch}
    - 시주: ${data.hourStem}${data.hourBranch}
    - 오행 분포: 목(${data.fiveElements.wood}), 화(${data.fiveElements.fire}), 토(${data.fiveElements.earth}), 금(${data.fiveElements.metal}), 수(${data.fiveElements.water})
    - 띠: ${data.zodiac}
    
    1. 총평: 전체적으로 흐르는 기운과 가장 중심이 되는 일주의 특징
    2. 성격 및 인간관계: 타고난 성향, 타인과의 상호작용 방식, 고쳐야 할 점
    3. 재물 및 성공운: 평생의 재물 복, 성공을 위한 조언
    4. 직업 및 진로: 사주 오행에 따른 최적의 직업군
    5. 연애 및 처/자운: 인연의 특징, 배우자 복
    6. 건강 및 주의사항: 주의해야 할 신체 부위
    7. 개운법: 운을 여는 법 (색상, 숫자, 방향 등)
    
    마크다운(Markdown) 형식으로 소제목과 리스트를 활용해 1500자 이상 아주 상세하게 작성해주세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    const text = response.text || "분석 결과를 가져오는 중에 오류가 발생했습니다.";
    // 사용자의 요청에 따라 볼드 처리 기호(**)가 노출되는 문제를 방지하기 위해 정규식으로 제거하거나 정리합니다.
    return text.replace(/\*\*/g, "");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "현재 서버 부하가 높습니다. 잠시 후 다시 시도해 주세요.";
  }
}

/**
 * 성명학 기반 이름 감명을 수행합니다.
 */
export async function getNameReading(name: string, sajuData: SajuData) {
  const prompt = `
    당신은 성명학(이름풀이) 최고 전문가입니다. 성함 '${name}'이(가) 사용자의 사주 오행과 얼마나 조화를 이루는지 분석해주세요.
    
    [사주 오행 분포]
    목(${sajuData.fiveElements.wood}), 화(${sajuData.fiveElements.fire}), 토(${sajuData.fiveElements.earth}), 금(${sajuData.fiveElements.metal}), 수(${sajuData.fiveElements.water})
    
    1. 음양 조화 분석
    2. 수리 분석 (초년, 청년, 장년, 말년)
    3. 오행 보완 관계 분석
    4. 종합 추천 및 행운의 조언
    
    마크다운 형식으로 1000자 이상 상세히 작성해주세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    const text = response.text || "성명 감명 결과를 가져오지 못했습니다.";
    return text.replace(/\*\*/g, "");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "성명 감명 서비스가 잠시 중단되었습니다.";
  }
}

/**
 * 오늘의 띠별 운세를 가져옵니다.
 */
export async function getDailyHoroscope(zodiac: string) {
  const prompt = `
    오늘 하루 '${zodiac}띠'의 운세를 정성껏 해석해 주세요.
    1. 총운과 키워드
    2. 연애, 금전, 사업 상세운
    3. 행운의 지표
    
    친절하고 지혜로운 어조로 마크다운 형식으로 작성해주세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    const text = response.text || "오늘의 운세를 불러올 수 없습니다.";
    return text.replace(/\*\*/g, "");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "오늘의 운세 서비스 점검 중입니다.";
  }
}
