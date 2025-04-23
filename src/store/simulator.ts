import { create } from 'zustand';
import { calculateNetIncome, calculateHousingExpense, calculatePension } from '@/lib/calculations';
import { 
  calculatePensionForYear, 
  calculateSpousePensionForYear 
} from '@/lib/pension-calculations';

type Occupation = 'company_employee' | 'part_time_with_pension' | 'part_time_without_pension' | 'self_employed' | 'homemaker';

export interface IncomeItem {
  id: string;
  name: string;
  type: 'income' | 'profit' | 'side';
  category?: string;
  amounts: { [year: number]: number };
  // 原本額面データを保存
  _originalAmounts?: { [year: number]: number };
  // 手取り額を保存
  _netAmounts?: { [year: number]: number };
  // 投資関連プロパティ
  investmentRatio: number; 
  maxInvestmentAmount: number;
  // 自動計算フラグ
  isAutoCalculated?: boolean;
}


export interface IncomeSection {
  personal: IncomeItem[];
  corporate: IncomeItem[];
}

// Expense types
export interface ExpenseItem {
  id: string;
  name: string;
  type: 'living' | 'housing' | 'education' | 'other';
  category?: string;
  amounts: { [year: number]: number };
}

export interface ExpenseSection {
  personal: ExpenseItem[];
  corporate: ExpenseItem[];
}

// Asset types
export interface AssetItem {
  id: string;
  name: string;
  type: 'cash' | 'investment' | 'property' | 'other';
  category?: string;
  amounts: { [year: number]: number };
  isInvestment?: boolean;
}

export interface AssetSection {
  personal: AssetItem[];
  corporate: AssetItem[];
}

// Liability types
export interface LiabilityItem {
  id: string;
  name: string;
  type: 'loan' | 'credit' | 'other';
  category?: string;
  amounts: { [year: number]: number };
  interestRate?: number;
  termYears?: number;
}

export interface LiabilitySection {
  personal: LiabilityItem[];
  corporate: LiabilityItem[];
}

// History types
export interface HistoryEntry {
  timestamp: number;
  type: 'income' | 'expense' | 'asset' | 'liability';
  section: 'personal' | 'corporate';
  itemId: string;
  year: number;
  previousValue: number;
  newValue: number;
}

export interface BasicInfo {
  currentAge: number;
  startYear: number;
  deathAge: number;
  gender: 'male' | 'female';
  monthlyLivingExpense: number;
  occupation: Occupation;
  maritalStatus: 'single' | 'married' | 'planning';
  housingInfo: {
    type: 'rent' | 'own';
    rent?: {
      monthlyRent: number;
      annualIncreaseRate: number;
      renewalFee: number;
      renewalInterval: number;
    };
    own?: {
      purchaseYear: number;
      purchasePrice: number;
      loanAmount: number;
      interestRate: number;
      loanTermYears: number;
      maintenanceCostRate: number;
    };
  };
  spouseInfo?: {
    age?: number;
    currentAge?: number;
    marriageAge?: number;
    occupation?: Occupation;
    additionalExpense?: number;
  };
  children: {
    currentAge: number;
    educationPlan: {
      nursery: string;
      preschool: string;
      elementary: string;
      juniorHigh: string;
      highSchool: string;
      university: string;
    };
  }[];
  plannedChildren: {
    yearsFromNow: number;
    educationPlan: {
      nursery: string;
      preschool: string;
      elementary: string;
      juniorHigh: string;
      highSchool: string;
      university: string;
    };
  }[];
  // 年金関連フィールド
  workStartAge?: number;
  pensionStartAge?: number;
  willWorkAfterPension?: boolean;
}

export interface Parameters {
  inflationRate: number;
  educationCostIncreaseRate: number;
  investmentReturn: number;
  investmentRatio?: number;
  maxInvestmentAmount?: number;
}

