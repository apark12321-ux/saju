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
    당신은 세계적인 명리학 박사이자 MZ세대와 소통하는 '힙한' 운세 전문가입니다. 
    사용자 '${name}'(${gender})의 사주 팔자를 바탕으로 수십 페이지 분량의 심층 보고서에 버금가는 아주 디테일하고 방대한 분석을 제공해주세요.
    
    분석은 전문 명리학적 깊이(격국, 용신, 대운의 흐름 등)를 갖추되, 
    MZ세대들이 공감할 수 있는 갓생, 폼미쳤다, 오히려 좋아, 억까 등 트렌디한 용어를 섞어 지루하지 않고 가독성 좋게 작성해주세요.

    [사주 정보]
    - 연주: ${data.yearStem}${data.yearBranch}
    - 월주: ${data.monthStem}${data.monthBranch}
    - 일주: ${data.dayStem}${data.dayBranch}
    - 시주: ${data.hourStem}${data.hourBranch}
    - 오행 분포: 목(${data.fiveElements.wood}), 화(${data.fiveElements.fire}), 토(${data.fiveElements.earth}), 금(${data.fiveElements.metal}), 수(${data.fiveElements.water})
    - 띠: ${data.zodiac}
    
    [필수 포함 내용]
    1. 【무친 사주 총평】: 전체적인 기운의 흐름과 일주가 가진 본질적 아우라 (PhD급 심층 분석)
    2. 【성격&인간관계 - 뇌 구조 분석】: 타고난 바이브와 소통 스타일, 인간관계에서의 억까 방지법
    3. 【재물&성공운 - 갓생 로드맵】: 재물 그릇의 크기, 부의 파이프라인 형성 시기, 성공 필살기
    4. 【직업&진로 - 커리어 치트키】: 오행의 균형을 활용한 최적의 직무 및 업종 추천
    5. 【연애&애정운 - 로맨스 폼 미쳤다】: 배우자 복과 인연의 특징, 설레는 만남의 구간
    6. 【건강&멘탈 관리 - 갓생의 기본】: 주의해야 할 신체 부위와 멘탈 관리법
    7. 【인생 개운 꿀팁】: 운빨을 끌어올리는 색상, 숫자, 방향, 공간 풍수

    마크다운(Markdown) 형식을 사용하여 제목과 불렛포인트를 적극 활용하고, 최대한 풍부하고 상세하게(최소 2500자 이상 목표) 작성해주세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || "분석 결과를 가져오는 중에 오류가 발생했습니다.";
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
    당신은 성명학(이름풀이) 최고 전문가이자 MZ세대의 언어 습관을 완벽히 이해한 작명 가이드입니다. 
    성함 '${name}'이(가) 사용자의 사주 오행과 얼마나 '찰떡'인지, 혹은 '억까'인지 분석해주세요.
    
    [사주 오행 분포]
    목(${sajuData.fiveElements.wood}), 화(${sajuData.fiveElements.fire}), 토(${sajuData.fiveElements.earth}), 금(${sajuData.fiveElements.metal}), 수(${sajuData.fiveElements.water})
    
    1. 【음양 조화 - 에너지 밸런스 점검】
    2. 【수리 분석 - 인생 시기에 따른 폼 분석】 (초년, 청년, 장년, 말년)
    3. 【오행 보완 관계 - 사주 부족분 채우기】
    4. 【종합 포인트 및 갓생 조언】
    
    분석은 전문적이지만 표현은 '맛깔나게' (예: 폼 미쳤다, 오히려 좋아, 갓벽 등) 섞어서 마크다운 형식으로 1500자 이상 상세히 작성해주세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || "성명 감명 결과를 가져오지 못했습니다.";
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
    오늘 하루 '${zodiac}띠'의 운세를 MZ세대의 감성으로 '힙하게' 해석해 주세요.
    
    1. 【오늘의 텐션 & 키워드】
    2. 【디테일 포인트 - 연애, 금전, 사업(갓생)】
    3. 【행운 스탯 강화 - 아이템, 컬러, 숫자】
    
    "억까는 피하고 운빨은 챙기자!"는 느낌으로 친절하고 재치 있게 마크다운 형식으로 작성해주세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || "오늘의 운세를 불러올 수 없습니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "오늘의 운세 서비스 점검 중입니다.";
  }
}
