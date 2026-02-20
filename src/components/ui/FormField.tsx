import { FormFieldProps } from "#/types/common/formfield.types";



const FormField = ({ icon: Icon, error, registration, placeholder, type = 'text', autoComplete, id }: FormFieldProps) => (
  <div>
    <div
      className={`flex items-center gap-2 px-3 py-2 w-90 rounded-md border bg-theme-light-100 ${
        error
          ? 'border-red-500 focus-within:ring-1 focus-within:ring-red-500'
          : 'border-[#EAEDF3] focus-within:ring-1 focus-within:border-theme-primary'
      }`}
    >
      <Icon color='grey' />
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        {...registration}
        placeholder={placeholder}
        className='flex-1 text-theme-dark-900 outline-none bg-transparent'
      />
    </div>
    {error && <p className='mt-1 text-sm text-red-600'>{error.message}</p>}
  </div>
);

export { FormField, type FormFieldProps };
