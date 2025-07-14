import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'super_admin';
  createdAt: Date;
}

export interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
}

class AuthService {
  private authState: AuthState = {
    user: null,
    loading: true,
    error: null
  };

  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    this.initializeAuthListener();
  }

  private initializeAuthListener() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<AdminUser, 'uid'>;
          this.authState.user = {
            uid: firebaseUser.uid,
            ...userData
          };
        }
      } else {
        this.authState.user = null;
      }
      this.authState.loading = false;
      this.notifyListeners();
    });
  }

  async signUp(email: string, password: string, displayName: string): Promise<AdminUser> {
    try {
      this.authState.error = null;
      this.notifyListeners();

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName });

      // Create admin user document
      const adminUser: AdminUser = {
        uid: user.uid,
        email: user.email!,
        displayName,
        role: 'admin',
        createdAt: new Date()
      };

      await setDoc(doc(db, 'admins', user.uid), {
        email: adminUser.email,
        displayName: adminUser.displayName,
        role: adminUser.role,
        createdAt: adminUser.createdAt
      });

      return adminUser;
    } catch (error: any) {
      this.authState.error = error.message;
      this.notifyListeners();
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<AdminUser> {
    try {
      this.authState.error = null;
      this.notifyListeners();

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get admin user data
      const userDoc = await getDoc(doc(db, 'admins', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User is not an admin');
      }

      const userData = userDoc.data() as Omit<AdminUser, 'uid'>;
      const adminUser: AdminUser = {
        uid: user.uid,
        ...userData
      };

      return adminUser;
    } catch (error: any) {
      this.authState.error = error.message;
      this.notifyListeners();
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      // Explicitly update the auth state to ensure listeners are notified
      this.authState.user = null;
      this.authState.error = null;
      this.notifyListeners();
    } catch (error: any) {
      this.authState.error = error.message;
      this.notifyListeners();
      throw error;
    }
  }

  getCurrentUser(): AdminUser | null {
    return this.authState.user;
  }

  isAuthenticated(): boolean {
    return this.authState.user !== null;
  }

  isLoading(): boolean {
    return this.authState.loading;
  }

  getError(): string | null {
    return this.authState.error;
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    listener(this.authState);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }
}

export const authService = new AuthService(); 