import { GENRES } from "#/constants/ui"

const Browse=()=>{
    return(
      <div className="mt-6 grid grid-cols-3 gap-5">
        {GENRES.map((genre) => (
          <div
            key={genre.name}
            className="group relative  cursor-pointer overflow-hidden rounded-2xl "
          >
            <img
              src={genre.image}
              alt={genre.name}
              className="size-full object-covertransition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-theme-dark-900 to-transparent" />
            <div className="absolute inset-0 flex items-end justify-center pb-6">
              <span className="text-lg font-bold text-white drop-shadow-lg">{genre.name}</span>
            </div>
          </div>
        ))}
      </div>
    )
}

export default Browse