# Last Little Haven

Last Little Haven ist eine webbasierte Plattform zur Dokumentation, Archivierung und Visualisierung von verlassenen oder bedrohten Orten.  
Nutzer:innen können Archiveinträge durchsuchen, Details zu Orten einsehen, Einträge über eine Karte erkunden und eigene Inhalte einreichen.  
Ein Moderationssystem stellt die Qualität und Angemessenheit der Inhalte sicher.

Das Projekt wird im Rahmen eines Studienprojekts entwickelt.

---

## Projektüberblick


**Hauptfunktionen**
- Archiv durchsuchen und filtern
- Detailansicht einzelner Archiveinträge
- Kartenbasierte Darstellung von Orten
- Einreichen neuer Archiveinträge
- Benutzerkonten und Login
- Moderation von Einreichungen (Admin-Bereich)

---

## Projektstruktur

```text
last-little-haven/
├─ README.md              # Dieses Dokument
├─ .gitignore
├─ .editorconfig
├─ .env.example
├─ .vscode/               # VS Code Team-Settings
├─ frontend/              # Web-Frontend (UI)
├─ backend/               # Backend / REST API
├─ infra/                 # Infrastruktur (DB, Docker, Storage)
└─ scripts/               # Hilfsskripte (Start, Test, Lint)
