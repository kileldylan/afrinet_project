import { useState } from 'react';
import axiosInstance from '../api/axios';

function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      const res = await axiosInstance.post('/token/', {
        phone_number: phone,
        password,
      });

      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);

      // redirect to dashboard or hotspot access page
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Phone number"
        onChange={e => setPhone(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={login}>Login</button>
    </div>
  );
}

export default Login;
