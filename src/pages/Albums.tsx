import { JSX } from 'react';
import Albums from '#/components/albums/Albums';

const AlbumsPage = (): JSX.Element => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-theme-dark-900">Albums</h1>
      <Albums />
    </div>
  );
};

export default AlbumsPage;
