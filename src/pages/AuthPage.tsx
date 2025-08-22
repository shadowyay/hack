import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

interface AuthPageProps {
  onLogin: (userData: { username: string; email: string; id: string }) => void;
  onGoBack: () => void;
}

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onGoBack }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginData, setLoginData] = useState<LoginData>({
    username: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created successfully! Please login.');
        setIsLoginMode(true);
        setRegisterData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.6 }}
        className="glass-strong w-full max-w-md p-8 rounded-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="font-western text-4xl text-wild-west-300 text-glow mb-2"
          >
            {isLoginMode ? 'Welcome Back' : 'Join the Gang'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-elegant text-wild-west-200"
          >
            {isLoginMode 
              ? 'Enter your credentials, partner' 
              : 'Sign up for the frontier adventure'
            }
          </motion.p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-600/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-center"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-green-600/20 border border-green-500/50 text-green-200 p-3 rounded-lg mb-4 text-center"
          >
            {success}
          </motion.div>
        )}

        {/* Forms */}
        {isLoginMode ? (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleLogin}
            className="space-y-6"
          >
            <div>
              <label className="block text-wild-west-200 font-elegant mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={loginData.username}
                onChange={handleLoginChange}
                required
                className="input-western w-full bg-black/50 border-wild-west-600 text-white placeholder-wild-west-400"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-wild-west-200 font-elegant mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                className="input-western w-full bg-black/50 border-wild-west-600 text-white placeholder-wild-west-400"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              variant="western"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner-western w-5 h-5 mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleRegister}
            className="space-y-6"
          >
            <div>
              <label className="block text-wild-west-200 font-elegant mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
                required
                minLength={3}
                className="input-western w-full bg-black/50 border-wild-west-600 text-white placeholder-wild-west-400"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-wild-west-200 font-elegant mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
                className="input-western w-full bg-black/50 border-wild-west-600 text-white placeholder-wild-west-400"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-wild-west-200 font-elegant mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
                minLength={6}
                className="input-western w-full bg-black/50 border-wild-west-600 text-white placeholder-wild-west-400"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className="block text-wild-west-200 font-elegant mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                required
                minLength={6}
                className="input-western w-full bg-black/50 border-wild-west-600 text-white placeholder-wild-west-400"
                placeholder="Confirm your password"
              />
            </div>

            <Button
              type="submit"
              variant="western"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner-western w-5 h-5 mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </motion.form>
        )}

        {/* Switch Mode */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError('');
              setSuccess('');
            }}
            className="text-wild-west-300 hover:text-wild-west-200 font-elegant transition-colors duration-200"
          >
            {isLoginMode 
              ? "Don't have an account? Sign up here" 
              : "Already have an account? Sign in here"
            }
          </button>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Button
            onClick={onGoBack}
            variant="saloon"
            className="w-full"
          >
            Back to Main Menu
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
