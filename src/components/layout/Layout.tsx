import { Outlet } from 'react-router-dom';

import BottomPlayer from './BottomPlayer';
import RightPanel from './RightPanel';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = () => {
  return (
    <div className='flex h-screen overflow-hidden'>
      <Sidebar />

      <div className='flex flex-1 flex-col overflow-hidden'>
        <TopBar />

        <div className='flex flex-1 overflow-hidden'>
          <main className='flex-1 overflow-y-auto p-6'>
            <Outlet />
          </main>
          <RightPanel />
        </div>

        <BottomPlayer />
      </div>
    </div>
  );
};

export default Layout;
