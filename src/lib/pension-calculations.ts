import { PENSION_CONSTANTS } from './pension-constants';
import { BasicInfo, IncomeSection } from '../store/simulator';

// 標準報酬月額の計算
export function calculateStandardRemuneration(monthlyIncome: number): number {
  // 標準報酬月額表に基づく変換
  const grade = PENSION_CONSTANTS.STANDARD_REMUNERATION_TABLE.find(
    g => monthlyIncome >= g.min && monthlyIncome < g.max
  );
  
  // 該当するグレードが見つからない場合
  if (!grade) {
    return monthlyIncome < PENSION_CONSTANTS.STANDARD_REMUNERATION_TABLE[0].min 
      ? PENSION_CONSTANTS.STANDARD_REMUNERATION_TABLE[0].amount
      : PENSION_CONSTANTS.STANDARD_REMUNERATION_TABLE[PENSION_CONSTANTS.STANDARD_REMUNERATION_TABLE.length - 1].amount;
  }
  
  return grade.amount;
}

// 標準賞与額の計算
export function calculateStandardBonus(bonusAmount: number): number {
  // 1回あたり150万円が上限
  return Math.min(bonusAmount, PENSION_CONSTANTS.MAX_MONTHLY_BONUS);
}

// 職歴から加入月数を計算
export function calculatePensionMonths(basicInfo: BasicInfo): {
  welfareMonths: number;
  welfareMonthsBefore2003: number;
  welfareMonthsAfter2003: number;
  nationalMonths: number;
  category3Months: number;
} {
  const workingYears = basicInfo.currentAge - (basicInfo.workStartAge || 22);
  const workingMonths = workingYears * 12;
  
  // 2003年4月時点でのユーザー年齢を計算
  const birthYear = basicInfo.startYear - basicInfo.currentAge;
  const ageIn200304 = 2003 - birthYear + 4/12;
  
  // 2003年4月以前の就労月数
  let monthsUntil200304 = 0;
  if (ageIn200304 >= (basicInfo.workStartAge || 22)) {
    monthsUntil200304 = Math.round((ageIn200304 - (basicInfo.workStartAge || 22)) * 12);
  }
  
  // 2003年4月以降の就労月数
  const monthsAfter200304 = Math.max(0, workingMonths - monthsUntil200304);
  
  let welfareMonths = 0;
  let welfareMonthsBefore2003 = 0;
  let welfareMonthsAfter2003 = 0;
  let nationalMonths = 0;
  let category3Months = 0;
  
  switch (basicInfo.occupation) {
    case 'company_employee':
    case 'part_time_with_pension':
      welfareMonths = workingMonths;
      welfareMonthsBefore2003 = monthsUntil200304;
      welfareMonthsAfter2003 = monthsAfter200304;
      break;
    case 'part_time_without_pension':
    case 'self_employed':
      nationalMonths = workingMonths;
      break;
    case 'homemaker':
      category3Months = workingMonths;
      break;
  }
  
  return { 
    welfareMonths, 
    welfareMonthsBefore2003, 
    welfareMonthsAfter2003, 
    nationalMonths, 
    category3Months 
  };
}

// 収入データから標準報酬月額と標準賞与額の履歴を計算
export function calculateStandardRemunerationHistory(
  incomeData: IncomeSection,
  currentYear: number
): { 
  standardRemuneration: { [year: number]: number };
  standardBonus: { [year: number]: number };
  avgStandardRemuneration: number;
} {
  const standardRemuneration: { [year: number]: number } = {};
  const standardBonus: { [year: number]: number } = {};
  
  // 給与収入の項目を探す
  const salaryItem = incomeData.personal.find(item => item.name === '給与収入');
  
  // 賞与収入の項目を探す
  const bonusItem = incomeData.personal.find(item => item.name === '賞与収入');
  
  if (salaryItem) {
    // 各年の年収から標準報酬月額を計算
    Object.entries(salaryItem.amounts).forEach(([year, amount]) => {
      const yearNum = parseInt(year);
      const monthlyIncome = Math.round(amount * 10000 / 12); // 年収を12で割って月収を算出
      standardRemuneration[yearNum] = calculateStandardRemuneration(monthlyIncome);
    });
  }
  
  if (bonusItem) {
    // 各年の賞与から標準賞与額を計算
    Object.entries(bonusItem.amounts).forEach(([year, amount]) => {
      const yearNum = parseInt(year);
      // 賞与は年間合計額なので、そのまま使用（上限あり）
      standardBonus[yearNum] = Math.min(amount * 10000, PENSION_CONSTANTS.MAX_ANNUAL_BONUS);
    });
  }
  
  // 平均標準報酬月額を計算
  const values = Object.values(standardRemuneration);
  const avgStandardRemuneration = values.length > 0 
    ? Math.round(values.reduce((acc, val) => acc + val, 0) / values.length)
    : 0;
  
  return { standardRemuneration, standardBonus, avgStandardRemuneration };
}

