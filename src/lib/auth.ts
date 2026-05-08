import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "oura",
      name: "Oura",
      type: "oauth",
      authorization: {
        url: "https://cloud.ouraring.com/oauth/authorize",
        params: {
          scope: "email personal daily heartrate workout tag session spo2",
          response_type: "code",
        },
      },
      token: {
        url: "https://api.ouraring.com/oauth/token",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async request(context: any) {
          const params = new URLSearchParams({
            grant_type: "authorization_code",
            code: context.params.code as string,
            redirect_uri: context.provider.callbackUrl,
            client_id: process.env.OURA_CLIENT_ID!,
            client_secret: process.env.OURA_CLIENT_SECRET!,
          });
          const res = await fetch("https://api.ouraring.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
          });
          const tokens = await res.json();
          return { tokens };
        },
      },
      userinfo: "https://api.ouraring.com/v2/usercollection/personal_info",
      checks: ["none"],
      clientId: process.env.OURA_CLIENT_ID,
      clientSecret: process.env.OURA_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.email,
          email: profile.email,
          image: null,
        };
      },
    },
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
