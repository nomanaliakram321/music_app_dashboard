import type { JSX } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { Lock, Mail, User } from 'lucide-react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '#/components/ui/Button';
import { FormField } from '#/components/ui/FormField';
import { useLoginMutation } from '#/data/auth/mutations/login';
import type { LoginFormData } from '#/schemas/loginFormSchema';
import { loginFormSchema } from '#/schemas/loginFormSchema';
import env from '#env';

const LoginForm = (): JSX.Element => {
  const { mutate: login, isPending, error } = useLoginMutation();

  const errorMessage = error
    ? (error as AxiosError<{ message?: string }>).response?.data?.message || error.message
    : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: env.VITE_ENV === 'development' ? { username: 'emilys', password: 'emilyspass' } : undefined,
  });

  const onSubmit: SubmitHandler<LoginFormData> = data => {
    login({ payload: data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-5'>
      <div className='pt-8'>
        <FormField
          id='username'
          icon={User}
          error={errors.username}
          registration={register('username')}
          placeholder='Name'
          autoComplete='username'
        />
      </div>
      <FormField
        id='username'
        icon={Mail}
        error={errors.username}
        registration={register('username')}
        placeholder='Email'
        autoComplete='email'
      />
      <FormField
        id='password'
        icon={Lock}
        error={errors.password}
        registration={register('password')}
        placeholder='Password'
        type='password'
        autoComplete='current-password'
      />

      {errorMessage && <p className='text-sm text-red-600'>{errorMessage}</p>}

      <Button type='submit' disabled={isPending} className='w-40 rounded-full h-11 bg-theme-primary mt-5.5' size='lg'>
        {isPending ? 'Signing in...' : 'Sign Up'}
      </Button>
    </form>
  );
};

export default LoginForm;
