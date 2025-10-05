import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('/api/auth/login', data);
      localStorage.setItem('token', res.data.token); // jeśli dodasz JWT
      localStorage.setItem('username', res.data.username); // tymczasowo
      localStorage.setItem('role', res.data.role); // zapisuje rolę użytkownika
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Błąd logowania');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Logowanie</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4"> 
        {/* obsługuje walidację i wywołuje onSubmit */}
        {/* z danymi zbieranymi przez register */}
        <div>
          <label>Email</label>
          <input
            {...register('email', { required: 'Email jest wymagany' })} // tworzy klucz w obiekcie danych formularza o nazwie 'email'
            className="w-full p-2 border rounded"
            type="email"
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label>Hasło</label>
          <input
            {...register('password', { required: 'Hasło jest wymagane' })} // tworzy klucz w obiekcie danych formularza o nazwie 'password' 
            className="w-full p-2 border rounded"
            type="password"
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Zaloguj się
        </button>
      </form>
    </div>
  );
}