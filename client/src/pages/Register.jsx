import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await axios.post('/api/auth/register', data);
      alert('Rejestracja zakończona sukcesem!');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Błąd rejestracji');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Rejestracja</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Nazwa użytkownika</label>
          <input
            {...register('username', { required: 'Nazwa użytkownika jest wymagana' })}
            className="w-full p-2 border rounded"
            type="text"
          />
          {errors.username && <p className="text-red-500">{errors.username.message}</p>}
        </div>

        <div>
          <label>Email</label>
          <input
            {...register('email', {
              required: 'Email jest wymagany',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Nieprawidłowy format emaila',
              },
            })}
            className="w-full p-2 border rounded"
            type="email"
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label>Hasło</label>
          <input
            {...register('password', {
              required: 'Hasło jest wymagane',
              minLength: {
                value: 6,
                message: 'Hasło musi mieć co najmniej 6 znaków',
              },
            })}
            className="w-full p-2 border rounded"
            type="password"
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Zarejestruj się
        </button>
      </form>
    </div>
  );
}