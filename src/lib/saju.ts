import { Solar, Lunar } from 'lunar-javascript';

export interface SajuData {
  yearStem: string;
  yearBranch: string;
  monthStem: string;
  monthBranch: string;
  dayStem: string;
  dayBranch: string;
  hourStem: string;
  hourBranch: string;
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  zodiac: string;
}

export function calculateSaju(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  isLunar: boolean = false,
  isLeap: boolean = false
): SajuData {
  let lunar: any;
  if (isLunar) {
    lunar = Lunar.fromYmd(year, month, day);
    // Note: lunar-javascript handles leap months if needed, but for simplicity we use fromYmd
  } else {
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    lunar = solar.getLunar();
  }

  const eightChar = lunar.getEightChar();
  
  const data: SajuData = {
    yearStem: eightChar.getYearGan(),
    yearBranch: eightChar.getYearZhi(),
    monthStem: eightChar.getMonthGan(),
    monthBranch: eightChar.getMonthZhi(),
    dayStem: eightChar.getDayGan(),
    dayBranch: eightChar.getDayZhi(),
    hourStem: eightChar.getHourGan(),
    hourBranch: eightChar.getHourZhi(),
    fiveElements: {
      wood: 0,
      fire: 0,
      earth: 0,
      metal: 0,
      water: 0
    },
    zodiac: lunar.getZodiac()
  };

  // Simple element calculation (This is a simplified version for UI feedback)
  const allChars = [
    data.yearStem, data.yearBranch,
    data.monthStem, data.monthBranch,
    data.dayStem, data.dayBranch,
    data.hourStem, data.hourBranch
  ];

  const elementMap: Record<string, string> = {
    '甲': 'wood', '乙': 'wood', '寅': 'wood', '卯': 'wood',
    '丙': 'fire', '丁': 'fire', '巳': 'fire', '午': 'fire',
    '戊': 'earth', '己': 'earth', '辰': 'earth', '戌': 'earth', '丑': 'earth', '未': 'earth',
    '庚': 'metal', '辛': 'metal', '申': 'metal', '酉': 'metal',
    '壬': 'water', '癸': 'water', '亥': 'water', '子': 'water'
  };

  allChars.forEach(char => {
    const el = elementMap[char];
    if (el) {
      data.fiveElements[el as keyof typeof data.fiveElements]++;
    }
  });

  return data;
}

export const ELEMENT_COLORS: Record<string, string> = {
  wood: '#4ade80', // Green
  fire: '#f87171', // Red
  earth: '#fbbf24', // Yellow/Gold
  metal: '#9ca3af', // Gray/White
  water: '#60a5fa'  // Blue/Black
};

export const ELEMENT_NAMES: Record<string, string> = {
  wood: '목 (木)',
  fire: '화 (火)',
  earth: '토 (土)',
  metal: '금 (金)',
  water: '수 (水)'
};
