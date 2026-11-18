# Ehemaligenturnier – SC Münster 08 Handball

Next.js 16 (TypeScript), PostgreSQL, Drizzle ORM, Better Auth (E-Mail + Passwort).

## Deployment auf dem eigenen Server

```bash
cp .env.example .env
openssl rand -base64 32
nano .env
docker compose up -d --build
```

Die Datenbank-Migrationen laufen beim Start der App automatisch. Dabei wird auch das Event und die Helferrolle „Schiedsrichter“ angelegt.

### Caddy

```caddy
deine-domain.de {
	encode zstd gzip
	reverse_proxy 127.0.0.1:3000
}
```

Läuft Caddy selbst in Docker, statt `127.0.0.1:3000` den Container über ein gemeinsames Netzwerk ansprechen (`app:3000`) und das Port-Mapping in `docker-compose.yml` entfernen.

### Updates

```bash
git pull
docker compose up -d --build
```

### Backup

```bash
docker compose exec db pg_dump -U turnier turnier > backup-$(date +%F).sql
```

## Admins

Admins sind die E-Mail-Adressen in `ADMIN_EMAILS` (kommagetrennt). Sie melden sich ganz normal an und sehen dann den Menüpunkt „Admin“. Nach einer Änderung: `docker compose up -d`.

## Zahlung

Solange die Zahlung im Admin-Bereich nicht freigeschaltet ist, steht auf der Seite nur, dass ein Beitrag anfällt. Zum Freischalten im Admin-Bereich unter „Veranstaltung“ Beitrag und PayPal.me-Link eintragen und „Zahlung freischalten“ anhaken. Helferrollen mit „zahlt keinen Teilnahmebeitrag“ befreien automatisch vom Beitrag.

## Siegerfotos

Fotos in den Ordner `fotos/` legen (JPG, PNG, WebP, AVIF). Der Dateiname ist die Bildunterschrift, `_` wird zu Leerzeichen, eine vorangestellte Nummer wie `01_` legt nur die Reihenfolge fest. Der Ordner wird in Docker eingebunden, ein Neustart ist nicht nötig. Am besten die Fotos vorher auf etwa 2000 px Breite verkleinern.

## Telegram-Benachrichtigung

Bei jeder neuen Anmeldung schickt die App eine Nachricht in einen Telegram-Chat. Ohne `TELEGRAM_BOT_TOKEN` und `TELEGRAM_CHAT_ID` wird die Nachricht nur ins Server-Log geschrieben.

1. In Telegram `@BotFather` öffnen, `/newbot` schicken und den Token in `TELEGRAM_BOT_TOKEN` eintragen.
2. Eine Gruppe fürs Orga-Team anlegen und den Bot hinzufügen.
3. In der Gruppe `/start@NameDeinesBots` schreiben.
4. `https://api.telegram.org/bot<TOKEN>/getUpdates` im Browser öffnen und die `chat.id` der Gruppe (eine negative Zahl) in `TELEGRAM_CHAT_ID` eintragen.
5. App neu starten.

## Texte anpassen

| Was | Wo |
| --- | --- |
| Begrüßungstext | `src/content/welcome.ts` |
| Versicherungshinweis | `src/components/ParticipationFields.tsx` |
| Impressum / Datenschutz | `src/app/impressum/page.tsx`, `src/app/datenschutz/page.tsx` |
| Datum, Ort, Beitrag, PayPal-Link, Helferrollen | im Admin-Bereich |

## Lokal entwickeln

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ohne `BREVO_API_KEY` werden Mails nur ins Server-Log geschrieben. Die Absenderadresse in `FROM_MAIL` muss in Brevo als Absender bestätigt sein.

Nach Schemaänderungen in `src/db/schema.ts`: `npx drizzle-kit generate`.
