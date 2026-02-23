import { Heart, Music, Users } from 'lucide-react';

import Avatar from '#/assets/images/Avatar.png';
import Folder from '#/assets/svgs/folder.svg';
const stats = [
  { label: 'Friends', count: 50, icon: Users, color: 'bg-indigo-100 text-indigo-500' },
  { label: 'Likes', count: 120, icon: Heart, color: 'bg-pink-100 text-pink-500' },
  { label: 'Playlist', count: 3, icon: Music, color: 'bg-green-100 text-green-500' },
];

const RightPanel = () => (
  <aside className='flex w-72 flex-col items-center border-l bg-white p-6 overflow-y-auto'>
    <span className='self-start rounded-full bg-theme-coral px-4 py-1 text-xs font-semibold text-white'>FREE</span>

    <div className='mt-4 size-28  rounded-full  '>
      <img src={Avatar} alt='Profile' className='size-full object-cover' />
    </div>

    <h3 className='mt-4 text-lg font-semibold text-theme-dark-900'>Michelle Dunkin</h3>
    <p className='text-sm text-theme-light-500'>Los Angeles</p>

    <div className='mt-6 w-full  pt-6'>
      {stats.map(({ label, count, icon: Icon, color }) => (
        <div key={label} className='flex items-center gap-4 py-3'>
          <div className={`flex size-10 items-center justify-center rounded-full ${color}`}>
            <Icon size={18} />
          </div>
          <span className='flex-1 text-sm font-normal text-theme-dark-700'>{label}</span>
          <span className='text-sm font-normal text-theme-dark-900'>{count}</span>
        </div>
      ))}
    </div>

    <div className='mt-10 w-full rounded-2xl bg-theme-light-100 p-6 pt-13 relative text-center'>
      <img
        src={Folder}
        alt='Folder'
        className='mx-auto absolute left-1/2 -translate-x-1/2 -top-8 size-16 object-contain'
      />
      <p className='text-sm text-theme-dark-700'>
        Upgrade to <span className='font-bold'>PRO</span> for more benefits
      </p>
      <button className='mt-4 w-full rounded-full bg-theme-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-theme-primary/90'>
        Upgrade
      </button>
    </div>
  </aside>
);

export default RightPanel;
