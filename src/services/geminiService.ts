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
    당신은 세계 최고의 명리학 박사이자 MZ세대의 니즈를 완벽히 꿰뚫고 있는 운세 전문가입니다. 
    사용자 '${name}'(${gender})의 사주 팔자를 바탕으로 수천 단어 분량의 압도적이고 정밀한 '인생 대백과사전'급 보고서를 작성해주세요.
    
    분석은 명리학 전공 서적 수십 권을 합친 것보다 깊이가 있어야 하며, 아래의 모든 카테고리를 하나도 빠짐없이 매우 디테일하게 설명해야 합니다.
    용어는 전문적이어야 하지만, 설명은 MZ세대가 '극락'을 경험할 정도로 힙하고 이해하기 쉽게(갓생, 억까, 폼 미쳤다, 오히려 좋아 등의 표현 적절히 활용) 작성하세요.

    [사주 정보]
    - 연주: ${data.yearStem}${data.yearBranch}
    - 월주: ${data.monthStem}${data.monthBranch}
    - 일주: ${data.dayStem}${data.dayBranch}
    - 시주: ${data.hourStem}${data.hourBranch}
    - 오행 분포: 목(${data.fiveElements.wood}), 화(${data.fiveElements.fire}), 토(${data.fiveElements.earth}), 금(${data.fiveElements.metal}), 수(${data.fiveElements.water})
    - 띠: ${data.zodiac}

    [필수 포함 상세 카테고리]
    1. 【무친 사주 총평 - 본질적 아우라 분석】: 일주(日柱)를 중심으로 한 타고난 에너지의 크기와 인생의 근본적인 색깔. 명리학 박사 학위 논문 수준의 깊이 있는 통찰을 제공하세요.
    2. 【격국론(格局論) - 인생의 그릇】: 타고난 사회적 그릇과 환경의 특징, 어떤 사회적 위치에서 가장 빛을 발하는가. 원국(原局)의 조화를 심층 분석하세요.
    3. 【용신론(用神論) & 희기(喜忌) - 운의 치트키】: 나를 돕는 기운(용신, 희신)과 나를 힘들게 하는 기운(기신, 구신). 일간(日干)의 강약을 바탕으로 정확한 억부(抑扶), 조후(調候), 통관(通關) 용신을 도출하세요.
    4. 【오행의 밸런스 & 통변】: 수화기제(水火旣濟) 등 오행의 상생상극 흐름 점검 및 부족한 기운을 채우는 비책.
    5. 【십신(十神) 분석 - 관계와 사회성의 지도】: 비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인을 통한 부모, 배우자, 자식, 사회 관계의 실타래를 정교하게 푸세요.
    6. 【12운성(十二運星) & 신살(神殺) - 운명의 변주곡】: 절, 태, 양, 장생, 목욕, 관대, 건록, 제왕, 쇠, 병, 사, 묘 에너지 단계 분석 및 백호, 괴강, 도화, 귀인 등 특수 기운의 조화.
    7. 【성격 & 심리 - 무의식의 뇌구조】: 타고난 심리 체계와 현대 심리학적 해석 결합. 스트레스 상황(억까)에서의 멘탈 관리법.
    8. 【재물 & 성공운 - 부의 알고리즘】: 평생의 재물 흐름, 큰 부를 이루는 결정적 시기, 퀀텀 리프를 위한 투자/재테크 방향.
    9. 【직업 & 커리어 - 커리어 하이 로그북】: 천직 분석, 나의 잠재력을 폭발시킬 수 있는 구체적 산업군과 직무 추천.
    10. 【로맨스 & 애정운 - 소울메이트 매칭】: 배우자 성(星)과 궁(宮)의 안정성 분석, 결혼 및 연애운이 급증하는 구간, 인연의 특징.
    11. 【건강 & 생활 의학 - 롱런하는 갓생】: 오행의 과다/부족에 따른 신체적 약점 보완, 추천 식이요법 및 운동.
    12. 【대운(大運)의 흐름 & 개운(開運) 솔루션】: 10년 주기 대운의 흐름 변화 분석 및 운빨을 강제로 개방하는 색상, 숫자, 방향, 풍수 인테리어 꿀팁.

    마크다운(Markdown) 형식을 사용하여 제목과 리스트를 매우 상세하고 풍부하게 작성해주세요. 
    내용은 논리적이고 일관적이어야 하며, 가능한 가장 긴 답변을 출력하여 사용자에게 정성이 느껴지게 하세요.
    볼드(**) 문법은 절대 틀리지 마세요. 텍스트 내에서 **가 그대로 노출되지 않도록 주의하세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
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
    
    [분석 필수 항목]
    1. 【음양 조화 - 에너지 밸런스 점검】: 획수의 음양 조화가 운명에 미치는 영향.
    2. 【수리 분석 - 인생 시기별 폼 분석】: 원격, 형격, 이격, 정격 4격 수리를 통한 초년, 청년, 장년, 말년 운세.
    3. 【오행 보완 관계 - 사주 부족분 채우기】: 자원오행(資源五行)이 사주의 부족한 기운을 얼마나 성공적으로 보완하는가.
    4. 【종합 포인트 & 갓생 조언】: 이름이 주는 전체적인 이미지와 개운을 위한 제언.
    
    분석은 전문적이지만 표현은 '맛깔나게' (예: 폼 미쳤다, 오히려 좋아, 갓벽 등) 섞어서 마크다운 형식으로 최소 1500자 이상 상세히 작성해주세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
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
    
    [분석 필수 항목]
    1. 【오늘의 텐션 & 키워드】: 오늘 당신의 운빨 지수와 핵심 키워드.
    2. 【디테일 포인트 - 연애, 금전, 사업(갓생)】: 각 영역별 구체적인 행동 강령과 운 흐름.
    3. 【행운 스탯 강화 - 아이템, 컬러, 숫자】: 운을 올려주는 실질적인 아이템 추천.
    
    "억까는 피하고 운빨은 챙기자!"는 느낌으로 친절하고 재치 있게 마크다운 형식으로 작성해주세요. 최소 1000자 이상 목표.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: prompt
    });
    return response.text || "오늘의 운세를 불러올 수 없습니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "오늘의 운세 서비스 점검 중입니다.";
  }
}
