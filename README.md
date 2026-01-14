# Last Little Haven

Last Little Haven ist eine webbasierte Plattform zur Dokumentation, Archivierung und Visualisierung von queer-lesbischen Bars, Orten und Artefakten. Nutzer:innen können Archiveinträge durchsuchen, Details zu Orten einsehen, Einträge über eine Karte erkunden und eigene Inhalte einreichen. Ein Moderationssystem stellt die Qualität und Angemessenheit der Inhalte sicher.

Das Projekt wird im Rahmen eines Studienprojekts entwickelt.

---

## Projektüberblick

**Hauptfunktionen**

* Archiv durchsuchen und filtern
* Detailansicht einzelner Archiveinträge
* Kartenbasierte Darstellung von Orten
* Einreichen neuer Archiveinträge
* Benutzerkonten und Login
* Moderation von Einreichungen (Admin-Bereich)

---

## Projektstruktur

```
last-little-haven/
├─ README.md              # Dieses Dokument
├─ .gitignore
├─ .editorconfig
├─ .env.example
├─ .vscode/               # VS Code Team-Settings
├─ docs/                  # Fachspezifikation, Dummy-Daten
│  └─ dummy-data.json
├─ backend/               # (geplant) Backend / REST API (Node.js + Express)
│  ├─ src/
│  │  └─ server.js
│  └─ package.json
├─ frontend/              # Web-Frontend (React + React Router + Supabase)
│  ├─ public/
│  └─ src/
│     ├─ index.js
│     ├─ App.js
│     ├─ lib/
│     │  └─ supabase.js   # Supabase-Client
│     ├─ pages/
│     │  ├─ HomePage.js
│     │  ├─ ArchivePage.js
│     │  ├─ MapPage.js
│     │  ├─ SubmitPage.js
│     │  ├─ LoginPage.js
│     │  └─ AdminPage.js
│     └─ styles/
│        ├─ main.css
│        ├─ base/
│        ├─ layout/
│        └─ pages/
├─ infra/                 # Infrastruktur (DB, Docker, Storage)
│  └─ docker-compose.yml
└─ scripts/               # Hilfsskripte (Start, Test, Lint)
```

---

## Voraussetzungen

* Node.js (aktuelle LTS-Version)
* npm
* Supabase-Account (kostenlos) für die gehostete PostgreSQL-Datenbank

---

## Datenbank – Supabase (PostgreSQL)

Die aktuelle Implementierung verwendet Supabase als gehostete PostgreSQL-Datenbank anstelle einer lokalen DB.

### Setup

Im Ordner `frontend` eine Datei `.env.local` anlegen:

```
REACT_APP_SUPABASE_URL=SUPABASE_URL
REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY=PUBLISHABLE_KEY
```

Diese Datei wird per `.gitignore` nicht ins Repository eingecheckt.

4. Der Supabase-Client liegt in `frontend/src/lib/supabase.js` und liest diese Umgebungsvariablen ein.

---

## Frontend – React (Create React App + React Router + Supabase)

### Installation

```
cd frontend
npm install
```

* Das Frontend wurde mit Create React App erzeugt und um eigene Seiten, einen `styles`-Ordner, React Router und eine Supabase-Anbindung erweitert.

### Einstieg

* `src/index.js` bindet `./styles/main.css` ein, wrappen `App` in einen `BrowserRouter` und rendert `<App />` in `#root`.
* `src/App.js` enthält das Grundlayout (Header „Last Little Haven“, Navigation) und definiert die Routen:

  * `/` → `HomePage`
  * `/archive` → `ArchivePage`
  * `/map` → `MapPage`
  * `/submit` → `SubmitPage`
  * `/login` → `LoginPage`
  * `/admin` → `AdminPage`
* `src/pages/ArchivePage.js` lädt über den Supabase-Client die Tabelle `archive_entries` und zeigt derzeit Titel und Typ der Einträge an.

### Entwicklung starten

```
cd frontend
npm start
```

* Startet den Dev-Server auf `http://localhost:3000`.

---

## Backend

Der ursprüngliche Plan sieht ein eigenes Node.js/Express-Backend vor (`backend/`), aktuell wird die Datenhaltung aber direkt über Supabase/PostgreSQL umgesetzt.
Später kann das Backend ergänzt werden, z.B. für:

* eigene REST-Endpoints
* serverseitige Moderationslogik
* Authentifizierung jenseits der Supabase-Standardfunktionen


---

## Ausblick

* Vollständige Umsetzung der SRS-MUST-Kriterien: Detailansicht, Filter/Suche, Karte, Submission-Formular und Moderation.
* Nutzung weiterer Supabase-Features (Auth, Storage für Uploads).
* Kartenintegration mit Leaflet/React-Leaflet und kuratierten Spaziergängen.
* Erweiterung dieses README um Test-, Linting- und Deployment-Setup.


___
<br>
<br>

# Functional Requirements (MoSCoW)
### MUST (M)

* **M-1: Anzeige von statischen Informationsseiten (About)**  
  Die App muss eine About-Seite anzeigen, auf der Konzept und Hintergrund von LLH vermittelt werden.