// 基礎年金額を計算
export function calculateBasicPensionAmount(totalMonths: number): number {
  // 基礎年金額 = 780,900 × (納付月数 ÷ 480)
  const ratio = Math.min(totalMonths / PENSION_CONSTANTS.FULL_PENSION_MONTHS, 1);
  return Math.floor(PENSION_CONSTANTS.BASIC_PENSION_FULL_AMOUNT * ratio);
}

// 厚生年金額を計算
export function calculateWelfarePensionAmount(
  avgStandardRemuneration: number,
  monthsBeforeApril2003: number,
  monthsAfterApril2003: number
): number {
  // 2003年3月以前分: 平均標準報酬月額 × 7.125/1000 × 加入月数
  const amountBefore2003 = avgStandardRemuneration * 
    PENSION_CONSTANTS.WELFARE_PENSION_RATE_BEFORE_2003 * 
    monthsBeforeApril2003;
  
  // 2003年4月以降分: 平均標準報酬月額 × 5.481/1000 × 加入月数
  const amountAfter2003 = avgStandardRemuneration * 
    PENSION_CONSTANTS.WELFARE_PENSION_RATE_AFTER_2003 * 
    monthsAfterApril2003;
  
  return Math.floor(amountBefore2003 + amountAfter2003);
}

// 繰上げ/繰下げによる調整率を計算
export function calculatePensionAdjustmentRate(pensionStartAge: number): number {
  const standardAge = PENSION_CONSTANTS.STANDARD_PENSION_START_AGE;
  const monthDiff = (pensionStartAge - standardAge) * 12;
  
  if (monthDiff === 0) {
    // 標準支給開始年齢の場合は調整なし
    return 1.0;
  } else if (monthDiff < 0) {
    // 繰上げ受給（減額）: 1 か月につき -0.4%
    return 1.0 - Math.abs(monthDiff) * PENSION_CONSTANTS.EARLY_PENSION_RATE_PER_MONTH;
  } else {
    // 繰下げ受給（増額）: 1 か月につき +0.7%
    return 1.0 + monthDiff * PENSION_CONSTANTS.DELAYED_PENSION_RATE_PER_MONTH;
  }
}

// 在職老齢年金制度による調整
export function adjustPensionForWorking(
  basicPension: number,
  welfarePension: number,
  monthlyIncome: number,
  age: number
): { basicPension: number; welfarePension: number } {
  // 月額に換算
  const monthlyBasicPension = basicPension / 12;
  const monthlyWelfarePension = welfarePension / 12;
  
  // 基礎年金は在職老齢年金の対象外
  let adjustedMonthlyWelfare = monthlyWelfarePension;
  
  // 年齢に応じた基準を選択
  const threshold = age < 65 ? 
    PENSION_CONSTANTS.PENSION_REDUCTION_UNDER_65.THRESHOLD : 
    PENSION_CONSTANTS.PENSION_REDUCTION_OVER_65.THRESHOLD;
  
  // 総報酬月額 = 月給 + 1/12 賞与
  // ここでは月給のみで簡略化（賞与は計算済みだがここでは省略）
  const totalMonthlyIncome = monthlyIncome + monthlyBasicPension + monthlyWelfarePension;
  
  // 基準額超過分を計算
  const excessAmount = Math.max(0, totalMonthlyIncome - threshold);
  
  // 支給停止額を計算: (総報酬月額 + 基本月額 - 基準額) ÷ 2
  const suspensionAmount = Math.min(monthlyWelfarePension, excessAmount / 2);
  
  // 調整後の厚生年金額
  adjustedMonthlyWelfare = monthlyWelfarePension - suspensionAmount;
  
  // 年額に戻して返す
  return {
    basicPension: basicPension,
    welfarePension: Math.floor(adjustedMonthlyWelfare * 12)
  };
}

