# Last Little Haven

Last Little Haven ist eine webbasierte Plattform zur Dokumentation, Archivierung und Visualisierung von verlassenen oder bedrohten Orten. Nutzer:innen können Archiveinträge durchsuchen, Details zu Orten einsehen, Einträge über eine Karte erkunden und eigene Inhalte einreichen. Ein Moderationssystem stellt die Qualität und Angemessenheit der Inhalte sicher.

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
├─ backend/               # Backend / REST API (Node.js + Express)
│  ├─ src/
│  │  └─ server.js
│  └─ package.json
├─ frontend/              # Web-Frontend (React + JS)
│  ├─ public/
│  └─ src/
│     ├─ index.js
│     ├─ App.js
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

---

## Backend – Node.js + Express + nodemon

### Installation

```
cd backend
npm install
```

Wichtige Scripts in `backend/package.json`:

```
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js"
}
```

### Entwicklung starten

```
cd backend
npm run dev
```

* Startet den Express-Server auf `http://localhost:4000`.

---

## Frontend – React (Create React App)

### Installation

```
cd frontend
npm install
```

* Das Frontend wurde mit Create React App erzeugt und um eigene Seiten und einen `styles`-Ordner erweitert.

### Einstieg

* `src/index.js` bindet `./styles/main.css` ein und rendert `<App />` in `#root`.
* `src/App.js` enthält das Grundlayout (Header „Last Little Haven“, Navigation, Startbereich).
* Unter `src/pages/` liegen die Seiten:

  * `HomePage`, `ArchivePage`, `MapPage`, `SubmitPage`, `LoginPage`, `AdminPage`.

### Entwicklung starten

```
cd frontend
npm start
```

* Startet den Dev-Server auf `http://localhost:3000`.

---

## Gleichzeitiger Betrieb

In zwei Terminals:

```
# Terminal 1 – Backend
cd backend
npm run dev

# Terminal 2 – Frontend
cd frontend
npm start
```

* Frontend: `http://localhost:3000`
* Backend: `http://localhost:4000`

Später wird das Frontend REST-Requests an das Backend senden (z.B. `GET /api/entries`).

---

## Ausblick

* Implementierung der REST-API (Archiv-Endpunkte, Validierung, Moderation).
* Anbindung der Dummy-Daten und später einer Datenbank.
* Routing im Frontend (React Router) für alle Seiten.
* Kartenintegration mit Leaflet/React-Leaflet und kuratierten Spaziergängen.
* Erweiterung dieses README um Setup für Datenbank, Tests, Linting und Deployment.
