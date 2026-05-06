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
    당신은 세계적인 명리학 권위자이자 따뜻한 인생 상담가입니다. 
    사용자 '${name}'님(${gender})의 사주 팔자를 바탕으로 매우 상세하고 깊이 있는 인생 보고서를 작성해 주세요.
    
    [중요 지침]
    1. **절대로 '갓생', '폼 미쳤다', '억까', '극락' 등 MZ 세대 유행어나 은어를 사용하지 마세요.**
    2. 모든 연령대가 이해할 수 있는 정중하고 격조 있는 표준어를 사용하세요.
    3. 명리학적 용어는 전문성을 유지하되, 초보자도 쉽게 이해할 수 있도록 현대적인 언어로 풀어서 설명하세요.
    4. **강조하고 싶은 키워드나 중요한 문구는 별표(**)를 사용하지 말고, 반드시 HTML의 <mark> 태그로 감싸주세요.** (예: <mark>올해는 재물운이 매우 왕성한 시기입니다</mark>)
    5. 보고서의 분량은 시스템이 허용하는 한 최대한 길고 정성스럽게 작성하여 읽는 이에게 깊은 감동과 통찰을 주어야 합니다.

    [사주 정보]
    - 연주: ${data.yearStem}${data.yearBranch}
    - 월주: ${data.monthStem}${data.monthBranch}
    - 일주: ${data.dayStem}${data.dayBranch}
    - 시주: ${data.hourStem}${data.hourBranch}
    - 오행 분포: 목(${data.fiveElements.wood}), 화(${data.fiveElements.fire}), 토(${data.fiveElements.earth}), 금(${data.fiveElements.metal}), 수(${data.fiveElements.water})
    - 띠: ${data.zodiac}

    [필수 포함 상세 항목]
    1. 【종합 총평 - 타고난 기운의 본질】: 인생을 관통하는 근본적인 에너지와 성정.
    2. 【격국론 - 삶의 지향점】: 사회적으로 어떤 분야에서 가장 큰 두각을 나타낼 수 있는지 분석.
    3. 【용신과 희기 - 운을 돕는 기운】: 나에게 활력을 주는 기운과 주의해야 할 기운에 대한 정밀 진단.
    4. 【오행의 균형 - 심신 건강】: 오행의 과다와 부족에 따른 성격적 특징 및 건강 관리 조언.
    5. 【인간관계와 사회성】: 주변 사람들과의 인연, 소통 스타일 및 사회적 처세술.
    6. 【재물운과 성공 비결】: 평생의 경제적 흐름과 부를 쌓기 위한 핵심 전략.
    7. 【직업과 진로】: 타고난 적성에 가장 부합하는 산업군과 구체적인 직무 추천.
    8. 【애정운과 배우자】: 배우자 인연의 특징과 원만한 가정 생활을 위한 지침.
    9. 【인생 대운의 흐름】: 현재의 운이 나아가고 있는 방향과 미래의 주요 변곡점 설명.
    10. 【개운(開運) 비책】: 운을 좋게 만드는 색상, 숫자, 방향, 행동 양식 등의 실천적인 꿀팁.

    마크다운(Markdown) 형식을 사용하여 가독성 있게 작성하되, 강조는 오직 <mark> 태그만 사용하세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt
    });
    const text = response.text || "분석 결과를 가져오는 중에 오류가 발생했습니다.";
    // Clean up any stray asterisks just in case the model used them
    return text.replace(/\*\*/g, "");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "서비스 이용에 불편을 드려 죄송합니다. 잠시 후 다시 시도해 주세요.";
  }
}

/**
 * 성명학 기반 이름 감명을 수행합니다.
 */
export async function getNameReading(name: string, sajuData: SajuData) {
  const prompt = `
    당신은 성명학 분야의 최고 권위자입니다. 
    '${name}'이라는 성함이 사용자의 사주 오행과 얼마나 조화를 이루는지 분석해 주세요.
    
    [중요 지침]
    1. 유행어나 은어를 일절 배제하고 격조 있는 문체를 사용하세요.
    2. 강조할 부분은 반드시 HTML <mark> 태그를 사용하세요. 별표(**)는 사용하지 마세요.
    
    [사주 오행 분포]
    목(${sajuData.fiveElements.wood}), 화(${sajuData.fiveElements.fire}), 토(${sajuData.fiveElements.earth}), 금(${sajuData.fiveElements.metal}), 수(${sajuData.fiveElements.water})
    
    [분석 필수 항목]
    1. 【음양의 조화】: 성명의 획수 대비 음양 균형.
    2. 【수리 사격 해설】: 원격, 형격, 이격, 정격의 수리적 의미와 시기별 운세.
    3. 【자원오행 분석】: 이름의 기운이 사주에서 부족한 오행을 얼마나 잘 보충하는지 분석.
    4. 【종합 제언】: 이름이 사용자에게 주는 전체적인 운 영향력과 조언.
    
    정성을 담아 상세하게 마크다운 형식으로 작성하세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt
    });
    const text = response.text || "성명 감명 결과를 가져오지 못했습니다.";
    return text.replace(/\*\*/g, "");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "성명 감명 서비스를 잠시 이용할 수 없습니다.";
  }
}

/**
 * 오늘의 띠별 운세를 가져옵니다.
 */
export async function getDailyHoroscope(zodiac: string) {
  const prompt = `
    오늘 하루 '${zodiac}띠'의 운세를 지혜롭고 자상한 어조로 해석해 주세요.
    
    [중요 지침]
    1. 자극적인 표현이나 유행어를 피하고 진정성 있는 조언을 담아주세요.
    2. 중요한 문구는 HTML <mark> 태그로 강조해 주세요.
    
    [필수 항목]
    1. 【오늘의 전반적인 흐름】: 금일 기운의 성격과 주의할 점.
    2. 【항목별 구체적 조언】: 금전, 대인관계, 건강, 애정 등의 세부 운세.
    3. 【행운을 부르는 요소】: 운을 상승시키는 색상, 숫자, 음식 등.
    
    도움이 되는 정보를 상세하게 마크다운 형식으로 작성해 주세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt
    });
    const text = response.text || "오늘의 운세를 불러올 수 없습니다.";
    return text.replace(/\*\*/g, "");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "오늘의 운세 서비스 점검 중입니다.";
  }
}
