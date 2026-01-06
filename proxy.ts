import { default as proxy } from "next-auth/middleware"

export const config = {
  matcher: [],  // Use '/((?!api|_next/static|_next/image|favicon.ico).*)' when enabling for realz
};
export default proxy;
