import { CirclePlus } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import logoUrl from '#/assets/svgs/logo.svg';
import { MUSIC_ITEMS, NAV_ITEMS, PLAYLIST_ITEMS } from '#/constants';

const Sidebar = () => (
  <aside className='flex w-60 flex-col bg-gradient-to-b from-theme-primary to-[#2E2E6E] text-white'>
    <div className='p-4 pt-6'>
      <img src={logoUrl} className='h-12 w-48 object-contain' alt='Logo' />
    </div>

    <nav className='mt-2 flex-1 overflow-y-auto'>
      <ul>
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
          <li key={label}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-3 text-sm transition-colors ${
                  isActive ? 'bg-white/15 font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className='mt-6 px-6'>
        <h3 className='mb-4 text-sm font-semibold'>My Music</h3>
        <ul>
          {MUSIC_ITEMS.map(({ label, icon: Icon, to }) => (
            <li key={label}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-4 py-3 text-sm transition-colors ${
                    isActive ? 'font-medium text-white' : 'text-white/70 hover:text-white'
                  }`
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className='mt-6 px-6'>
        <h3 className='mb-4 text-sm font-semibold'>Playlist</h3>
        <ul>
          {PLAYLIST_ITEMS.map(({ label, icon: Icon, to }) => (
            <li key={label}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-4 py-3 text-sm transition-colors ${
                    isActive ? 'font-medium text-white' : 'text-white/70 hover:text-white'
                  }`
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>

    <div className='bg-gradient-to-t shadow-2xl from-[#131336] to-transparent p-4'>
      <button className='flex w-full items-center gap-4 px-2 py-6 text-sm text-white transition-colors hover:text-white'>
        <CirclePlus size={20} />
        <span className='font-medium'>Add New Playlist</span>
      </button>
    </div>
  </aside>
);

export default Sidebar;
