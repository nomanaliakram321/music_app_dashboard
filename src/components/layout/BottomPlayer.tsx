import { Pause, Rewind, FastForward, Repeat, Shuffle } from 'lucide-react';

const BottomPlayer = () => (
  <footer className='flex h-24 items-center border-t bg-white px-6'>
    <div className='flex w-60 items-center gap-4'>
      <div className='size-14 shrink-0 overflow-hidden rounded-lg bg-theme-dark-900'>
        <img
          src='https://api.dicebear.com/9.x/shapes/svg?seed=MoonGazing'
          alt='Album art'
          className='size-full object-cover'
        />
      </div>
      <div>
        <p className='text-sm font-semibold text-theme-dark-900'>Moon Gazing</p>
        <p className='text-xs text-theme-light-500'>Helen Stone</p>
      </div>
    </div>

    <div className='flex flex-1 items-center justify-center gap-5'>
      <button className='text-theme-dark-700 transition-colors hover:text-theme-dark-900'>
        <Repeat size={18} />
      </button>
      <button className='text-theme-dark-700 transition-colors hover:text-theme-dark-900'>
        <Rewind size={18} />
      </button>
      <button className='flex size-12 items-center justify-center rounded-full bg-theme-primary text-white shadow-lg transition-colors hover:bg-theme-primary/90'>
        <Pause size={22} />
      </button>
      <button className='text-theme-dark-700 transition-colors hover:text-theme-dark-900'>
        <FastForward size={18} />
      </button>
      <button className='text-theme-dark-700 transition-colors hover:text-theme-dark-900'>
        <Shuffle size={18} />
      </button>
    </div>

    <div className='flex w-72 items-center gap-3'>
      <span className='text-xs text-theme-light-500'>1:50</span>
      <div className='relative flex-1'>
        <div className='h-1 rounded-full bg-theme-light-300' />
        <div className='absolute top-0 left-0 h-1 w-3/5 rounded-full bg-theme-primary' />
        <div className='absolute top-1/2 left-[60%] size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-theme-primary shadow' />
      </div>
      <span className='text-xs text-theme-light-500'>2:50</span>
    </div>

    <div className='ml-8 w-40 text-right'>
      <p className='text-sm font-semibold text-theme-dark-900'>Up Next</p>
      <p className='text-xs text-theme-light-500'>Winnie Gordon</p>
    </div>
  </footer>
);

export default BottomPlayer;
