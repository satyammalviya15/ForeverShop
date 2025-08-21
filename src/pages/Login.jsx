import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { setToken, navigate, backendUrl, token } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (currentState === 'Login') {
        const response = await axios.post(`${backendUrl}/api/user/login`, {
          email: formData.email,
          password: formData.password
        });

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          navigate('/');
          window.location.reload();
        } else {
          toast.error(response.data.message || 'Invalid email or password');
        }
      } else {
        const response = await axios.post(`${backendUrl}/api/user/register`, {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          navigate('/');
        } else {
          toast.error(response.data.message || 'Registration failed');
        }
      }
    } catch (error) {
      console.error(error);
      // Display backend error message if exists, else fallback
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  return (
    <form 
      onSubmit={handleSubmit} 
      className="
        flex flex-col items-center 
        w-[90%] sm:max-w-96 
        m-auto mt-14 gap-4 text-gray-800 
        min-h-[325px]
        justify-center rounded-md
        transition-all duration-300
      "
    >
      <div className='inline-flex items-center gap-2 mb-2'>
        <p className='prata-regular text-3xl'>{currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800'/>
      </div>

      {currentState === 'Login' ? null : (
        <input 
          type='text' 
          name='name'
          className='w-full px-3 py-2 border border-gray-800' 
          placeholder='Name' 
          value={formData.name}
          onChange={handleChange}
          required 
        />
      )}

      <input 
        type='email' 
        name='email'
        className='w-full px-3 py-2 border border-gray-800' 
        placeholder='Email' 
        value={formData.email}
        onChange={handleChange}
        required 
      />

      <input 
        type='password' 
        name='password'
        className='w-full px-3 py-2 border border-gray-800' 
        placeholder='Password' 
        value={formData.password}
        onChange={handleChange}
        required 
      />

      <div className='w-full flex justify-between text-sm mt-[-8px]'>
        <p className='cursor-pointer'>Forget your password?</p>
        {currentState === 'Login' ? (
          <p 
            onClick={() => setCurrentState('Sign Up')} 
            className='cursor-pointer'
          >
            Create account
          </p>
        ) : (
          <p 
            onClick={() => setCurrentState('Login')} 
            className='cursor-pointer'
          >
            Login Here
          </p>
        )}
      </div>

      <button 
        type='submit'
        className='bg-black text-white font-light px-8 py-2 mt-4'
      >
        {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
      </button>
    </form>
  );
};

export default Login;