* **M-2: Archiv durchsuchen und filtern**  
  Die App muss es Nutzer*innen ermöglichen, Archiveinträge nach folgenden Kriterien zu filtern: 
  * Volltextsuche über Titel und Beschreibung
  * Ort (z. B. Stadt, Bar/Space)
  * Zeitraum (Entstehungsdatum)
  * Typ (z. B. Foto, Flyer, Einrichtungsgegenstände)

* **M-3: Archiv anzeigen**  
  Die App muss es Nutzer*innen ermöglichen, Details zu einem Archiveintrag anzuzeigen.
  Detailansicht pro Archiveintrag (Pflichtfelder):
  * Titel
  * Beschreibungstext
  * Typ (Space, Artefakt, Fotografie) 
  * Urheber*in 
  * Entstehungsdatum
  * Ort (falls vorhanden)
  * Bild/Datei (falls vorhanden)

  Optionale Felder:
  * Keywords
  * Externe Quellen/Links

* **M-4: Einreichen von Archiveinträgen über Submission form (User)**  
  Die App muss es Nutzer*innen über ein Submission-Formular ermöglichen, Archiveinträge ohne Login zu erstellen und einzureichen. Nach Abgabe ist der Eintrag nicht mehr einsehbar/bearbeitbar und wartet auf Admin-Freigabe/Ablehnung.

* **M-5: Überprüfen von Archiveinträgen (Admin)**  
  Die App muss eingereichte Archiveinträge zunächst in einem Moderationsstatus speichern und Admins ermöglichen, diese zu prüfen, zu bearbeiten, freizugeben oder abzulehnen, bevor sie im öffentlichen Archiv angezeigt werden.

* **M-6: Kartenansicht für Archiveinträge mit Ortsbezug**  
  Die App muss es Nutzer*innen ermöglichen, Archiveinträge mit Ortsbezug (z. B. Entstehungsort, zugehörige Bar), auf einer Karte anzeigen zu können. 

* **M-7: Nutzung ohne Benutzer*innenkonto**  
  Die App muss es Nutzer*innen ermöglichen, ohne Benutzerkonto auf About, Archiv und Karte zugreifen zu können. 

***

### SHOULD (S)
* **S-1: Nutzer*innenkonten und Authentifizierung**  
  Die App sollte es Nutzer*innen ermöglichen, ein Konto zu erstellen, sich anzumelden und abzumelden.

* **S-2: Verknüpfung von Artefakten mit Bars/Spaces**  
  Die App sollte es ermöglichen, Artefakte direkt mit einem oder mehreren Orten zu verknüpfen (z. B. „dieser Flyer stammt aus Bar X“), sodass diese Verknüpfung in Archivansicht und Karte sichtbar wird. 

* **S-3: Bearbeiten eigener Beiträge (User)**  
  Die App sollte es registrierten Nutzer*innen ermöglichen, ihre eigenen Artefakt- und Bar-/Space-Beiträge nachträglich zu bearbeiten (mit erneuter Moderation, falls bereits veröffentlicht).

***

### COULD (C)

* **C-1: Passwort zurücksetzen / Wiederherstellung**  
  Die App könnte registrierten Nutzer*innen ermöglichen, ihr Passwort über eine „Passwort vergessen?“-Funktion zurückzusetzen. 

* **C-2: Favoriten- oder Merklisten-Funktion**  
  Die App könnte registrierten Nutzer*innen ermöglichen, Artefakte und Orte als Favoriten zu speichern, um sie später schnell wiederzufinden.

* **C-3: Export-/Sharing-Funktion für Events und Archivansichten**  
  Die App könnte Exportfunktionen (z. B. PDF/Link-Sharing für bestimmte Archivfilter) anbieten.

* **C-4: Digitale kuratierte Spaziergänge**  
  Die App könnte kuratierte Spaziergänge anbieten, bei denen Nutzer*innen sich digital durch eine Sequenz von Orten und Artefakten klicken können (z. B. „Historische Bars Wien“ mit automatischer Navigation Archiv → Karte → Detailansicht).

*** 

### WON’T (W)

* **W-1: In-App-Chat oder Foren**  
  Die App wird keine Direktnachrichten, Gruppenchat oder Foren für Nutzer*innen bereitstellen.

* **W-2: Offene Kommentarfunktion zu Archiveinträgen**  
  Die App wird keine öffentliche Kommentarfunktion (z. B. Diskussions-Threads) zu Artefakten oder Spaces anbieten, um Moderationsaufwand und Missbrauchsrisiken zu begrenzen.

* **W-3: Social-Media-Integration**  
  Die App wird keine direkte Integration mit externen Social-Media-Plattformen (z. B. automatisches Posten auf Instagram, Facebook, TikTok) bieten.

* **W-4: Ticket- oder Platzreservierung**  
  Die App wird keine Buchungsfunktionen (z. B. Event-Tickets, Tischreservierungen) abwickeln.

* **W-5: Tracking individueller Bewegungsdaten**  
  Die App wird keine detaillierte Routenaufzeichnung oder Bewegungsstatistiken der Nutzer*innen sammeln oder visualisieren.


