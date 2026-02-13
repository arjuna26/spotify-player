import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { exchangeCodeForToken, isAuthenticated, verifyState } from '../services/auth';
import { useAuth } from '../context/AuthContext';

export default function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Authorization was denied. Please try again.');
      setTimeout(() => navigate('/', { replace: true }), 2000);
      return;
    }

    if (!verifyState(state)) {
      setError('Security verification failed. Please try again.');
      setTimeout(() => navigate('/', { replace: true }), 2000);
      return;
    }

    if (!code) {
      setError('No authorization code received.');
      setTimeout(() => navigate('/', { replace: true }), 2000);
      return;
    }

    exchangeCodeForToken(code).then((success) => {
      if (success) {
        refreshUser().then(() => navigate('/dashboard', { replace: true }));
      } else {
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/', { replace: true }), 2000);
      }
    });
    // Run once on mount; code is one-time use
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#0a0a0a]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {error ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-400 text-lg font-medium">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-2 border-zinc-800 border-t-[#1DB954] rounded-full"
              />
            </div>
            <div className="space-y-2">
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
