import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { exchangeCodeForToken, isAuthenticated } from '../services/auth';
import { useAuth } from '../context/AuthContext';

export default function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) return;
    
    // If already authenticated, redirect to dashboard immediately
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const handleCallback = async () => {
      hasProcessed.current = true;
      
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Authorization was denied. Please try again.');
        setTimeout(() => navigate('/', { replace: true }), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received.');
        setTimeout(() => navigate('/', { replace: true }), 3000);
        return;
      }

      const success = await exchangeCodeForToken(code);

      if (success) {
        await refreshUser();
        // Use replace to prevent back button from going to callback
        navigate('/dashboard', { replace: true });
      } else {
        // Check if we're authenticated anyway (might have succeeded on first try)
        if (isAuthenticated()) {
          await refreshUser();
          navigate('/dashboard', { replace: true });
        } else {
          setError('Failed to authenticate. Please try again.');
          setTimeout(() => navigate('/', { replace: true }), 3000);
        }
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#141414]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        {error ? (
          <>
            <div className="text-red-500 text-xl mb-4">{error}</div>
            <p className="text-[#a1a1aa]">Redirecting...</p>
          </>
        ) : (
          <>
            {/* Loading spinner */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-[#8A2BE2] border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-[#a1a1aa] text-lg">Connecting to Spotify...</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
