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
