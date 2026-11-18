const TELEGRAM_API = "https://api.telegram.org";

export function escapeHtml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export async function sendTelegram(html: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.info(`[telegram] TELEGRAM_BOT_TOKEN oder TELEGRAM_CHAT_ID fehlt – Nachricht:\n${html}`);
    return;
  }

  const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: html,
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram hat die Nachricht abgelehnt (${response.status}): ${await response.text()}`);
  }
}
