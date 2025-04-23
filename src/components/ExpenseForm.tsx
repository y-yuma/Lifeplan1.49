import React from 'react';
import { useSimulatorStore } from '@/store/simulator';
import { Plus, Trash2 } from 'lucide-react';
import { CategorySelect, EXPENSE_CATEGORIES } from '@/components/ui/category-select';

export function ExpenseForm() {
  const { 
    basicInfo, 
    setCurrentStep,
    expenseData,
    setExpenseData
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
    setExpenseData({
      ...expenseData,
      [section]: expenseData[section].map(item =>
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

  const addExpenseItem = (section: 'personal' | 'corporate') => {
    const newId = String(Math.max(...expenseData[section].map(i => Number(i.id)), 0) + 1);
    setExpenseData({
      ...expenseData,
      [section]: [
        ...expenseData[section],
        {
          id: newId,
          name: 'その他',
          type: 'other',
          category: 'other', // デフォルトカテゴリ
          amounts: {},
        },
      ],
    });
  };

  const removeExpenseItem = (section: 'personal' | 'corporate', id: string) => {
    setExpenseData({
      ...expenseData,
      [section]: expenseData[section].filter(item => item.id !== id),
    });
  };

  const handleNameChange = (
    section: 'personal' | 'corporate',
    itemId: string,
    value: string
  ) => {
    setExpenseData({
      ...expenseData,
      [section]: expenseData[section].map(item =>
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
    setExpenseData({
      ...expenseData,
      [section]: expenseData[section].map(item =>
        item.id === itemId
          ? {
              ...item,
              category: value,
              // 種類も同時に更新（オプション）
              type: value === 'living' ? 'living' : 
                   value === 'housing' ? 'housing' : 'other',
            }
          : item
      ),
    });
  };

  const renderExpenseTable = (section: 'personal' | 'corporate') => {
    const items = expenseData[section];
    const title = section === 'personal' ? '個人' : '法人';

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={() => addExpenseItem(section)}
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
                      value={item.category || 'other'}
                      onChange={(value) => handleCategoryChange(section, item.id, value)}
                      categories={EXPENSE_CATEGORIES}
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
                      onClick={() => removeExpenseItem(section, item.id)}
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
    setCurrentStep(4);
  };

  const handleBack = () => {
    setCurrentStep(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">経費情報</h2>
        <div className="text-sm text-gray-500">
          ※金額は万円単位で入力してください
        </div>
      </div>

      <div className="space-y-8">
        {renderExpenseTable('personal')}
        {renderExpenseTable('corporate')}
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