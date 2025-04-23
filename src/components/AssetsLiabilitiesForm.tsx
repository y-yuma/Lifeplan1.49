import React from 'react';
import { useSimulatorStore } from '@/store/simulator';
import { Plus, Trash2 } from 'lucide-react';
import { 
  CategorySelect, 
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES
} from '@/components/ui/category-select';

export function AssetsLiabilitiesForm() {
  const { 
    basicInfo, 
    setCurrentStep,
    assetData,
    setAssetData,
    liabilityData,
    setLiabilityData,
    syncCashFlowFromFormData
  } = useSimulatorStore();

  const years = Array.from(
    { length: basicInfo.deathAge - basicInfo.currentAge + 1 },
    (_, i) => basicInfo.startYear + i
  );

  const handleAssetAmountChange = (
    section: 'personal' | 'corporate',
    itemId: string,
    year: number,
    value: number
  ) => {
    setAssetData({
      ...assetData,
      [section]: assetData[section].map(item =>
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
    syncCashFlowFromFormData();
  };

  const handleLiabilityAmountChange = (
    section: 'personal' | 'corporate',
    itemId: string,
    year: number,
    value: number
  ) => {
    setLiabilityData({
      ...liabilityData,
      [section]: liabilityData[section].map(item =>
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
    syncCashFlowFromFormData();
  };

  const addAssetItem = (section: 'personal' | 'corporate') => {
    const newId = String(Math.max(...assetData[section].map(i => Number(i.id) || 0), 0) + 1);
    setAssetData({
      ...assetData,
      [section]: [
        ...assetData[section],
        {
          id: newId,
          name: 'その他',
          type: 'other',
          category: 'asset', // デフォルトカテゴリ
          amounts: {},
          isInvestment: false, // 運用資産かどうかのフラグを追加
        },
      ],
    });
    syncCashFlowFromFormData();
  };

  const addLiabilityItem = (section: 'personal' | 'corporate') => {
    const newId = String(Math.max(...liabilityData[section].map(i => Number(i.id) || 0), 0) + 1);
    setLiabilityData({
      ...liabilityData,
      [section]: [
        ...liabilityData[section],
        {
          id: newId,
          name: 'その他',
          type: 'other',
          category: 'liability', // デフォルトカテゴリ
          amounts: {},
          interestRate: 0, // 金利を追加
          termYears: 0,    // 返済期間を追加
        },
      ],
    });
    syncCashFlowFromFormData();
  };

  const removeAssetItem = (section: 'personal' | 'corporate', id: string) => {
    setAssetData({
      ...assetData,
      [section]: assetData[section].filter(item => item.id !== id),
    });
    syncCashFlowFromFormData();
  };

  const removeLiabilityItem = (section: 'personal' | 'corporate', id: string) => {
    setLiabilityData({
      ...liabilityData,
      [section]: liabilityData[section].filter(item => item.id !== id),
    });
    syncCashFlowFromFormData();
  };

  const handleAssetNameChange = (
    section: 'personal' | 'corporate',
    itemId: string,
    value: string
  ) => {
    setAssetData({
      ...assetData,
      [section]: assetData[section].map(item =>
        item.id === itemId
          ? {
              ...item,
              name: value,
            }
          : item
      ),
    });
    syncCashFlowFromFormData();
  };

  const handleLiabilityNameChange = (
    section: 'personal' | 'corporate',
    itemId: string,
    value: string
  ) => {
    setLiabilityData({
      ...liabilityData,
      [section]: liabilityData[section].map(item =>
        item.id === itemId
          ? {
              ...item,
              name: value,
            }
          : item
      ),
    });
    syncCashFlowFromFormData();
  };

  // 資産の種類を変更
  const handleAssetTypeChange = (
    section: 'personal' | 'corporate',
    itemId: string,
    value: 'cash' | 'investment' | 'property' | 'other'
  ) => {
    setAssetData({
      ...assetData,
      [section]: assetData[section].map(item =>
        item.id === itemId
          ? {
              ...item,
              type: value,
            }
          : item
      ),
    });
    syncCashFlowFromFormData();
  };

  // 資産のカテゴリを変更
  const handleAssetCategoryChange = (
    section: 'personal' | 'corporate',
    itemId: string,
    value: string
  ) => {
    setAssetData({
      ...assetData,
      [section]: assetData[section].map(item =>
        item.id === itemId
          ? {
              ...item,
              category: value,
            }
          : item
      ),
    });
    syncCashFlowFromFormData();
  };

  // 負債の種類を変更
  const handleLiabilityTypeChange = (
    section: 'personal' | 'corporate',
    itemId: string,
    value: 'loan' | 'credit' | 'other'
  ) => {
    setLiabilityData({
      ...liabilityData,
      [section]: liabilityData[section].map(item =>
        item.id === itemId
          ? {
              ...item,
              type: value,
            }
          : item
      ),
    });
    syncCashFlowFromFormData();
  };

  // 負債のカテゴリを変更
  const handleLiabilityCategoryChange = (
    section: 'personal' | 'corporate',
    itemId: string,
    value: string
  ) => {
    setLiabilityData({
      ...liabilityData,
      [section]: liabilityData[section].map(item =>
        item.id === itemId
          ? {
              ...item,
              category: value,
            }
          : item
      ),
    });
    syncCashFlowFromFormData();
  };

  // 資産の投資フラグを切り替える
  const toggleAssetInvestment = (
    section: 'personal' | 'corporate',
    itemId: string
  ) => {
    setAssetData({
      ...assetData,
      [section]: assetData[section].map(item =>
        item.id === itemId
          ? {
              ...item,
              isInvestment: !item.isInvestment,
            }
          : item
      ),
    });
    syncCashFlowFromFormData();
  };

  // 負債の金利を更新
  const handleLiabilityInterestRateChange = (
    section: 'personal' | 'corporate',
    itemId: string,
    value: number
  ) => {
    setLiabilityData({
      ...liabilityData,
      [section]: liabilityData[section].map(item =>
        item.id === itemId
          ? {
              ...item,
              interestRate: value,
            }
          : item
      ),
    });
    syncCashFlowFromFormData();
  };

  // 負債の返済期間を更新
  const handleLiabilityTermYearsChange = (
    section: 'personal' | 'corporate',
    itemId: string,
    value: number
  ) => {
    setLiabilityData({
      ...liabilityData,
      [section]: liabilityData[section].map(item =>
        item.id === itemId
          ? {
              ...item,
              termYears: value,
            }
          : item
      ),
    });
    syncCashFlowFromFormData();
  };

  const renderAssetTable = (section: 'personal' | 'corporate') => {
    const items = assetData[section];
    const title = section === 'personal' ? '個人' : '法人';

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={() => addAssetItem(section)}
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
                  種類
                </th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 w-[100px] min-w-[100px]">
                  カテゴリ
                </th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 w-[100px]">
                  運用資産
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
                      onChange={(e) => handleAssetNameChange(section, item.id, e.target.value)}
                      className="w-full rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <select
                      value={item.type}
                      onChange={(e) => handleAssetTypeChange(section, item.id, e.target.value as 'cash' | 'investment' | 'property' | 'other')}
                      className="w-full rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="cash">現金・預金</option>
                      <option value="investment">投資</option>
                      <option value="property">不動産</option>
                      <option value="other">その他</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <CategorySelect
                      value={item.category || 'asset'}
                      onChange={(value) => handleAssetCategoryChange(section, item.id, value)}
                      categories={ASSET_CATEGORIES}
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={item.isInvestment}
                      onChange={() => toggleAssetInvestment(section, item.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  {years.map(year => (
                    <td key={year} className="px-4 py-2">
                      <input
                        type="number"
                        value={item.amounts[year] || ''}
                        onChange={(e) => handleAssetAmountChange(section, item.id, year, Number(e.target.value))}
                        className="w-full text-right rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeAssetItem(section, item.id)}
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

  const renderLiabilityTable = (section: 'personal' | 'corporate') => {
    const items = liabilityData[section];
    const title = section === 'personal' ? '個人' : '法人';

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={() => addLiabilityItem(section)}
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
                  種類
                </th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 w-[100px] min-w-[100px]">
                  カテゴリ
                </th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 w-[80px]">
                  金利(%)
                </th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 w-[100px]">
                  返済期間(年)
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
                      onChange={(e) => handleLiabilityNameChange(section, item.id, e.target.value)}
                      className="w-full rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <select
                      value={item.type}
                      onChange={(e) => handleLiabilityTypeChange(section, item.id, e.target.value as 'loan' | 'credit' | 'other')}
                      className="w-full rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="loan">ローン</option>
                      <option value="credit">クレジット</option>
                      <option value="other">その他</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <CategorySelect
                      value={item.category || 'liability'}
                      onChange={(value) => handleLiabilityCategoryChange(section, item.id, value)}
                      categories={LIABILITY_CATEGORIES}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={item.interestRate || 0}
                      onChange={(e) => handleLiabilityInterestRateChange(section, item.id, Number(e.target.value))}
                      className="w-full text-right rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={item.termYears || 0}
                      onChange={(e) => handleLiabilityTermYearsChange(section, item.id, Number(e.target.value))}
                      className="w-full text-right rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  {years.map(year => (
                    <td key={year} className="px-4 py-2">
                      <input
                        type="number"
                        value={item.amounts[year] || ''}
                        onChange={(e) => handleLiabilityAmountChange(section, item.id, year, Number(e.target.value))}
                        className="w-full text-right rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeLiabilityItem(section, item.id)}
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
    syncCashFlowFromFormData();
    setCurrentStep(5);
  };

  const handleBack = () => {
    syncCashFlowFromFormData();
    setCurrentStep(3);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">資産・負債情報</h2>
        <div className="text-sm text-gray-500">
          ※金額は万円単位で入力してください
        </div>
      </div>

      {/* 資産セクション */}
      <div className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">資産</h3>
          <div className="text-sm text-gray-500">
            ※運用資産にチェックを入れた項目には、設定した運用利回りが適用されます
          </div>
        </div>
        {renderAssetTable('personal')}
        {renderAssetTable('corporate')}
      </div>

      {/* 負債セクション */}
      <div className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">負債</h3>
          <div className="text-sm text-gray-500">
            ※金利と返済期間を設定すると、元利均等返済方式でローン返済額が計算されます
          </div>
        </div>
        {renderLiabilityTable('personal')}
        {renderLiabilityTable('corporate')}
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