export interface CashFlowData {
  [year: number]: {
    mainIncome: number;
    sideIncome: number;
    spouseIncome: number;
    pensionIncome: number; // 年金収入
    spousePensionIncome: number; // 配偶者年金収入
    investmentIncome: number; // 運用収益
    livingExpense: number;
    housingExpense: number;
    educationExpense: number;
    otherExpense: number;
    personalAssets: number;
    investmentAmount: number; // 投資に回した金額
    totalInvestmentAssets: number; // 運用資産合計
    personalBalance: number;
    personalTotalAssets: number;
    corporateIncome: number;
    corporateOtherIncome: number;
    corporateExpense: number;
    corporateOtherExpense: number;
    corporateBalance: number;
    corporateTotalAssets: number;
  };
}

interface SimulatorState {
  currentStep: number;
  basicInfo: BasicInfo;
  parameters: Parameters;
  cashFlow: CashFlowData;
  history: HistoryEntry[];
  
  // Form data
  incomeData: IncomeSection;
  expenseData: ExpenseSection;
  assetData: AssetSection;
  liabilityData: LiabilitySection;
  lifeEvents: any[];

  // Actions
  setCurrentStep: (step: number) => void;
  setBasicInfo: (info: Partial<BasicInfo>) => void;
  setParameters: (params: Partial<Parameters>) => void;
  setCashFlow: (data: CashFlowData) => void;
  updateCashFlowValue: (year: number, field: keyof CashFlowData[number], value: number) => void;
  initializeCashFlow: () => void;
  initializeFormData: () => void;
  syncCashFlowFromFormData: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;

  // ライフイベント
  addLifeEvent: (event: any) => void;
  removeLifeEvent: (index: number) => void;

  // Form data actions
  setIncomeData: (data: IncomeSection) => void;
  setExpenseData: (data: ExpenseSection) => void;
  setAssetData: (data: AssetSection) => void;
  setLiabilityData: (data: LiabilitySection) => void;
  
  // History actions
  addHistoryEntry: (entry: Omit<HistoryEntry, 'timestamp'>) => void;
  clearHistory: () => void;
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  currentStep: 1,
  basicInfo: {
    currentAge: 30,
    startYear: new Date().getFullYear(),
    deathAge: 80,
    gender: 'male',
    monthlyLivingExpense: 0,
    occupation: 'company_employee',
    maritalStatus: 'single',
    housingInfo: {
      type: 'rent',
      rent: {
        monthlyRent: 0,
        annualIncreaseRate: 0,
        renewalFee: 0,
        renewalInterval: 2,
      },
    },
    children: [],
    plannedChildren: [],
    // 年金関連初期値
    workStartAge: 22,
    pensionStartAge: 65,
    willWorkAfterPension: false,
  },
  parameters: {
    inflationRate: 1.0,
    educationCostIncreaseRate: 1.0,
    investmentReturn: 1.0,
    investmentRatio: 10.0, // 初期投資割合 10%
    maxInvestmentAmount: 100.0, // 初期最大投資額 100万円
  },
  cashFlow: {},
  history: [],
  lifeEvents: [],

