import { JSX, useState } from 'react';
import Browse from '#/components/browse/Browse';
import { BROWSE_TABS } from '#/constants';



const BrowsePage = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<(typeof BROWSE_TABS)[number]>(BROWSE_TABS[0]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-theme-dark-900">Browse</h1>

      {/* Tabs */}
      <div className="mt-4 flex gap-8 border-b border-theme-light-300">
        {BROWSE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-theme-primary text-theme-dark-900'
                : 'text-theme-light-500 hover:text-theme-dark-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
        <Browse/>
    
    </div>
  );
};

export default BrowsePage;
