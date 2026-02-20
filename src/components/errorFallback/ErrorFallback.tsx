import type { FallbackProps } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  //replace with your own error Fallback Ui
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      <div className='p-8 bg-white rounded-lg shadow-md max-w-md w-full'>
        <h2 className='text-2xl font-bold text-red-600 mb-4'>Something went wrong!</h2>
        <div className='text-gray-600 mb-4'>
          <pre className='text-sm overflow-auto p-2 bg-gray-100 rounded'>{error.message}</pre>
        </div>
        <button
          type='button'
          onClick={resetErrorBoundary}
          className='w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors'
        >
          Try again
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;
