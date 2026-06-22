# Publiceringsguide — leveranzfrankranz.se

Tre steg: domän → hosting → Google Sheets. Ca 30–60 min totalt.

---

## Steg 1: Registrera domänen (10 min)

1. Gå till **[loopia.se](https://www.loopia.se)** (eller one.com)
2. Sök på `leveranzfrankranz.se` → köp domänen (~100–150 kr/år)
3. Välj bara domänen — ingen hosting behövs

---

## Steg 2: Sätt upp Google Sheets + Apps Script (15 min)

### 2a. Skapa ett Google-kalkylark
1. Gå till [sheets.google.com](https://sheets.google.com)
2. Skapa ett nytt tomt kalkylark
3. Namnge det t.ex. "Leveranz från Kranz — Ordrar"

### 2b. Lägg in Apps Script
1. I kalkylarket: klicka **Tillägg → Apps Script**
2. Radera allt som finns i editorn
3. Klistra in hela innehållet från filen `google-apps-script.js`
4. Byt ut e-postadressen på rad 10 mot din egna
5. Klicka 💾 Spara (Ctrl+S)

### 2c. Driftsätt som Web App
1. Klicka **Driftsätt → Ny driftsättning**
2. Välj typ: **Webb-app**
3. Inställningar:
   - Beskrivning: "Leveranz från Kranz"
   - Kör som: **Jag (din@gmail.com)**
   - Vem har åtkomst: **Vem som helst**
4. Klicka **Driftsätt**
5. Godkänn behörigheter (Google ber om tillstånd — välj ditt konto)
6. **Kopiera Webb-appens URL** — den ser ut som:
   `https://script.google.com/macros/s/XXXXXXXX/exec`

### 2d. Testa
1. Kör testfunktionen i Apps Script: välj `testOrder` i rullistan och klicka ▶
2. Kolla kalkylarket — det ska dyka upp en testrad
3. Kolla din e-post — du ska ha fått en aviseringsmail

---

## Steg 3: Uppdatera index.html (5 min)

Öppna `index.html` i en textredigerare och hitta dessa två rader (ca rad 300):

```js
const SWISH_NUMBER = '123 XXX XX XX';                    // ← Ert Swish-nummer
const SCRIPT_URL   = 'KLISTRA_IN_APPS_SCRIPT_URL_HÄR';  // ← Google Apps Script URL
```

Byt ut:
- `123 XXX XX XX` mot ert faktiska Swish-nummer (t.ex. `079 322 61 26`)
- `KLISTRA_IN_APPS_SCRIPT_URL_HÄR` mot URL:en du kopierade i steg 2c

---

## Steg 4: Publicera på Netlify (10 min)

1. Gå till **[netlify.com](https://www.netlify.com)** → Skapa gratis konto
2. Klicka **Add new site → Deploy manually**
3. Dra och släpp **mappen** med `index.html` till Netlify
4. Sidan publiceras direkt på en temporär adress (t.ex. `random-name.netlify.app`)

### 4a. Koppla din domän
1. I Netlify: gå till **Site settings → Domain management**
2. Klicka **Add custom domain** → skriv in `leveranzfrankranz.se`
3. Netlify visar nameservers att peka mot (t.ex. `dns1.p01.nsone.net`)
4. Logga in på Loopia → Mina tjänster → Domäner → leveranzfrankranz.se → Nameservers
5. Byt ut Loopias nameservers mot Netlifys
6. Vänta 1–24h tills DNS propagerat — sedan är sidan live!

---

## Sammanfattning

| Vad | Kostnad | Tid |
|-----|---------|-----|
| Domän (Loopia) | ~130 kr/år | 10 min |
| Netlify hosting | Gratis | 10 min |
| Google Sheets + Apps Script | Gratis | 15 min |

**Total kostnad: ~130 kr för hela sommaren.**

---

## Filöversikt

| Fil | Syfte |
|-----|-------|
| `index.html` | Hela beställningssidan (en fil) |
| `google-apps-script.js` | Backend-kod för Google Sheets |
| `PUBLICERING.md` | Den här guiden |

