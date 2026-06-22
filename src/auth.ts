import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user) return null

        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role as "user" | "organizer" | "admin",
          image: user.avatar,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: newSession }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.picture = user.image
        token.name = user.name
        // Store timestamp to track when user data was loaded
        token.loadedAt = Date.now()
      }
      // Re-fetch user from database on update to get latest avatar
      if (trigger === "update" && token.id) {
        try {
          const updatedUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { avatar: true, username: true }
          })
          if (updatedUser) {
            token.picture = updatedUser.avatar
            token.name = updatedUser.username
            token.loadedAt = Date.now()
          }
        } catch (error) {
          // Ignore database errors during session update
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role
        session.user.name = token.name as string
        // Append timestamp to avatar URL for cache busting
        const baseAvatar = token.picture as string | null | undefined
        const loadedAt = token.loadedAt as number | undefined
        if (baseAvatar && loadedAt) {
          session.user.image = `${baseAvatar}?t=${loadedAt}`
        } else if (baseAvatar) {
          session.user.image = baseAvatar
        } else {
          session.user.image = undefined
        }
        (session.user as any).loadedAt = loadedAt
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  trustHost: true,
})