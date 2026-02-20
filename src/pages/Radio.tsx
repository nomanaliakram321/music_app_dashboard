import { JSX } from 'react';
import Radio from '#/components/Radio/Radio';

const RadioPage = (): JSX.Element => {
  return (
    <div>
      <h1 className='text-2xl font-bold text-theme-dark-900'>Radio</h1>
      <Radio />
    </div>
  );
};

export default RadioPage;
