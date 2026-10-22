import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types/index.ts';
import { initialUsers } from '../data/initialData.ts';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  switchRole: (role: UserRole) => void;
  availableUsers: UserAccount[];
  addUser: (user: Omit<UserAccount, 'uid' | 'createdAt'>) => void;
  updateUser: (uid: string, updates: Partial<UserAccount>) => void;
  deleteUser: (uid: string) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  firebaseUser: FirebaseUser | null;
  // Permission helpers
  canManageStudents: boolean;
  canViewConfidentialHealth: boolean;
  canManageVisits: boolean;
  canManageInventory: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canViewReports: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'uks_current_user_v1';
const USERS_STORAGE_KEY = 'uks_users_list_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialUsers;
      }
    }
    return initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialUsers[1]; // Default: Petugas UKS (Siti Nurhalizah) for great UX
      }
    }
    return initialUsers[1];
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user && user.email) {
        // If logged in with Google, check if user exists in list or associate as admin
        const existing = users.find((u) => u.email.toLowerCase() === user.email?.toLowerCase());
        if (existing) {
          setCurrentUser(existing);
        } else {
          const newUser: UserAccount = {
            uid: user.uid,
            name: user.displayName || 'Pengguna Google UKS',
            email: user.email,
            role: 'petugas_uks',
            phone: user.phoneNumber || '081234567890',
            active: true,
            createdAt: new Date().toISOString()
          };
          setUsers((prev) => [newUser, ...prev]);
          setCurrentUser(newUser);
        }
      }
    });
    return () => unsubscribe();
  }, [users]);

  const switchRole = (role: UserRole) => {
    const found = users.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
    } else {
      const demoUser: UserAccount = {
        uid: `user-${role}`,
        name:
          role === 'admin'
            ? 'Administrator UKS'
            : role === 'petugas_uks'
            ? 'Siti Nurhalizah, S.Kep., Ners'
            : role === 'guru'
            ? 'Budi Santoso, S.Pd. (Wali Kelas 7A)'
            : 'Ahmad Fauzi, M.Pd. (Kepala Sekolah)',
        email: `${role}@smpalamexcellentia.sch.id`,
        role,
        assignedClass: role === 'guru' ? '7A' : undefined,
        active: true,
        createdAt: '2026-07-01'
      };
      setCurrentUser(demoUser);
    }
  };

  const addUser = (userData: Omit<UserAccount, 'uid' | 'createdAt'>) => {
    const newUser: UserAccount = {
      ...userData,
      uid: 'usr-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const updateUser = (uid: string, updates: Partial<UserAccount>) => {
    setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, ...updates } : u)));
    if (currentUser.uid === uid) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  };

  const deleteUser = (uid: string) => {
    setUsers((prev) => prev.filter((u) => u.uid !== uid));
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      console.error('Google Sign In error:', err);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.warn('Firebase sign out error:', err);
    }
    // Set to Petugas UKS or Admin as fallback
    setCurrentUser(initialUsers[1]);
  };

  // Explicit RBAC Permissions
  const role = currentUser.role;
  const canManageStudents = role === 'admin' || role === 'petugas_uks';
  const canViewConfidentialHealth = role === 'admin' || role === 'petugas_uks';
  const canManageVisits = role === 'admin' || role === 'petugas_uks';
  const canManageInventory = role === 'admin' || role === 'petugas_uks';
  const canManageUsers = role === 'admin';
  const canManageSettings = role === 'admin';
  const canViewReports = role === 'admin' || role === 'petugas_uks' || role === 'kepala_sekolah';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        availableUsers: users,
        addUser,
        updateUser,
        deleteUser,
        loginWithGoogle,
        logout,
        firebaseUser,
        canManageStudents,
        canViewConfidentialHealth,
        canManageVisits,
        canManageInventory,
        canManageUsers,
        canManageSettings,
        canViewReports
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
