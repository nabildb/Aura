// Contexto de autenticación: proporciona `session`, `user`, `loading`,
// `isAdmin` (basado en profiles.role) e `isLoggedIn` a toda la aplicación.
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

interface UserProfile {
    id: string;
    role: string;
    full_name?: string | null;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
    isLoggedIn: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    async function fetchProfile(userId: string) {
        const { data } = await supabase
            .from('profiles')
            .select('id, role, full_name')
            .eq('id', userId)
            .maybeSingle();
        setProfile(data ?? null);
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id).finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id).finally(() => setLoading(false));
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => { subscription.unsubscribe(); };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    // isAdmin: solo si el rol en profiles es 'admin'
    const isAdmin = profile?.role === 'admin';
    // isLoggedIn: cualquier usuario autenticado
    const isLoggedIn = !!user;

    return (
        <AuthContext.Provider value={{ session, user, profile, loading, isAdmin, isLoggedIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