// 総合的な年金計算
export function calculatePension(
  basicInfo: BasicInfo,
  incomeData: IncomeSection,
  currentYear: number
): {
  standardRemuneration: { [year: number]: number };
  standardBonus: { [year: number]: number };
  avgStandardRemuneration: number;
  welfareMonths: number;
  welfareMonthsBefore2003: number;
  welfareMonthsAfter2003: number;
  nationalMonths: number;
  category3Months: number;
  basicPensionAmount: number;
  welfarePensionAmount: number;
  totalPensionAmount: number;
  adjustmentRate: number;
} {
  // 1. 職歴から加入月数を計算
  const { 
    welfareMonths, 
    welfareMonthsBefore2003, 
    welfareMonthsAfter2003, 
    nationalMonths, 
    category3Months 
  } = calculatePensionMonths(basicInfo);
  
  // 2. 収入データから標準報酬月額と標準賞与額を計算
  const { 
    standardRemuneration, 
    standardBonus, 
    avgStandardRemuneration 
  } = calculateStandardRemunerationHistory(incomeData, currentYear);
  
  // 3. 基礎年金額を計算
  const rawBasicPensionAmount = calculateBasicPensionAmount(welfareMonths + nationalMonths + category3Months);
  
  // 4. 厚生年金額を計算
  const rawWelfarePensionAmount = calculateWelfarePensionAmount(
    avgStandardRemuneration, 
    welfareMonthsBefore2003, 
    welfareMonthsAfter2003
  );
  
  // 5. 繰上げ/繰下げ調整率を計算
  const adjustmentRate = calculatePensionAdjustmentRate(basicInfo.pensionStartAge || 65);
  
  // 6. 調整後の年金額を計算
  const adjustedBasicPension = Math.floor(rawBasicPensionAmount * adjustmentRate);
  const adjustedWelfarePension = Math.floor(rawWelfarePensionAmount * adjustmentRate);
  
  // 7. 在職老齢年金の調整（就労予定ありの場合）
  let finalBasicPension = adjustedBasicPension;
  let finalWelfarePension = adjustedWelfarePension;
  
  if (basicInfo.willWorkAfterPension) {
    // 年金受給開始時点での就労収入を推定
    const pensionStartYear = basicInfo.startYear + ((basicInfo.pensionStartAge || 65) - basicInfo.currentAge);
    
    // 給与収入を取得
    const salaryItem = incomeData.personal.find(item => item.name === '給与収入');
    let estimatedMonthlyIncome = 0;
    
    if (salaryItem && salaryItem.amounts[pensionStartYear]) {
      estimatedMonthlyIncome = salaryItem.amounts[pensionStartYear] * 10000 / 12;
    }
    
    // 在職老齢年金の調整を適用
    const adjustedPension = adjustPensionForWorking(
      adjustedBasicPension,
      adjustedWelfarePension,
      estimatedMonthlyIncome,
      basicInfo.pensionStartAge || 65
    );
    
    finalBasicPension = adjustedPension.basicPension;
    finalWelfarePension = adjustedPension.welfarePension;
  }
  
  // 結果を返す
  return {
    standardRemuneration,
    standardBonus,
    avgStandardRemuneration,
    welfareMonths,
    welfareMonthsBefore2003,
    welfareMonthsAfter2003,
    nationalMonths,
    category3Months,
    basicPensionAmount: finalBasicPension,
    welfarePensionAmount: finalWelfarePension,
    totalPensionAmount: finalBasicPension + finalWelfarePension,
    adjustmentRate
  };
}

// 年金計算の修正部分 - calculatePensionForYear 関数の修正

