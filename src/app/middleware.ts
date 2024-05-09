
import { withAuth, NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(request: NextRequestWithAuth) {
         console.log(request.nextUrl.pathname)
         console.log(request.nextauth.token)

        if (request.nextUrl.pathname.startsWith("/admin-dashboard")
            && request.nextauth.token?.role !== "admin") {
            return NextResponse.rewrite(
                new URL("/forgot-password", request.url)
            )
        }

        if (request.nextUrl.pathname.startsWith("/teacher-dashboard")
            && request.nextauth.token?.role !== "teacher") {
            return NextResponse.rewrite(
                new URL("/forgot-password", request.url)
            )
        }

        if (request.nextUrl.pathname.startsWith("/student-dashboard")
            && request.nextauth.token?.role !== "student") {
            return NextResponse.rewrite(
                new URL("/forgot-password", request.url)
            )
        }

    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
    }
)


export const config = { matcher: ["/admin-dashboard", "/teacher-dashboard", "/student-dashboard", "/login"] }
/*

// Without a defined matcher, this one line applies next-auth 
// to the entire project
export { default } from "next-auth/middleware"

// Applies next-auth only to matching routes - can be regex
// Ref: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = { matcher: ["/dashboard"] } */