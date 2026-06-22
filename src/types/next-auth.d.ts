import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "organizer" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    role: "user" | "organizer" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "user" | "organizer" | "admin";
  }
}
