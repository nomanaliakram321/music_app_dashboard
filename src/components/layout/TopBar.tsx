import { Bell, ChevronLeft, ChevronRight, Search, Settings } from 'lucide-react';

const TopBar = () => (
  <header className="flex h-14 items-center gap-4 border-b bg-white px-6">
    <div className="flex items-center gap-2">
      <button className="text-theme-dark-700 hover:text-theme-dark-900">
        <ChevronLeft size={20} />
      </button>
      <button className="text-theme-dark-700 hover:text-theme-dark-900">
        <ChevronRight size={20} />
      </button>
    </div>

    <div className="relative mx-4 max-w-md flex-1">
      <Search size={16} className="absolute top-1/2 left-4 -translate-y-1/2 text-theme-light-500" />
      <input
        type="text"
        placeholder="Search for track, artist or album..."
        className="w-full rounded-full border border-theme-light-300 bg-white py-2 pr-4 pl-10 text-sm text-theme-dark-700 placeholder:text-theme-light-500 focus:border-theme-primary focus:outline-none"
      />
    </div>

    <div className="ml-auto flex items-center gap-4">
      <button className="relative text-theme-dark-700 hover:text-theme-dark-900">
        <Bell size={20} />
        <span className="absolute -top-1 -right-1 size-2 rounded-full bg-theme-coral" />
      </button>
      <button className="text-theme-dark-700 hover:text-theme-dark-900">
        <Settings size={20} />
      </button>
    </div>
  </header>
);

export default TopBar;
