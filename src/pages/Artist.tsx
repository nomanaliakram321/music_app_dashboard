import { JSX } from 'react';
import Artist from '#/components/artist/Artist';

const ArtistPage = (): JSX.Element => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-theme-dark-900">Artists</h1>
      <Artist />
    </div>
  );
};

export default ArtistPage;
