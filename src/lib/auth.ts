import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendMail } from "./mail";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Passwort zurücksetzen – Ehemaligenturnier",
        text: `Hallo ${user.name},\n\nüber diesen Link vergibst du ein neues Passwort:\n${url}\n\nDer Link ist eine Stunde gültig. Wenn du das nicht angefordert hast, kannst du diese Mail ignorieren.\n\nSC Münster 08 Handball`,
      }).catch((error: unknown) => console.error("Passwort-Mail konnte nicht gesendet werden", error));
    },
  },
  user: {
    changeEmail: { enabled: true, updateEmailWithoutVerification: true },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 90,
    updateAge: 60 * 60 * 24,
  },
  plugins: [nextCookies()],
});
