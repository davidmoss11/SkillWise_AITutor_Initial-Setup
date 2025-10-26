// React import not required with modern JSX transform
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Zod schema for form validation
const registerSchema = z
  .object({
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

function RegisterForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/api/auth/register', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (response.data.success) {
        navigate('/login');
      }
    } catch (error) {
      // Registration failed; show client-side message (server error details in backend logs)
      // Optionally could set local state to show the error
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">First Name</label>
          <input
            {...register('firstName')}
            className="w-full p-2 border rounded"
            type="text"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1">Last Name</label>
          <input
            {...register('lastName')}
            className="w-full p-2 border rounded"
            type="text"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm">{errors.lastName.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            {...register('email')}
            className="w-full p-2 border rounded"
            type="email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1">Password</label>
          <input
            {...register('password')}
            className="w-full p-2 border rounded"
            type="password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1">Confirm Password</label>
          <input
            {...register('confirmPassword')}
            className="w-full p-2 border rounded"
            type="password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default RegisterForm;
