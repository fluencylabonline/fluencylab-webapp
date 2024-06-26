import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, getDocs, doc, query, collection, where } from 'firebase/firestore';
import { auth, db } from "@/app/firebase";

interface Credentials {
  email: string;
  password: string;
}

export const options: NextAuthOptions = {
  pages: {
    signIn: '/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Credentials | undefined, req: any): Promise<any> {
        if (!credentials) {
          return null;
        }
        
        let email = credentials.email;
        const password = credentials.password;
        
        // Check if login identifier is an email or a username
        if (!email.includes('.com')) {
          // Search for the username in the database
          const querySnapshot = await getDocs(query(collection(db, 'users'), where('userName', '==', email)));
          if (!querySnapshot.empty) {
            // Get the user's email from the document
            const userData = querySnapshot.docs[0].data();
            email = userData.email;
          } else {
            // Return null if username not found
            console.error('Username not found');
            return null;
          }
        }

        // Proceed with the email login
        return await signInWithEmailAndPassword(auth, email, password)
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
                  numero: userData.numero,
                  idioma: userData.idioma,
                  professorId: userData.professorId,
                  calendarLink: userData.calendarLink,
                };
              }
            }
            return null;
          })
          .catch(error => {
            console.error(error);
            return null;
          });
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
        token.professorId = user.professorId;
        token.calendarLink = user.calendarLink;
      }
      return token;
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
        session.user.professorId = token.professorId;
        session.user.calendarLink = token.calendarLink;
      }
      return session;
    },
  }
};
