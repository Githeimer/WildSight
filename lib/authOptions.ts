import { AuthOptions } from "next-auth";

declare module "next-auth" {
  interface User {}

  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface JWT {
    id?: string;
  }
}

import GoogleProvider from "next-auth/providers/google";
import { getUserByEmail, createUser } from "@/helpers/authHelper";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        let userInDb = await getUserByEmail(profile.email);

        if (!userInDb) {
          userInDb = await createUser({
            email: profile.email,
            username: profile.name || profile.email.split("@")[0],
          });
        }

        token.id = userInDb?.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
