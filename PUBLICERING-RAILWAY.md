# Publiceringsguide — leveranzfrankranz.se på Railway

Tre steg: domän → Google Sheets → Railway. Ca 30–45 min totalt.

---

## Steg 1: Registrera domänen (10 min)

1. Gå till **[loopia.se](https://www.loopia.se)**
2. Sök på `leveranzfrankranz.se` → köp domänen (~130 kr/år)
3. Välj bara domänen — ingen hosting från Loopia

---

## Steg 2: Sätt upp Google Sheets + Apps Script (15 min)

### 2a. Skapa ett Google-kalkylark
1. Gå till [sheets.google.com](https://sheets.google.com)
2. Skapa nytt tomt kalkylark — namnge det "Leveranz från Kranz — Ordrar"

### 2b. Lägg in Apps Script-koden
1. I kalkylarket: klicka **Tillägg → Apps Script**
2. Radera allt i editorn
3. Klistra in hela innehållet från filen `google-apps-script.js`
4. Byt ut e-postadressen på rad 10 mot din egna
5. Spara (Ctrl+S)

### 2c. Driftsätt som Web App
1. Klicka **Driftsätt → Ny driftsättning**
2. Typ: **Webb-app**
3. Inställningar:
   - Kör som: **Jag**
   - Vem har åtkomst: **Vem som helst**
4. Klicka **Driftsätt** → godkänn behörigheter
5. **Kopiera Webb-appens URL** — ser ut som:
   `https://script.google.com/macros/s/XXXXXXXX/exec`

### 2d. Testa att det fungerar
1. Välj `testOrder` i funktionsrullistan i Apps Script, klicka ▶
2. Kolla kalkylarket — en testrad ska dyka upp
3. Kolla din e-post — du ska ha fått en orderavisering

---

## Steg 3: Uppdatera index.html (2 min)

Öppna `index.html` i en textredigerare och hitta dessa rader (~rad 300):

```js
const SWISH_NUMBER = '123 XXX XX XX';                    // ← Ert Swish-nummer
const SCRIPT_URL   = 'KLISTRA_IN_APPS_SCRIPT_URL_HÄR';  // ← Google Apps Script URL
```

Byt ut:
- `123 XXX XX XX` → ert faktiska Swish-nummer (t.ex. `079 322 61 26`)
- `KLISTRA_IN_APPS_SCRIPT_URL_HÄR` → URL:en från steg 2c

Spara filen.

---

## Steg 4: Publicera på Railway (10 min)

Du behöver tre filer i samma mapp:
- `index.html`
- `package.json`
- `google-apps-script.js` (behövs inte på Railway, men bra att ha kvar)

### 4a. Lägg filerna i ett GitHub-repo
1. Gå till [github.com](https://github.com) → **New repository**
2. Namnge det `leveranz-fran-kranz`, välj **Private**
3. Ladda upp `index.html` och `package.json` (dra och släpp eller "Add file")

### 4b. Driftsätt på Railway
1. Gå till [railway.app](https://railway.app) → logga in
2. Klicka **New Project → Deploy from GitHub repo**
3. Välj ditt repo `leveranz-fran-kranz`
4. Railway detekterar `package.json` automatiskt och startar bygget
5. Vänta ~1 minut — sidan är live på en temporär `.up.railway.app`-adress
6. Klicka på den för att testa att beställningssidan fungerar

### 4c. Koppla din domän
1. I Railway-projektet: gå till fliken **Settings**
2. Scrolla till **Domains** → klicka **Add Custom Domain**
3. Skriv in `leveranzfrankranz.se` → klicka **Add**
4. Railway visar en CNAME-post att peka mot, t.ex.:
   `CNAME  @  XXXXXXXX.up.railway.app`
5. Logga in på **[loopia.se](https://www.loopia.se)**:
   - Mina tjänster → Domäner → `leveranzfrankranz.se` → DNS-hantering
   - Lägg till en **CNAME-post** med det Railway angett
   - Ta ev. bort gamla A-poster som pekar på Loopias servrar
6. Vänta 15 min–2 timmar tills DNS propagerat
7. Railway visar grön bock när certifikatet är klart (HTTPS sätts upp automatiskt)

---

## Steg 5: Sluttest (5 min)

1. Öppna `leveranzfrankranz.se` i en webbläsare
2. Gör en testbeställning hela vägen igenom
3. Kolla att ordern dyker upp i Google Sheets
4. Kolla att du fått e-postavisering
5. Klart! 🎉

---

## Sammanfattning

| Vad | Kostnad | Tid |
|-----|---------|-----|
| Domän (Loopia) | ~130 kr/år | 10 min |
| Railway (Hobby-plan) | ~50 kr/mån | 10 min |
| Google Sheets + Apps Script | Gratis | 15 min |

> **Tips:** Railway Hobby-plan kostar pengar. Om du vill spara kostar
> Netlify 0 kr för ett statiskt projekt som det här — men Railway fungerar
> utmärkt om du ändå har det igång.

---

## Filöversikt

| Fil | Syfte |
|-----|-------|
| `index.html` | Hela beställningssidan |
| `package.json` | Talar om för Railway hur den ska köras |
| `google-apps-script.js` | Backend-kod att klistra in i Google Sheets |
