import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from "@/app/firebase";

interface Credentials {
  email: string;
  password: string;
}

export const options: NextAuthOptions = {
  pages: {
    signIn: '/signin'
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials: Credentials | undefined, req: any): Promise<any> {
        if (!credentials) {
          return null;
        }
        
        return await signInWithEmailAndPassword(auth, credentials.email, credentials.password)
          .then(async userCredential => {
            if (userCredential.user) {
              const userDocRef = doc(db, 'users', userCredential.user.uid);
              const userDocSnapshot = await getDoc(userDocRef);
              if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                return {
                  id: userCredential.user.uid,
                  name: userData.name,
                  email: userData.email,
                  role: userData.role,
                  userName: userData.userName,
                  link: userData.link,
                  numero:userData.numero,
                  idioma: userData.idioma,
                };
              }
            }
            return null;
          })
          .catch(error => console.error(error));
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.role = user.role;
        token.id = user.id;
        token.userName = user.userName;
        token.link = user.link;
        token.numero = user.numero;
        token.idioma = user.idioma;
      }
      return token
    },
    
    async session({ session, token }) {
      if (session?.user) {
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.userName = token.userName;
        session.user.link = token.link;
        session.user.numero = token.numero;
        session.user.idioma = token.idioma;
      }
      return session
    },
  }
};
