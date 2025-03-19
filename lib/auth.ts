import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn() {
      return true
    },
    async session({ session }) {
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

