import { compare } from "bcrypt"
import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import db from "@/lib/admin/prismadb"

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Tài khoản hoặc mật khẩu không được để trống')
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user?.password) {
          throw new Error('Tài khoản không tồn tại')
        }

        const isCorrectPassword = await compare(
          credentials.password,
          user.password
        );

        // const isCorrectPassword = true

        if (!isCorrectPassword) {
          throw new Error('Mật khẩu không đúng');
        }

        return user
      }
    })
  ],
  // callbacks: {
  //   session: ({ session, token }) => {
  //     console.log("Session Callback", { session, token });
  //     return {
  //       ...session,
  //       user: {
  //         ...session.user,
  //         id: token.id,
  //         randomKey: token.randomKey,
  //       },
  //     };
  //   },
  //   jwt: ({ token, user }) => {
  //     console.log("JWT Callback", { token, user });
  //     if (user) {
  //       const u = user as unknown as any;
  //       return {
  //         ...token,
  //         id: u.id,
  //         randomKey: u.randomKey,
  //       };
  //     }
  //     return token;
  //   },
  // },
  // pages: {
  //   signIn: '/',
  // },
  // debug: process.env.NODE_ENV === 'development',
  // secret: process.env.JWT_KEY,
}

export default NextAuth(authOptions);