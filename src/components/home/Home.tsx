import { Heart, Play } from 'lucide-react';
import album1 from '../../assets/images/albumb_1.png';
import album2 from '../../assets/images/albumb_2.png';
import album3 from '../../assets/images/albumb_3.png';
import album4 from '../../assets/images/albumb_6.png';
import album5 from '../../assets/images/albumb_5.png';

const newAlbums = [
  { title: 'Breathe', artist: 'Sad Boy', seed: 'Breathe', color: 'from-red-900/80 to-purple-900', image:album1},
  { title: 'Indigo', artist: 'Town Hall', seed: 'Indigo', color: 'from-teal-900/80 to-emerald-900',image:album2 },
  { title: 'Above The Sky', artist: 'Exit View', seed: 'AboveTheSky', color: 'from-amber-200/80 to-yellow-300',image:album3 },
];

const liveConcerts = [
  { viewers: 245, seed: 'LiveConcert1',image:album4 },
  { viewers: 245, seed: 'LiveConcert2',image:album5 },
];

const Home = () => {
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-theme-dark-900">New Albums</h2>
          <button className="text-sm font-normal text-theme-primary hover:underline">More</button>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {newAlbums.map((album) => (
            <div
              key={album.title}
              className="group relative  overflow-hidden rounded-2xl bg-theme-dark-900"
            >
              <img
                src={album.image}
                alt={album.title}
                className="size-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t  to-transparent" />

              {/* Play button */}
              <button className="absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-theme-primary/50 text-white backdrop-blur-xs transition-transform group-hover:scale-110">
                <Play size={20} fill="white" />
              </button>

              {/* Heart icon */}
              <button className="absolute top-3 right-3 text-white/70 hover:text-white">
                <Heart size={18} />
              </button>

              {/* Info */}

              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 h-20 text-center pt-8 w-full  bg-gradient-to-t from-black via-black/40  to-transparent ">
                <p className="text-sm font-semibold text-white">{album.title}</p>
                <p className="text-xs text-white/70">{album.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Most Popular */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-theme-dark-900">Most Popular</h2>
          <button className="text-sm font-normal text-theme-primary hover:underline">More</button>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-theme-dark-900">
          <img
            src={album2}
            alt="Most Popular"
            className="h-48 w-full object-cover opacity-60"
          />
          <div className="absolute bottom-0 inset-0 h-full  bg-gradient-to-t from-black/25 via-black/10  to-transparent" />
          <div className="absolute bottom-4 left-6">
            <p className="text-lg font-bold text-white">Moon Gazing</p>
            <p className="text-sm  pt-2 text-white/70">Helen Stone (feat. Nevada Band)</p>
          </div>
          <div className="absolute right-6 bottom-4  text-right ">
            <p className="text-sm font-semibold text-white">UP NEXT</p>
            <p className="text-xs pt-2 text-white/70">Radio Astronomy</p>
          </div>
        </div>
      </section>

      {/* Live Concert */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-theme-dark-900">Live Concert</h2>
        </div>
        <div className="grid grid-cols-2 gap-14 pl-6">
          {liveConcerts.map((concert) => (
            <div
              key={concert.seed}
              className="group relative h-65 rounded-2xl bg-theme-dark-900"
            >
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <img
                  src={concert.image}
                  alt="Live Concert"
                  className="size-full object-cover opacity-70"
                />
              </div>

              {/* LIVE badge */}
              <span className="absolute top-4 right-4 rounded-full bg-theme-coral px-4 py-1.5 text-xs font-semibold text-white">
                LIVE
              </span>

              {/* Viewers — overflows left edge of card */}
              <div className="absolute -left-6 bottom-5 w-90 flex flex-col gap-2 rounded-lg bg-theme-primary/90 px-8 py-3 ">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((idx) => (
                    <img
                      key={idx}
                      src={new URL(`../../assets/images/person_${idx}.png`, import.meta.url).href}
                      alt=""
                      className="size-9 rounded-full border-2 border-white/30 object-cover"
                    />
                  ))}
                </div>
                <p className="text-xs text-white/90">
                  {concert.viewers} people watching right now
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
