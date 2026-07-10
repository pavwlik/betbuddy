# BetBuddy

Skupinové ankety mezi kamarády → kurzy podle hlasů → sázení virtuálních bodů.

**Důležité:** sázky jsou na virtuální body (`User.points`), ne na skutečné
peníze s vkladem/výběrem. Peer-to-peer sázení o reálné peníze podléhá
hazardní licenci ve většině zemí (v ČR pod Ministerstvem financí) — tenhle
projekt to schválně obchází tím, že to je "jen hra" mezi kamarády.

## Jak to funguje

1. Založíš skupinu a pozveš kamarády (uživatelským jménem).
2. Kdokoliv ve skupině založí anketu s 2+ možnostmi a časem uzávěrky.
3. Každý musí nejdřív hlasovat (anonymně — nikdo nevidí, kdo jak hlasoval),
   aby se mu odemkly agregované statistiky a úvodní kurzy.
4. Úvodní kurzy vycházejí z poměru hlasů (`computeOpeningOddsFromVotes`).
   Jakmile začnou padat sázky, kurzy se přepočítají parimutuel systémem
   (`computeOdds`) — poměr celkového poolu k poolu na danou možnost, s 5%
   marží.
5. Sázka uzamkne kurz v momentě vsazení (`Bet.oddsAtBet`), takže pozdější
   pohyb kurzu neovlivní už uzavřené sázky.

## Tech stack

- **Next.js 15** (App Router, server + client komponenty)
- **Prisma** + SQLite lokálně / Postgres na produkci
- **NextAuth (Auth.js)** — v repu je jen demo `Credentials` provider
  (přihlášení pouhým uživatelským jménem, bez hesla). Pro produkci nahraď
  za Google/Apple/email magic link, ať si lidi nemůžou vydávat za kamarády.
- **Tailwind CSS** — tmavý neon design podle mockupů

## Lokální spuštění

```bash
npm install
cp .env.example .env
# vygeneruj vlastní NEXTAUTH_SECRET:
openssl rand -base64 32

npm run db:push     # vytvoří SQLite databázi podle schema.prisma
npm run db:seed      # (volitelné) naplní demo skupinou a anketou
npm run dev
```

Otevři http://localhost:3000, přihlas se libovolným uživatelským jménem
(např. `petr` z demo dat, nebo úplně nové).

## Nasazení na Vercel

SQLite nejde na Vercelu použít (serverless funkce nemají trvalý disk).
Před nasazením:

1. Založ databázi — nejjednodušší je **Vercel Postgres** nebo **Neon**
   (Storage tab v projektu na Vercelu → Create Database).
2. V `prisma/schema.prisma` změň:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Nastav environment variables v nastavení Vercel projektu:
   - `DATABASE_URL` — connection string z Vercel Postgres/Neon
   - `NEXTAUTH_SECRET` — náhodný řetězec (`openssl rand -base64 32`)
   - `NEXTAUTH_URL` — tvoje produkční doména (např. `https://betbuddy.vercel.app`)
4. Propoj GitHub repo s Vercel projektem (nebo `vercel deploy` přes CLI) a
   nasaď. `postinstall` skript v `package.json` sám spustí `prisma generate`.
5. Po prvním nasazení spusť migraci schématu proti produkční DB, např.
   lokálně s produkčním `DATABASE_URL` v `.env`:
   ```bash
   npx prisma db push
   ```

## Co dodělat, než to pustíš k opravdovým kamarádům

- Nahradit demo `Credentials` auth za reálný OAuth provider
- Přidat cron job (Vercel Cron) na automatické uzavírání anket po `closesAt`
  a vyhodnocování sázek (nastavení `winningOptionId`, výplata výher)
- Realtime aktualizace kurzů (Pusher/Ably), teď se kurzy načtou znovu jen
  při refreshi/akci
- Rate limiting a validace vstupů na API routách
