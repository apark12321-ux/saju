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
 * 사주 정보를 바탕으로 일반 사용자도 이해하기 쉬운 리포트를 생성합니다.
 */
export async function getSajuInterpretation(data: SajuData, name: string, gender: string) {
  const prompt = `
    당신은 정통 명리학을 현대적인 언어로 쉽게 설명하는 사주 리포트 작가입니다.
    사용자 '${name}'님(${gender})의 사주 정보를 바탕으로 일반인도 바로 이해할 수 있는 개인 리포트를 작성해 주세요.

    [작성 원칙]
    1. 겁을 주거나 미래를 단정하는 표현을 피하고, 참고용 조언으로 설명하세요.
    2. 어려운 명리학 용어는 반드시 쉬운 말로 풀어서 설명하세요.
    3. 유행어, 과장 광고, 미신적 공포 표현을 사용하지 마세요.
    4. 중요한 문구는 별표(**) 대신 HTML의 <mark> 태그로 감싸주세요.
    5. 결제 화면에서 읽히는 리포트이므로 목차가 명확하고 저장하기 좋은 형태로 작성하세요.

    [사주 정보]
    - 연주: ${data.yearStem}${data.yearBranch}
    - 월주: ${data.monthStem}${data.monthBranch}
    - 일주: ${data.dayStem}${data.dayBranch}
    - 시주: ${data.hourStem}${data.hourBranch}
    - 오행 분포: 목(${data.fiveElements.wood}), 화(${data.fiveElements.fire}), 토(${data.fiveElements.earth}), 금(${data.fiveElements.metal}), 수(${data.fiveElements.water})
    - 띠: ${data.zodiac}

    [반드시 포함할 리포트 목차]
    1. 【한눈에 보는 요약】: 이 사람의 전체 성향과 인생 흐름을 5줄 이내로 정리.
    2. 【타고난 성향】: 성격, 강점, 조심할 습관을 쉬운 말로 설명.
    3. 【오행 균형 해석】: 목·화·토·금·수의 많고 적음이 생활에서 어떻게 드러나는지 설명.
    4. 【재물운과 돈 관리】: 돈을 버는 방식, 돈이 새는 패턴, 현실적인 관리 팁.
    5. 【직업·사업·이직 흐름】: 잘 맞는 일의 방식, 조직/사업 성향, 이직 판단 포인트.
    6. 【연애·배우자운】: 관계 스타일, 잘 맞는 사람, 갈등을 줄이는 방법.
    7. 【건강 관리 경향】: 의학적 진단이 아니라 생활 습관 관점의 관리 조언.
    8. 【올해의 흐름】: 올해 집중하면 좋은 것과 조심하면 좋은 것.
    9. 【실천 체크리스트】: 오늘부터 할 수 있는 행동 5가지.

    마크다운 형식으로 작성하세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt
    });
    const text = response.text || "분석 결과를 가져오는 중에 오류가 발생했습니다.";
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
    당신은 이름 감명을 일반인이 이해하기 쉬운 말로 설명하는 상담가입니다.
    '${name}'이라는 이름이 사용자의 사주 오행과 어떻게 어울리는지 분석해 주세요.

    [작성 원칙]
    1. 과장, 공포, 단정 표현을 피하고 참고용 조언으로 설명하세요.
    2. 어려운 성명학 용어는 쉬운 말로 풀어 주세요.
    3. 중요한 문구는 HTML <mark> 태그로 강조하고, 별표(**)는 사용하지 마세요.

    [사주 오행 분포]
    목(${sajuData.fiveElements.wood}), 화(${sajuData.fiveElements.fire}), 토(${sajuData.fiveElements.earth}), 금(${sajuData.fiveElements.metal}), 수(${sajuData.fiveElements.water})

    [분석 항목]
    1. 【이름의 첫인상】: 이름이 주는 느낌과 장점.
    2. 【사주와의 조화】: 부족하거나 강한 오행을 어떻게 보완하는지.
    3. 【관계·일·재물 이미지】: 이름이 사회생활에서 주는 인상.
    4. 【종합 의견】: 유지해도 좋은 점과 보완하면 좋은 점.

    마크다운 형식으로 작성하세요.
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
    오늘 하루 '${zodiac}띠'의 운세를 쉽고 담백한 조언 형태로 작성해 주세요.

    [작성 원칙]
    1. 자극적인 표현, 공포심 유발, 과장 광고 문구를 피하세요.
    2. 중요한 문구는 HTML <mark> 태그로 강조하세요.
    3. 실제 생활에서 참고할 수 있는 짧은 조언 위주로 작성하세요.

    [필수 항목]
    1. 【오늘의 전체 흐름】
    2. 【돈·일·관계 조언】
    3. 【주의하면 좋은 점】
    4. 【오늘의 작은 실천】

    마크다운 형식으로 작성하세요.
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
