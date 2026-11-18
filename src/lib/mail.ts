type Mail = {
  to: string;
  subject: string;
  text: string;
};

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export async function sendMail(mail: Mail): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.info(`[mail] BREVO_API_KEY fehlt – Mail an ${mail.to}: ${mail.subject}\n${mail.text}`);
    return;
  }

  const response = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: process.env.FROM_MAIL, name: process.env.FROM_NAME },
      to: [{ email: mail.to }],
      subject: mail.subject,
      textContent: mail.text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Brevo hat die Mail abgelehnt (${response.status}): ${await response.text()}`);
  }
}

export function appUrl(pathname = "/"): string {
  return new URL(pathname, process.env.BETTER_AUTH_URL ?? "http://localhost:3000").toString();
}
