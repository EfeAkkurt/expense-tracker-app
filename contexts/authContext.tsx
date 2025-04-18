import { auth, firestore } from "@/config/firebase";
import { AuthContextType, UserType } from "@/types";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "expo-router";

const AuthContext = createContext<AuthContextType | null >(null)

export const AuthProvider : React.FC<{children: React.ReactNode}> = ({children}) => {
    const [user, setUser] = useState<UserType>(null);
    const router = useRouter();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            console.log("firebaseUser: ", firebaseUser);
            if(firebaseUser){
                setUser({
                    uid: firebaseUser?.uid,
                    name: firebaseUser?.displayName,
                    email: firebaseUser?.email,
                });
                updateUserData(firebaseUser.uid);
                router.replace('/(tabs)/wallet');
            }else{
                setUser(null);
                router.replace('/(auth)/welcome');
            }
        });
        return () => unsub();
    },[])

    const login = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return {success: true};
        }catch(error: any){
            let msg = error.message;
            console.log("error: ", msg);
            if(msg.includes('auth/invalid-credential')) msg = 'wrong credentials';
            if(msg.includes('auth/invalid-email')) msg = 'wrong email';
            return {success: false, msg};
        }
    }
    const register = async (email: string, password: string, name: string) => {
        try {
            let response = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(firestore, 'users', response?.user?.uid), 
            {
                name,
                email,
                uid:response?.user?.uid,
            }
        );
            return {success: true};
        }catch(error: any){
            let msg = error.message;
            console.log("error: ", msg);
            if(msg.includes('(auth/email-already-in-use)')) msg = 'email already in use';
            if(msg.includes('(auth/invalid-email)')) msg = 'Invalid email';
            return {success: false, msg};
        }
    };
    const updateUserData = async (uid: string) => {
        try {
            const docRef = doc(firestore, 'users', uid);
            const docSnap = await getDoc(docRef);

            if(docSnap.exists()){
                const data = docSnap.data();
                const userData: UserType = {
                    uid: data?.uid,
                    name: data.name || null,
                    email: data.email || null,
                    image: data.image || null,
                }
                setUser({ ...userData });
            }
        }catch(error: any){
            let msg = error.message;
            //return {success: false, msg};
            console.log("error: ", error);
        }
    }

    const contextValue: AuthContextType = {
        user,
        setUser,
        login,
        register,
        updateUserData,
    }
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if(!context){
        throw new Error('useAuth must be wrapped inside AuthProvider')
    }
    return context;
}