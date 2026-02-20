import type { JSX } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { userFormSchema } from '#/schemas/userFormSchema';
import type { UserFormData } from '#/schemas/userFormSchema';

/**
 * User Registration Form demo component.
 */

const UserForm = (): JSX.Element => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(userFormSchema),
  });

  const onSubmit: SubmitHandler<UserFormData> = (data: UserFormData) => {
    alert(`User data submitted:\n${JSON.stringify(data, null, 2)}`);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-6 max-w-md mx-auto'>
      {/* Name */}
      <div>
        <label htmlFor='name' className='block font-semibold mb-1 text-gray-700'>
          Name
        </label>
        <input
          id='name'
          type='text'
          {...register('name')}
          placeholder='Your name'
          className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 ${
            errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {errors.name && <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor='email' className='block font-semibold mb-1 text-gray-700'>
          Email
        </label>
        <input
          id='email'
          type='email'
          {...register('email')}
          placeholder='you@example.com'
          className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 ${
            errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {errors.email && <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>}
      </div>

      {/* Age */}
      <div>
        <label htmlFor='age' className='block font-semibold mb-1 text-gray-700'>
          Age
        </label>
        <input
          id='age'
          type='number'
          {...register('age', { valueAsNumber: true })}
          placeholder='Your age'
          className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 ${
            errors.age ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {errors.age && <p className='mt-1 text-sm text-red-600'>{errors.age.message}</p>}
      </div>

      {/* Submit */}
      <button
        type='submit'
        disabled={isSubmitting}
        className='w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300'
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default UserForm;
