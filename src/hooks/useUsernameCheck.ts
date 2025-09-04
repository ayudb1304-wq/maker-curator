import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UsernameCheckResult {
  available: boolean;
  message: string;
  isChecking: boolean;
}

export const useUsernameCheck = (username: string, debounceMs = 500) => {
  const [result, setResult] = useState<UsernameCheckResult>({
    available: false,
    message: '',
    isChecking: false,
  });

  const checkUsername = useCallback(async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setResult({
        available: false,
        message: usernameToCheck.length > 0 ? 'Username must be at least 3 characters long' : '',
        isChecking: false,
      });
      return;
    }

    setResult(prev => ({ ...prev, isChecking: true }));

    try {
      const { data, error } = await supabase.functions.invoke('check-username', {
        body: { username: usernameToCheck.toLowerCase() },
      });

      if (error) {
        console.error('Username check error:', error);
        setResult({
          available: false,
          message: 'Error checking username availability',
          isChecking: false,
        });
        return;
      }

      setResult({
        available: data.available,
        message: data.message,
        isChecking: false,
      });
    } catch (err) {
      console.error('Username check exception:', err);
      setResult({
        available: false,
        message: 'Error checking username availability',
        isChecking: false,
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username.trim()) {
        checkUsername(username.trim());
      } else {
        setResult({
          available: false,
          message: '',
          isChecking: false,
        });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [username, debounceMs, checkUsername]);

  return result;
};