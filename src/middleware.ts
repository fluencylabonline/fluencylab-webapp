import { withAuth, NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(request: NextRequestWithAuth) {
         console.log(request.nextUrl.pathname)
         console.log(request.nextauth.token)

        if (!request.nextauth.token) {
            return NextResponse.rewrite(
                new URL("/not-authorized", request.url)
            )
        }

        if (request.nextUrl.pathname.startsWith("/admin-dashboard")
            && request.nextauth.token.role !== "admin") {
            return NextResponse.rewrite(
                new URL("/not-authorized", request.url) // only if I am authenticated and try to access it, otherwise I'll be sent to Login
            )
        }

        if (request.nextUrl.pathname.startsWith("/teacher-dashboard")
            && request.nextauth.token.role !== "teacher") {
            return NextResponse.rewrite(
                new URL("/not-authorized", request.url)
            )
        }

        if (request.nextUrl.pathname.startsWith("/student-dashboard")
            && request.nextauth.token.role !== "student") {
            return NextResponse.rewrite(
                new URL("/not-authorized", request.url)
            )
        }

        // If none of the conditions are met, allow the request to proceed
        return NextResponse.next()
    },
)


export const config = { matcher: ["/admin-dashboard", "/teacher-dashboard", "/student-dashboard"] }
