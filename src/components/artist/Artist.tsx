import { ARTISTS } from '#/constants';

const Artist = () => {
  return (
    <div className='mt-6 grid grid-cols-3 gap-5'>
      {ARTISTS.map(artist => (
        <div
          key={artist.name}
          className='group flex cursor-pointer flex-col items-center rounded-2xl bg-theme-dark-900 p-6 transition-colors hover:bg-theme-dark-700'
        >
          <img
            src={artist.image}
            alt={artist.name}
            className='size-28 rounded-full object-cover ring-4 ring-theme-primary/30 transition-transform group-hover:scale-105'
          />
          <p className='mt-4 text-sm font-semibold text-white'>{artist.name}</p>
          <p className='mt-1 text-xs text-white/50'>{artist.followers} followers</p>
        </div>
      ))}
    </div>
  );
};

export default Artist;
