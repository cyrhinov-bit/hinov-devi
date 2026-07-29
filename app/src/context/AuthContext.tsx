import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from './AppContext';

interface AuthState {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updatePin: (currentPin: string, newPin: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (data && !error) {
      setCurrentUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as 'Directeur' | 'Responsable',
        serviceId: data.service_id,
        pin: data.pin,
        lastLogin: data.last_login
      });
    }
    setLoading(false);
  };

  const login = async (email: string, pin: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password: pin 
    });
    
    if (error || !data.user) {
      setLoading(false);
      return false;
    }
    
    // Update last_login
    await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);
    
    // fetchUserProfile is triggered by onAuthStateChange
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updatePin = async (currentPin: string, newPin: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Non connecté' };
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) return { success: false, error: 'Le nouveau PIN doit contenir exactement 6 chiffres.' };
    if (currentPin !== currentUser.pin) return { success: false, error: 'Code PIN actuel incorrect.' };

    // Update Supabase Auth password
    const { error: authError } = await supabase.auth.updateUser({ password: newPin });
    if (authError) return { success: false, error: authError.message };

    // Update pin field in profiles table
    const { error: profileError } = await supabase.from('profiles').update({ pin: newPin }).eq('id', currentUser.id);
    if (profileError) return { success: false, error: profileError.message };

    // Refresh local user
    await fetchUserProfile(currentUser.id);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, updatePin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
