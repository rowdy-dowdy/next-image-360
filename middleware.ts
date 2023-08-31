import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/utils/jwt'

const middlewareAdmin = async (request: NextRequest) => {
  let cookie = request.cookies.get('token-admin')?.value
  let adminId = null
  if (cookie) {
    let temp = await verifyToken(cookie)
    if (temp?.payload.sub) {
      adminId = temp.payload.sub
    }
  }

  const { pathname } = request.nextUrl
  const isRouteLogin = pathname == "/admin/login"

  if (isRouteLogin) {
    if (adminId) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('adminId', adminId)

      return NextResponse.redirect(new URL('/admin', request.url), {
        headers: requestHeaders
      })
    }
    else {
      return NextResponse.next()
    }
  }
  else {
    if (adminId) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('adminId', adminId)

      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })
    }
    else {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/')) {
    // This logic is only applied to /dashboard
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    // return middlewareAdmin(request)
  }
}