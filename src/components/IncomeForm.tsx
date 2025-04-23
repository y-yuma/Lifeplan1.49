import React from 'react';
import { useSimulatorStore } from '@/store/simulator';
import { Plus, Trash2 } from 'lucide-react';
import { CategorySelect, INCOME_CATEGORIES } from '@/components/ui/category-select';

export function IncomeForm() {
  const { 
    basicInfo, 
    parameters,
    setCurrentStep,
    incomeData,
    setIncomeData
  } = useSimulatorStore();

  const years = Array.from(
    { length: basicInfo.deathAge - basicInfo.currentAge + 1 },
    (_, i) => basicInfo.startYear + i
  );

  const handleAmountChange = (
    section: 'personal' | 'corporate',
    itemId: string,
    year: number,
    value: number
  ) => {
    setIncomeData({
      ...incomeData,
      [section]: incomeData[section].map(item =>
        item.id === itemId
          ? {
              ...item,
              amounts: {
                ...item.amounts,
                [year]: value,
              },
            }
          : item
      ),
    });
  };

  // 投資割合の変更を処理する関数
  const handleInvestmentRatioChange = (
    section: 'personal' | 'corporate', 
    itemId: string, 
    value: number
  ) => {
    setIncomeData({
      ...incomeData,
      [section]: incomeData[section].map(item =>
        item.id === itemId
          ? {
              ...item,
              investmentRatio: value,
            }
          : item
      ),
    });
  };

  // 最大投資額の変更を処理する関数
  const handleMaxInvestmentAmountChange = (
    section: 'personal' | 'corporate', 
    itemId: string, 
    value: number
  ) => {
    setIncomeData({
      ...incomeData,
      [section]: incomeData[section].map(item =>
        item.id === itemId
          ? {
              ...item,
              maxInvestmentAmount: value,
            }
          : item
      ),
    });
  };

  const addIncomeItem = (section: 'personal' | 'corporate') => {
    const newId = String(Math.max(...incomeData[section].map(i => Number(i.id)), 0) + 1);
    setIncomeData({
      ...incomeData,
      [section]: [
        ...incomeData[section],
        {
          id: newId,
          name: 'その他',
          type: 'income',
          category: 'income', // デフォルトカテゴリ
          amounts: {},
          investmentRatio: parameters.investmentRatio || 10, // デフォルト投資割合
          maxInvestmentAmount: parameters.maxInvestmentAmount || 100, // デフォルト最大投資額
        },
      ],
    });
  };

  const removeIncomeItem = (section: 'personal' | 'corporate', id: string) => {
    setIncomeData({
      ...incomeData,
      [section]: incomeData[section].filter(item => item.id !== id),
    });
  };

  const handleNameChange = (
    section: 'personal' | 'corporate',
    itemId: string,
    value: string
  ) => {
    setIncomeData({
      ...incomeData,
      [section]: incomeData[section].map(item =>
        item.id === itemId
          ? {
              ...item,
              name: value,
            }
          : item
      ),
    });
  };

  // カテゴリーを変更するハンドラを追加
  const handleCategoryChange = (
    section: 'personal' | 'corporate',
    itemId: string,
    value: string
  ) => {
    setIncomeData({
      ...incomeData,
      [section]: incomeData[section].map(item =>
        item.id === itemId
          ? {
              ...item,
              category: value,
            }
          : item
      ),
    });
  };

  const renderIncomeTable = (section: 'personal' | 'corporate') => {
    const items = incomeData[section];
    const title = section === 'personal' ? '個人' : '法人';

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={() => addIncomeItem(section)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" />
            項目を追加
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 sticky left-0 bg-gray-50 min-w-[110px]">
                  項目
                </th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 w-[100px] min-w-[100px]">
                  カテゴリ
                </th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 w-[70px] min-w-[70px]">
                  投資割合(%)
                </th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 w-[90px] min-w-[90px]">
                  最大投資額
                </th>
                {years.map(year => (
                  <th key={year} className="px-4 py-2 text-right text-sm font-medium text-gray-500 min-w-[95px]">
                    {year}年
                  </th>
                ))}
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 w-20">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {items.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-2 sticky left-0 bg-white">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleNameChange(section, item.id, e.target.value)}
                      className="w-full rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <CategorySelect
                      value={item.category || 'income'}
                      onChange={(value) => handleCategoryChange(section, item.id, value)}
                      categories={INCOME_CATEGORIES}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.investmentRatio || 0}
                      onChange={(e) => handleInvestmentRatioChange(section, item.id, Number(e.target.value))}
                      className="w-full text-right rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="0"
                      value={item.maxInvestmentAmount || 0}
                      onChange={(e) => handleMaxInvestmentAmountChange(section, item.id, Number(e.target.value))}
                      className="w-full text-right rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  {years.map(year => (
                    <td key={year} className="px-4 py-2">
                      <input
                        type="number"
                        value={item.amounts[year] || ''}
                        onChange={(e) => handleAmountChange(section, item.id, year, Number(e.target.value))}
                        className="w-full text-right rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeIncomeItem(section, item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const handleNext = () => {
    setCurrentStep(3);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">収入情報</h2>
        <div className="text-sm text-gray-500">
          ※金額は万円単位で入力してください
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-md mb-4">
        <h3 className="text-md font-medium text-blue-800 mb-2">投資設定について</h3>
        <p className="text-sm text-blue-700">
          各収入項目ごとに投資設定を行うことができます。投資割合(%)は収入のうち何%を投資に回すかを、
          最大投資額は年間いくらまで投資するかの上限を設定します。
          これらの設定は自動的に運用資産に反映され、設定した運用利回りで収益が発生します。
        </p>
      </div>

      <div className="space-y-8">
        {renderIncomeTable('personal')}
        {renderIncomeTable('corporate')}
      </div>

      <div className="flex justify-between space-x-4">
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          次へ
        </button>
      </div>
    </div>
  );
}