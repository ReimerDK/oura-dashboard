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
        async conform(response: Response) {
          const body = await response.json();
          // Oura returns id_token: null which oauth4webapi rejects — strip it
          delete body.id_token;
          return new Response(JSON.stringify(body), {
            status: response.status,
            headers: response.headers,
          });
        },
      },
      userinfo: "https://api.ouraring.com/v2/usercollection/personal_info",
      issuer: "https://moi.ouraring.com/oauth/v2/ext/oauth-anonymous",
      // Oura's OAuth server does not return a state param, so standard state/PKCE checks fail
      checks: ["none"],
      clientId: process.env.OURA_CLIENT_ID,
      clientSecret: process.env.OURA_CLIENT_SECRET,
      profile(profile) {
        const localPart = profile.email?.split("@")[0] ?? "";
        const displayName = localPart.charAt(0).toUpperCase() + localPart.slice(1);
        return {
          id: profile.id,
          name: displayName || profile.email,
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
