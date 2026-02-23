import { Heart, Play } from 'lucide-react';

import { ALBUMS } from '#/constants';

const Albums = () => {
  return (
    <div className='mt-6 grid grid-cols-3 gap-5'>
      {ALBUMS.map(album => (
        <div key={album.title} className='group cursor-pointer overflow-hidden rounded-2xl bg-theme-dark-900'>
          <div className='relative'>
            <img
              src={album.image}
              alt={album.title}
              className='aspect-square w-full object-cover opacity-80 transition-transform group-hover:scale-105'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-theme-dark-900 to-transparent' />

            <button className='absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-theme-primary/50 text-white opacity-0 backdrop-blur-xs transition-all group-hover:opacity-100'>
              <Play size={20} fill='white' />
            </button>

            <button className='absolute top-3 right-3 text-white/70 hover:text-white'>
              <Heart size={18} />
            </button>
          </div>

          <div className='p-4'>
            <p className='text-sm font-semibold text-white'>{album.title}</p>
            <p className='mt-1 text-xs text-white/70'>{album.artist}</p>
            <div className='mt-2 flex items-center gap-2 text-xs text-white/50'>
              <span>{album.year}</span>
              <span>&middot;</span>
              <span>{album.songs} songs</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Albums;