  // Initialize form data
  incomeData: {
    personal: [
      { id: '1', name: '給与収入', type: 'income', category: 'income', amounts: {}, investmentRatio: 10, maxInvestmentAmount: 100 },
      { id: '2', name: '事業収入', type: 'profit', category: 'income', amounts: {}, investmentRatio: 10, maxInvestmentAmount: 100 },
      { id: '3', name: '副業収入', type: 'side', category: 'income', amounts: {}, investmentRatio: 10, maxInvestmentAmount: 100 },
    ],
    corporate: [
      { id: '1', name: '売上', type: 'income', category: 'income', amounts: {}, investmentRatio: 10, maxInvestmentAmount: 100 },
      { id: '2', name: 'その他収入', type: 'income', category: 'income', amounts: {}, investmentRatio: 10, maxInvestmentAmount: 100 },
    ],
  },
  expenseData: {
    personal: [
      { id: '1', name: '生活費', type: 'living', category: 'living', amounts: {} },
      { id: '2', name: '住居費', type: 'housing', category: 'housing', amounts: {} },
      { id: '3', name: '教育費', type: 'education', category: 'other', amounts: {} },
      { id: '4', name: 'その他', type: 'other', category: 'other', amounts: {} },
    ],
    corporate: [
      { id: '1', name: '事業経費', type: 'other', category: 'other', amounts: {} },
      { id: '2', name: 'その他経費', type: 'other', category: 'other', amounts: {} },
    ],
  },
  assetData: {
    personal: [
      { id: '1', name: '現金・預金', type: 'cash', category: 'asset', amounts: {} },
      { id: '2', name: '株式', type: 'investment', category: 'asset', amounts: {}, isInvestment: true },
      { id: '3', name: '投資信託', type: 'investment', category: 'asset', amounts: {}, isInvestment: true },
      { id: '4', name: '不動産', type: 'property', category: 'asset', amounts: {} },
    ],
    corporate: [
      { id: '1', name: '現金預金', type: 'cash', category: 'asset', amounts: {} },
      { id: '2', name: '設備', type: 'property', category: 'asset', amounts: {} },
      { id: '3', name: '在庫', type: 'other', category: 'asset', amounts: {} },
    ],
  },
  liabilityData: {
    personal: [
      { id: '1', name: 'ローン', type: 'loan', category: 'liability', amounts: {}, interestRate: 1.0, termYears: 35 },
      { id: '2', name: 'クレジット残高', type: 'credit', category: 'liability', amounts: {} },
    ],
    corporate: [
      { id: '1', name: '借入金', type: 'loan', category: 'liability', amounts: {}, interestRate: 2.0, termYears: 10 },
      { id: '2', name: '未払金', type: 'other', category: 'liability', amounts: {} },
    ],
  },

  // ライフイベント
  addLifeEvent: (event) => {
    set((state) => ({
      lifeEvents: [...state.lifeEvents, event],
    }));
  },
  
  removeLifeEvent: (index) => {
    set((state) => ({
      lifeEvents: state.lifeEvents.filter((_, i) => i !== index),
    }));
  },

  // Actions
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setBasicInfo: (info) => {
    set((state) => ({ basicInfo: { ...state.basicInfo, ...info } }));
    get().initializeFormData();
    get().initializeCashFlow();
  },
  
  setParameters: (params) => {
    set((state) => ({ parameters: { ...state.parameters, ...params } }));
    get().initializeCashFlow();
  },
  
  setCashFlow: (data) => set({ cashFlow: data }),
  
  updateCashFlowValue: (year, field, value) => {
    const roundedValue = Number(value.toFixed(1));
    set((state) => ({
      cashFlow: {
        ...state.cashFlow,
        [year]: {
          ...state.cashFlow[year],
          [field]: roundedValue,
        },
      },
    }));
    get().initializeCashFlow();
  },

