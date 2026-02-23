import { Facebook, Linkedin, Twitter } from 'lucide-react';
import type { JSX } from 'react/jsx-runtime';

import logoUrl from '#/assets/svgs/logo.svg';
import LoginForm from '../forms/LoginForm';
import { Button } from '../ui/Button';

const SOCIAL_ICONS = [Facebook, Twitter, Linkedin] as const;

const Login = (): JSX.Element => {
  return (
    <div className='flex w-full h-screen m-0 p-0'>
      <div className='bg-theme-primary w-3/6 p-16 pl-25'>
        <div>
          <img src={logoUrl} alt='Logo' />
          <div className='mt-35'>
            <h2 className='md:leading-15 text-white font-medium text-5xl'>
              Best Music
              <br />
              Streaming Platform
            </h2>
            <p className='pt-6 text-white font-normal text-base'>
              Musicale is one of the most popular and recognizable music <br />
              streaming apps ever
            </p>
          </div>

          <Button
            className='mt-20 w-40 bg-white rounded-full text-theme-primary hover:bg-theme-light-100 font-["Roboto"] font-normal'
            variant='default'
          >
            Login
          </Button>
        </div>
      </div>
      <div className='bg-white w-3/6 justify-center flex flex-col p-16'>
        <h1 className='font-medium text-4xl'>Create Account</h1>
        <div className='flex w-42 pt-8 justify-between items-center'>
          {SOCIAL_ICONS.map(Icon => (
            <Button key={Icon.displayName} size='icon' className='rounded-full bg-theme-primary'>
              <Icon />
            </Button>
          ))}
        </div>
        <p className='text-theme-dark-900 pt-10'>or use email for registration</p>
        <LoginForm />
      </div>
    </div>
  );
};
export default Login;
