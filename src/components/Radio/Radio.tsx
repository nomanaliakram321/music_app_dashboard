import { RADIO_STATIONS } from '#/constants';

const Radio = () => {
  return (
    <div className='mt-6 grid grid-cols-3 gap-9'>
      {RADIO_STATIONS.map((station) => (
        <div key={station.seed} className='cursor-pointer mt-2'>
          <div
            className={`group relative flex  h-40 justify-center  overflow-hidden shadow-xl rounded-sm ${station.bg} pt-6`}
          >
            {/* Album art circles */}
            <div className='flex -space-x-4'>
              {[1, 2, 3].map((n, index) => (
                <img
                  key={n}
                  src={RADIO_STATIONS[n].image}
                  alt=''
                  className={`size-16 rounded-full border-3 border-white object-cover
        ${index === 1 ? 'z-20' : 'z-10'}
      `}
                />
              ))}
            </div>

            {/* Radio label */}
            <span className='absolute bottom-4 left-1/2 -translate-x-1/2 text-2xl font-medium text-white'>Radio</span>
          </div>
          <p className='mt-5 text-sm font-medium text-theme-dark-900'>{station.name}</p>
        </div>
      ))}
    </div>
  );
};
export default Radio;
