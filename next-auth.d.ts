// Ref: https://next-auth.js.org/getting-started/typescript#module-augmentation

import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string,
            role: string,
            name: string,
            email: string,
            image: string,
            userName: string,
            link: string,
            numero:string,
            idioma: string,
            professorId: string,
            calendarLink: string,
        } & DefaultSession
    }

    interface User extends DefaultUser {
        id: string,
        role: string,
        name: string,
        email: string,
        image: string,
        userName: string,
        link: string,
        numero:string,
        idioma: string,
        professorId: string,
        calendarLink: string,
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string,
        role: string,
        name: string,
        email: string,
        image: string,
        userName: string,
        link: string,
        numero:string,
        idioma: string,
        professorId: string,
        calendarLink: string,
    }
}


declare global {
    interface Window {
      $MPC_loaded?: boolean;
    }
  }
  
  export {};
  