  // LocalStorage
  saveToLocalStorage: () => {
    const state = get();
    try {
      const data = {
        basicInfo: state.basicInfo,
        parameters: state.parameters,
        incomeData: state.incomeData,
        expenseData: state.expenseData,
        assetData: state.assetData,
        liabilityData: state.liabilityData,
        lifeEvents: state.lifeEvents,
      };
      localStorage.setItem('simulatorState', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  loadFromLocalStorage: () => {
    try {
      const savedState = localStorage.getItem('simulatorState');
      if (savedState) {
        const data = JSON.parse(savedState);
        set({
          basicInfo: data.basicInfo,
          parameters: data.parameters,
          incomeData: data.incomeData,
          expenseData: data.expenseData,
          assetData: data.assetData,
          liabilityData: data.liabilityData,
          lifeEvents: data.lifeEvents || [],
        });
        get().initializeCashFlow();
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  },

  initializeFormData: () => {
    const state = get();
    const { basicInfo, parameters } = state;
    const yearsUntilDeath = basicInfo.deathAge - basicInfo.currentAge;
    const years = Array.from(
      { length: yearsUntilDeath + 1 },
      (_, i) => basicInfo.startYear + i
    );
  
    // 収入データの初期化
    const newIncomeData = { 
      personal: [
        { 
          id: '1', 
          name: '給与収入', 
          type: 'income', 
          category: 'income',
          amounts: {}, 
          investmentRatio: parameters.investmentRatio || 10,
          maxInvestmentAmount: parameters.maxInvestmentAmount || 100
        },
        { 
          id: '2', 
          name: '事業収入', 
          type: 'profit', 
          category: 'income',
          amounts: {}, 
          investmentRatio: parameters.investmentRatio || 10,
          maxInvestmentAmount: parameters.maxInvestmentAmount || 100
        },
        { 
          id: '3', 
          name: '副業収入', 
          type: 'side', 
          category: 'income',
          amounts: {}, 
          investmentRatio: parameters.investmentRatio || 10,
          maxInvestmentAmount: parameters.maxInvestmentAmount || 100
        },
        { 
          id: '4', 
          name: '年金収入', 
          type: 'income', 
          category: 'income',
          amounts: {}, 
          investmentRatio: parameters.investmentRatio || 5, // 年金は少なめの投資割合
          maxInvestmentAmount: parameters.maxInvestmentAmount || 50, // 年金は少なめの最大投資額
          isAutoCalculated: true
        },
      ],
      corporate: [
        { 
          id: '1', 
          name: '売上', 
          type: 'income', 
          category: 'income',
          amounts: {}, 
          investmentRatio: parameters.investmentRatio || 10,
          maxInvestmentAmount: parameters.maxInvestmentAmount || 100
        },
        { 
          id: '2', 
          name: 'その他収入', 
          type: 'income', 
          category: 'income',
          amounts: {}, 
          investmentRatio: parameters.investmentRatio || 10,
          maxInvestmentAmount: parameters.maxInvestmentAmount || 100
        },
      ],
    };
  
    // 既婚または結婚予定の場合、配偶者年金も追加
    if (basicInfo.maritalStatus !== 'single') {
      newIncomeData.personal.push({
        id: '5',
        name: '配偶者年金収入',
        type: 'income',
        category: 'income',
        amounts: {},
        investmentRatio: parameters.investmentRatio || 5,
        maxInvestmentAmount: parameters.maxInvestmentAmount || 50,
        isAutoCalculated: true
      });
    }
  
    // 配偶者の収入がある場合は追加
    if (basicInfo.maritalStatus !== 'single' && basicInfo.spouseInfo?.occupation 
        && basicInfo.spouseInfo.occupation !== 'homemaker') {
      const spouseIncomeItem = newIncomeData.personal.find(item => item.name === '配偶者収入') || {
        id: String(newIncomeData.personal.length + 1),
        name: '配偶者収入',
        type: 'income',
        category: 'income',
        amounts: {},
        investmentRatio: parameters.investmentRatio || 10,
        maxInvestmentAmount: parameters.maxInvestmentAmount || 100
      };
  
      if (!newIncomeData.personal.find(item => item.name === '配偶者収入')) {
        newIncomeData.personal.push(spouseIncomeItem);
      }
    }
  
    // 支出データの初期化
    const newExpenseData = { ...state.expenseData };
    years.forEach(year => {
      // 生活費設定
      const livingExpenseItem = newExpenseData.personal.find(item => item.name === '生活費');
      if (livingExpenseItem) {
        livingExpenseItem.amounts[year] = basicInfo.monthlyLivingExpense * 12;
      }
  
      // 住居費設定
      const housingExpenseItem = newExpenseData.personal.find(item => item.name === '住居費');
      if (housingExpenseItem) {
        housingExpenseItem.amounts[year] = calculateHousingExpense(basicInfo.housingInfo, year);
      }
  
      // 教育費設定
      const educationExpenseItem = newExpenseData.personal.find(item => item.name === '教育費');
      if (educationExpenseItem) {
        educationExpenseItem.amounts[year] = calculateEducationExpense(
          basicInfo.children,
          basicInfo.plannedChildren,
          year,
          basicInfo.currentAge,
          basicInfo.startYear,
          state.parameters.educationCostIncreaseRate
        );
      }
    });
  
    // 資産データの初期化
    const newAssetData = { ...state.assetData };
    if (basicInfo.housingInfo.type === 'own' && basicInfo.housingInfo.own) {
      const realEstateItem = newAssetData.personal.find(item => item.name === '不動産');
      if (realEstateItem) {
        realEstateItem.amounts[basicInfo.housingInfo.own.purchaseYear] = 
          basicInfo.housingInfo.own.purchasePrice;
      }
    }
  
    // 負債データの初期化
    const newLiabilityData = { ...state.liabilityData };
    if (basicInfo.housingInfo.type === 'own' && basicInfo.housingInfo.own) {
      const loanItem = newLiabilityData.personal.find(item => item.name === 'ローン');
      if (loanItem) {
        loanItem.amounts[basicInfo.housingInfo.own.purchaseYear] = 
          basicInfo.housingInfo.own.loanAmount;
      }
    }
  
    set({
      incomeData: newIncomeData,
      expenseData: newExpenseData,
      assetData: newAssetData,
      liabilityData: newLiabilityData,
    });
  },

  syncCashFlowFromFormData: () => {
  try {
    const state = get();
    const { basicInfo, parameters, incomeData, expenseData, assetData, liabilityData } = state;
    const yearsUntilDeath = basicInfo.deathAge - basicInfo.currentAge;
    const years = Array.from(
      { length: yearsUntilDeath + 1 },
      (_, i) => basicInfo.startYear + i
    );

    const newCashFlow: CashFlowData = {};
    
    // 初期資産と負債の計算
    const calculateTotalAssets = (section: 'personal' | 'corporate') => {
      return state.assetData[section].reduce((total, asset) => {
        const currentYearAmount = asset.amounts[basicInfo.startYear] || 0;
        return total + currentYearAmount;
      }, 0);
    };
    
    const calculateTotalLiabilities = (section: 'personal' | 'corporate') => {
      return state.liabilityData[section].reduce((total, liability) => {
        const currentYearAmount = liability.amounts[basicInfo.startYear] || 0;
        return total + currentYearAmount;
      }, 0);
    };
    
    // 運用資産の計算
    const calculateInvestmentAssets = (section: 'personal' | 'corporate', year: number) => {
      return state.assetData[section].reduce((total, asset) => {
        if (asset.isInvestment) {
          return total + (asset.amounts[year] || 0);
        }
        return total;
      }, 0);
    };
    
    const initialPersonalAssets = calculateTotalAssets('personal');
    const initialPersonalLiabilities = calculateTotalLiabilities('personal');
    const initialCorporateAssets = calculateTotalAssets('corporate');
    const initialCorporateLiabilities = calculateTotalLiabilities('corporate');
    const initialInvestmentAssets = calculateInvestmentAssets('personal', basicInfo.startYear);
    
    let prevYearInvestmentAssets = initialInvestmentAssets;
    
    // ヘルパー関数: 項目を名前で検索
    const findItem = (name: string) => incomeData.personal.find(i => i.name === name);
    
    // 自営業かどうかをチェック
    const isSelfEmployed = basicInfo.occupation === 'self_employed' || basicInfo.occupation === 'homemaker';
    
    // 年金関連項目を取得
    const pensionItem = findItem('年金収入');
    const spousePensionItem = findItem('配偶者年金収入');

    years.forEach((year) => {
      const yearsSinceStart = year - basicInfo.startYear;
      const age = basicInfo.currentAge + yearsSinceStart;
      
      // 前年のデータを取得
      const prevYear = year - 1;
      
      // 個人収入の計算 - 重要な修正: 会社員の場合は手取り額を表示するが計算は原本額面で
      // 給与収入項目を取得
      const mainIncomeItem = findItem('給与収入');
      let mainIncome = 0;
      
      if (mainIncomeItem) {
        if (!isSelfEmployed) {
          // 会社員などの場合
          // 手取り額が保存されている場合はそれを使用
          if (mainIncomeItem._netAmounts && mainIncomeItem._netAmounts[year]) {
            mainIncome = mainIncomeItem._netAmounts[year];
          } else {
            // 手取り額がない場合は額面から計算
            const grossAmount = mainIncomeItem.amounts[year] || 0;
            if (grossAmount > 0) {
              const netResult = calculateNetIncome(grossAmount, basicInfo.occupation);
              mainIncome = netResult.netIncome;
            }
          }
        } else {
          // 自営業の場合はそのまま
          mainIncome = mainIncomeItem.amounts[year] || 0;
        }
      }
      
      const sideIncome = findItem('副業収入')?.amounts[year] || 0;
      const spouseIncome = findItem('配偶者収入')?.amounts[year] || 0;
      
      // 年金額の計算 - 年齢に応じて自動計算
      let pensionIncome = 0;
      let spousePensionIncome = 0;
      
      // 年金受給開始年齢以降なら計算
      if (age >= (basicInfo.pensionStartAge || 65)) {
        // 自動計算フラグがある場合のみ計算
        if (pensionItem?.isAutoCalculated) {
          // 年金計算関数を呼び出し - incomeDataをそのまま渡す
          // 年金計算関数内部で原本額面データを優先的に使用
          pensionIncome = calculatePensionForYear(basicInfo, incomeData, year);
          // 計算結果を保存
          pensionItem.amounts[year] = pensionIncome;
        } else if (pensionItem) {
          // 自動計算でない場合は入力値をそのまま使用
          pensionIncome = pensionItem.amounts[year] || 0;
        }
      }
      
      // 配偶者年金の計算
      if (basicInfo.maritalStatus !== 'single') {
        if (spousePensionItem?.isAutoCalculated) {
          // 配偶者年金計算関数を呼び出し
          spousePensionIncome = calculateSpousePensionForYear(basicInfo, incomeData, year);
          // 計算結果を保存
          spousePensionItem.amounts[year] = spousePensionIncome;
        } else if (spousePensionItem) {
          spousePensionIncome = spousePensionItem.amounts[year] || 0;
        }
      }
      
      // 法人収入の計算
      const corporateIncome = incomeData.corporate.find(i => i.name === '売上')?.amounts[year] || 0;
      const corporateOtherIncome = incomeData.corporate.find(i => i.name === 'その他収入')?.amounts[year] || 0;

      // 支出の計算
      const livingExpense = expenseData.personal.find(e => e.name === '生活費')?.amounts[year] || 0;
      const housingExpense = expenseData.personal.find(e => e.name === '住居費')?.amounts[year] || 0;
      const educationExpense = expenseData.personal.find(e => e.name === '教育費')?.amounts[year] || 0;
      const otherExpense = expenseData.personal.find(e => e.name === 'その他')?.amounts[year] || 0;

      const corporateExpense = expenseData.corporate.find(e => e.name === '事業経費')?.amounts[year] || 0;
      const corporateOtherExpense = expenseData.corporate.find(e => e.name === 'その他経費')?.amounts[year] || 0;

      // 投資への振り分け額の計算
      let investmentAmount = 0;
      
      // 収入ごとに投資額を計算（会社員の場合は手取りから投資）
      incomeData.personal.forEach(incomeItem => {
        let amount = 0;
        
        if (incomeItem.name === '給与収入' && !isSelfEmployed) {
          // 会社員の場合は手取りから投資
          if (incomeItem._netAmounts && incomeItem._netAmounts[year]) {
            amount = incomeItem._netAmounts[year];
          } else {
            // 手取り額がなければ計算
            const grossAmount = incomeItem.amounts[year] || 0;
            if (grossAmount > 0) {
              const netResult = calculateNetIncome(grossAmount, basicInfo.occupation);
              amount = netResult.netIncome;
            }
          }
        } else {
          // それ以外の項目や自営業の場合はそのまま
          amount = incomeItem.amounts[year] || 0;
        }
        
        if (amount > 0 && incomeItem.investmentRatio > 0) {
          // 投資割合に基づく投資額
          const itemInvestmentAmount = Math.min(
            amount * (incomeItem.investmentRatio / 100),
            incomeItem.maxInvestmentAmount || Infinity
          );
          investmentAmount += itemInvestmentAmount;
        }
      });

      // 総資産と前年の投資資産の取得
      const prevPersonalAssets = prevYear in newCashFlow ? 
        newCashFlow[prevYear].personalTotalAssets : 
        initialPersonalAssets - initialPersonalLiabilities;
      
      const prevCorporateAssets = prevYear in newCashFlow ? 
        newCashFlow[prevYear].corporateTotalAssets : 
        initialCorporateAssets - initialCorporateLiabilities;

      // 運用収益の計算
      const investmentIncome = Math.round(prevYearInvestmentAssets * (parameters.investmentReturn / 100) * 10) / 10;

      // 収支計算
      const totalIncome = mainIncome + sideIncome + spouseIncome + pensionIncome + spousePensionIncome + investmentIncome;
      const totalExpense = livingExpense + housingExpense + educationExpense + otherExpense;
      const personalBalance = totalIncome - totalExpense;
      
      const corporateBalance = corporateIncome + corporateOtherIncome - 
        (corporateExpense + corporateOtherExpense);

      // 今年の運用資産を計算
      const currentYearInvestmentAssets = prevYearInvestmentAssets + investmentAmount + investmentIncome;
      // 次の反復のために保存
      prevYearInvestmentAssets = currentYearInvestmentAssets;

      // キャッシュフローデータを更新
      newCashFlow[year] = {
        mainIncome,
        sideIncome,
        spouseIncome,
        pensionIncome,
        spousePensionIncome,
        investmentIncome,
        livingExpense,
        housingExpense,
        educationExpense,
        otherExpense,
        personalAssets: prevPersonalAssets,
        investmentAmount,
        totalInvestmentAssets: currentYearInvestmentAssets,
        personalBalance,
        personalTotalAssets: prevPersonalAssets + personalBalance,
        corporateIncome,
        corporateOtherIncome,
        corporateExpense,
        corporateOtherExpense,
        corporateBalance,
        corporateTotalAssets: prevCorporateAssets + corporateBalance,
      };
    });

    set({ cashFlow: newCashFlow });
  } catch (error) {
    console.error("Error in syncCashFlowFromFormData:", error);
  }
},

  initializeCashFlow: () => {
    get().syncCashFlowFromFormData();
  },

  // Form data actions
  setIncomeData: (data) => {
    set({ incomeData: data });
    get().initializeCashFlow();
  },
  
  setExpenseData: (data) => {
    set({ expenseData: data });
    get().initializeCashFlow();
  },
  
  setAssetData: (data) => {
    set({ assetData: data });
    get().initializeCashFlow();
  },
  
  setLiabilityData: (data) => {
    set({ liabilityData: data });
    get().initializeCashFlow();
  },

  // History actions
  addHistoryEntry: (entry) => {
    set((state) => ({
      history: [
        ...state.history,
        {
          ...entry,
          timestamp: Date.now(),
        },
      ],
    }));
  },
  
  clearHistory: () => set({ history: [] }),
}));

function calculateEducationExpense(
  children: BasicInfo['children'],
  plannedChildren: BasicInfo['plannedChildren'],
  year: number,
  currentAge: number,
  startYear: number,
  educationCostIncreaseRate: number
): number {
  // Calculate expenses for existing children
  const existingChildrenExpense = children.reduce((total, child) => {
    const childAge = child.currentAge + (year - startYear);
    let expense = 0;

    const costs = {
      nursery: child.educationPlan.nursery === '私立' ? 50 : 23.3,
      preschool: child.educationPlan.preschool === '私立' ? 100 : 58.3,
      elementary: child.educationPlan.elementary === '私立' ? 83.3 : 41.7,
      juniorHigh: child.educationPlan.juniorHigh === '私立' ? 133.3 : 66.7,
      highSchool: child.educationPlan.highSchool === '私立' ? 250 : 83.3,
    };

    if (childAge >= 0 && childAge <= 2) expense = child.educationPlan.nursery !== '行かない' ? costs.nursery : 0;
    if (childAge >= 3 && childAge <= 5) expense = child.educationPlan.preschool !== '行かない' ? costs.preschool : 0;
    if (childAge >= 6 && childAge <= 11) expense = child.educationPlan.elementary !== '行かない' ? costs.elementary : 0;
    if (childAge >= 12 && childAge <= 14) expense = child.educationPlan.juniorHigh !== '行かない' ? costs.juniorHigh : 0;
    if (childAge >= 15 && childAge <= 17) expense = child.educationPlan.highSchool !== '行かない' ? costs.highSchool : 0;
    if (childAge >= 18 && childAge <= 21) expense = child.educationPlan.university !== '行かない' ? getUniversityCost(child.educationPlan.university) : 0;

    const yearsSinceStart = year - startYear;
    const increaseMultiplier = Math.pow(1 + educationCostIncreaseRate / 100, yearsSinceStart);
    return total + (expense * increaseMultiplier);
  }, 0);

  // Calculate expenses for planned children
  const plannedChildrenExpense = plannedChildren.reduce((total, child) => {
    const yearsSinceStart = year - startYear;
    if (yearsSinceStart >= child.yearsFromNow) {
      const childAge = yearsSinceStart - child.yearsFromNow;
      let expense = 0;

      const costs = {
        nursery: child.educationPlan.nursery === '私立' ? 50 : 23.3,
        preschool: child.educationPlan.preschool === '私立' ? 100 : 58.3,
        elementary: child.educationPlan.elementary === '私立' ? 83.3 : 41.7,
        juniorHigh: child.educationPlan.juniorHigh === '私立' ? 133.3 : 66.7,
        highSchool: child.educationPlan.highSchool === '私立' ? 250 : 83.3,
      };

      if (childAge >= 0 && childAge <= 2) expense = child.educationPlan.nursery !== '行かない' ? costs.nursery : 0;
      if (childAge >= 3 && childAge <= 5) expense = child.educationPlan.preschool !== '行かない' ? costs.preschool : 0;
      if (childAge >= 6 && childAge <= 11) expense = child.educationPlan.elementary !== '行かない' ? costs.elementary : 0;
      if (childAge >= 12 && childAge <= 14) expense = child.educationPlan.juniorHigh !== '行かない' ? costs.juniorHigh : 0;
      if (childAge >= 15 && childAge <= 17) expense = child.educationPlan.highSchool !== '行かない' ? costs.highSchool : 0;
      if (childAge >= 18 && childAge <= 21) expense = child.educationPlan.university !== '行かない' ? getUniversityCost(child.educationPlan.university) : 0;

      const increaseMultiplier = Math.pow(1 + educationCostIncreaseRate / 100, yearsSinceStart);
      return total + (expense * increaseMultiplier);
    }
    return total;
  }, 0);

  return Number((existingChildrenExpense + plannedChildrenExpense).toFixed(1));
}

function getUniversityCost(universityType: string): number {
  switch (universityType) {
    case '公立大学（文系）':
      return 325;
    case '公立大学（理系）':
      return 375;
    case '私立大学（文系）':
      return 550;
    case '私立大学（理系）':
      return 650;
    default:
      return 0;
  }
}