export function calculatePensionForYear(
  basicInfo: BasicInfo,
  incomeData: IncomeSection,
  year: number
): number {
  // 現在の年齢を計算
  const age = basicInfo.currentAge + (year - basicInfo.startYear);
  
  // 年金受給開始年齢より前なら年金なし
  if (age < (basicInfo.pensionStartAge || 65)) {
    return 0;
  }
  
  // 職業に応じた基本的な年金額を計算
  let pensionAmount = 0;
  
  // 基礎年金（全ての職業区分に共通）: 約78万円/年
  pensionAmount += 78.0;
  
  // 厚生年金（会社員と厚生年金ありのパートタイムのみ）
  if (basicInfo.occupation === 'company_employee' || basicInfo.occupation === 'part_time_with_pension') {
    // 給与収入から厚生年金を計算（簡易計算）
    const salaryItem = incomeData.personal.find(item => item.name === '給与収入');
    
    // 修正: 現在のシミュレーション年の給与を使用する
    const salary = salaryItem?.amounts[year] || 0;
    
    if (salary > 0) {
      // 厚生年金は給与の15-20%程度を加算（例）
      pensionAmount += salary * 0.18;
    } else {
      // 給与データがなければ標準的な厚生年金額（例：月額5-15万円）
      pensionAmount += 100.0; // 年間100万円程度を想定
    }
  }
  
  // 小数点以下1桁に丸める
  return Math.round(pensionAmount * 10) / 10;
}

// 配偶者の年金を計算する関数（CashFlowForm.tsxで使用）
export function calculateSpousePensionForYear(
  basicInfo: BasicInfo,
  incomeData: IncomeSection,
  year: number
): number {
  // 配偶者がいない場合は0を返す
  if (basicInfo.maritalStatus === 'single') {
    return 0;
  }
  
  // 配偶者の年齢を計算
  let spouseAge = 0;
  
  if (basicInfo.maritalStatus === 'married' && basicInfo.spouseInfo?.currentAge) {
    // 既婚の場合
    spouseAge = basicInfo.spouseInfo.currentAge + (year - basicInfo.startYear);
  } else if (basicInfo.maritalStatus === 'planning' && basicInfo.spouseInfo?.marriageAge && basicInfo.spouseInfo?.age) {
    // 結婚予定の場合
    const marriageYear = basicInfo.startYear + (basicInfo.spouseInfo.marriageAge - basicInfo.currentAge);
    
    // 結婚前は配偶者なし
    if (year < marriageYear) {
      return 0;
    }
    
    // 結婚後の配偶者の年齢
    const ageAtMarriage = basicInfo.spouseInfo.age;
    spouseAge = ageAtMarriage + (year - marriageYear);
  } else {
    // 配偶者の情報が不完全
    return 0;
  }
  
  // 配偶者の年金受給開始年齢（デフォルト65歳）
  const spousePensionStartAge = 65;
  
  // 受給開始年齢に達していなければ0
  if (spouseAge < spousePensionStartAge) {
    return 0;
  }

   // 配偶者の職業タイプに基づいて年金種別を判断
  const spouseOccupation = basicInfo.spouseInfo?.occupation || 'homemaker';
  
  // 基礎年金（全職業共通）: 約78万円/年
  let spousePension = 78.0;
  
  // 厚生年金（会社員と厚生年金ありのパートタイムのみ）
  if (spouseOccupation === 'company_employee' || spouseOccupation === 'part_time_with_pension') {
    // 配偶者の収入データから年収を取得
    const spouseIncomeItem = incomeData.personal.find(i => i.name === '配偶者収入');
    
    // 修正: 現在のシミュレーション年の収入を使用
    let spouseAnnualIncome = 0;
    if (spouseIncomeItem) {
      spouseAnnualIncome = spouseIncomeItem.amounts[year] || 0;
    }
    
    if (spouseAnnualIncome > 0) {
      // 厚生年金は給与の約18%程度と仮定
      spousePension += spouseAnnualIncome * 0.18;
    } else {
      // 標準的な厚生年金額
      spousePension += 100.0; // 年間100万円程度
    }
  }
  
  // 小数点以下1桁に丸める
  return Math.round(spousePension * 10) / 10;
}