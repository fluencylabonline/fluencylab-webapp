import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

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
      }
    })
  ]
};
