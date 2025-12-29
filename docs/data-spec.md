# Daten-Spezifikation (Data Specification)

**Version:** 1.0  
**Datum:** 2025-12-18  
**Autorin:** [Dein Name], Lead Developer  
**Zweck:** Definition der Datenstruktur für Archiveinträge basierend auf HLD-Klassendiagramm und Dummy-Daten. Grundlage für DB-Schema, API-Modelle und Kundin-Datenlieferung.[file:2]

## Übersicht
Die Spezifikation beschreibt die Kernentität **ArchiveEntry** mit zugehörigen Sub-Entitäten (**Location**, **MediaFile**). Pflichtfelder sind mit `*` markiert. Daten basieren auf 8 realistischen Dummy-Einträgen (3 SPACE, 2 ARTEFACT, 3 PHOTOGRAPHY).[file:2]

## Entitäten und Attribute

### ArchiveEntry (Haupttabelle)

| Attribut | Typ | Pflicht | Beschreibung | Validierung | Beispiel (Dummy-ID: 001) |
|----------|-----|---------|--------------|-------------|--------------------------|
| `id` | UUID/String | * | Eindeutige ID (systemseitig generiert) | Format: UUID v4 | `"123e4567-e89b-12d3-a456-426614174001"` |
| `entryKey` | String | * | Temporärer Referenzschlüssel (Excel/Import) | Format: Präfix + Nr | `"ENTRY-00001"` |
| `title` | String | * | Titel des Eintrags | max. 200 Zeichen, min. 5 | `"Cafe Anna"` |
| `description` | String | * | Detaillierte Beschreibung | max. 2000 Zeichen | `"Historische queer-lesbische Bar..."` |
| `type` | Enum: `SPACE`, `ARTEFACT`, `PHOTOGRAPHY`, `OTHER` | * | Eintrags-Typ | - | `"SPACE"` |
| `authorName` | String | | Urheberin/-name | max. 100 Zeichen | `"Anna Berthold"` |
| `originDate` | String | | Artefakt-/Fotografie-Entstehungsdatum | max. 50 Zeichen | `"January 2023 – February 2024"` |
| `creationDate` | Date (ISO) | * | Eintrag-Erstellungsdatum | YYYY-MM-DD | `"2025-12-18"` |
| `createdBy` | userId | | Ersteller:in des Eintrags (systemseitig aus Login gesetzt) | User | `"aa-bb-ee"` |
| `externalLinks` | Array<String> | | Externe Links | max. 5, gültige URLs | `["https://example.com/cafe-anna"]` |
| `keywords` | Array<String> | | Suchbegriffe | max. 20, max. 50 Zeichen pro | `["Wien", "Bar", "queer"]` |
| `status` | Enum: `DRAFT`, `SUBMITTED`, `APPROVED`, `DECLINED` | * | Moderationsstatus (systemseitig generiert) | - | `"APPROVED"` |
| `location` | Location Object | | Optional (für SPACE/PHOTOGRAPHY) | 1:1 Beziehung | siehe Tabelle unten |
| `mediaFiles` | Array<MediaFile> | | Zugehörige Medien | max. 10 Dateien, 1:n Beziehung | siehe Tabelle unten |

### Location (Separate Tabelle/FK)

| Attribut | Typ | Pflicht | Beschreibung | Validierung | Beispiel |
|----------|-----|---------|--------------|-------------|----------|
| `name` | String | * | Ortsname | max. 100 Zeichen | `"Cafe Anna"` |
| `city` | String | * | Stadt | max. 50 Zeichen | `"Wien"` |
| `address` | String | | Adresse | max. 200 Zeichen | `"Mariahilfer Straße 42"` |
| `latitude` | Double | * | Breitengrad | -90 bis 90 | `48.1986` |
| `longitude` | Double | * | Längengrad | -180 bis 180 | `16.3715` |
| `entryKey` | String | * | Referenz auf ArchiveEntry |

### MediaFile (Separate Tabelle/FK)

| Attribut | Typ | Pflicht | Beschreibung | Validierung | Beispiel |
|----------|-----|---------|--------------|-------------|----------|
| `fileName` | String | * | Original-Dateiname (lokal) | `"last-little-haven-opening_2025.jpg"` |
| `fileUrl` | String | | Relativer Pfad, danach systemseitig generierter Speicherpfad | max. 255 Zeichen | `"dummy/space_cafe_anna.jpg"` |
| `fileType` | Enum: `JPG`, `PNG`, `PDF` | * | Dateityp | - | `"JPG"` |
| `fileSizeMB` | Double | | Dateigröße | max. 10.0 MB | `2.1` |
| `credits` | String | | Fotografin/Urheber | max. 100 Zeichen | `"Unsplash CC0"` |
| `entryKey` | String | * | Referenz auf ArchiveEntry |

### Author (Separate Tabelle/FK)

| Attribut | Typ | Pflicht | Beschreibung | Validierung | Beispiel |
|----------|-----|---------|--------------|-------------|----------|
| `id` | UUID / String | * | Eindeutige Autor*innen-ID  | UUID v4 | `"a3b2...9001"` |
| `authorName` | String | * | Anzeigename der Urheber*in | min. 2, max. 100 Zeichen | `"Teresa Fischer"` |
| `bio` | String | | Kurzbiografie | max. 2000 Zeichen | `"Fotografin und Medienforscherin"` |
| `birthDate` | Date / String ISO | | Geburtsdatum | Format: YYYY-MM-DD | `"1990-05-12"` |
| `deathDate` | Date / String ISO | | Sterbedatum | ≥ `birthDate` | `"2012-03-01"` |

## Validierungsregeln
- **Title**: Min. 5, max. 200 Zeichen, keine HTML-Tags
- **Description**: Max. 2000 Zeichen, einfache Markdown erlaubt
- **Date**: ISO-Format, nicht zukünftig (> heute)
- **Geo-Koordinaten**: Plausibel für Wien (47.5-48.5° N, 16.0-17.0° E)
- **Medien**: Max. 10 GB gesamt pro Eintrag, nur JPG/PNG/PDF
- **Keywords**: Unique innerhalb Eintrag, lowercase normalization

## Beziehungen (DB-Schema)

### ArchiveEntry ↔ Location
- **Beziehung:** `1 : 0..1`
- **Beschreibung:**  
  Ein `ArchiveEntry` kann optional genau **eine Location** besitzen  
  (z. B. bei `SPACE` oder `PHOTOGRAPHY`).  
  Eine `Location` gehört **immer genau zu einem** `ArchiveEntry`.
- **Technische Umsetzung:**  
  `Location.entryKey` → referenziert `ArchiveEntry.entryKey`


### ArchiveEntry ↔ MediaFile
- **Beziehung:** `1 : 0..*`
- **Beschreibung:**  
  Ein `ArchiveEntry` kann **keine, eine oder mehrere Mediendateien** besitzen.  
  Jede `MediaFile` gehört **genau zu einem** `ArchiveEntry`.
- **Technische Umsetzung:**  
  `MediaFile.entryKey` → referenziert `ArchiveEntry.entryKey`


### ArchiveEntry ↔ Author
- **Beziehung:** `0..1 (logisch)`
- **Beschreibung:**  
  Ein `ArchiveEntry` kann optional eine Urheber*in (`authorName`) besitzen.  
  Die Zuordnung erfolgt **zunächst als Freitext** und kann später  
  systemseitig einer `Author`-Entität zugeordnet werden.
- **Technische Umsetzung:**  
  Kein Foreign Key in der Kundinnen-Datenlieferung;  
  Mapping erfolgt redaktionell bzw. systemseitig.


### Author (eigenständige Entität)
- **Beziehung:** `1 : 0..*`
- **Beschreibung:**  
  Eine `Author`-Entität kann mit **mehreren ArchiveEntries** verbunden sein.  
  Die Beziehung ist **nicht direkt referenziell** in der Excel-Datenlieferung  
  abgebildet.


### Systeminterne Beziehungen  
*(nicht Teil der Kundinnen-Datenlieferung)*

- `ArchiveEntry.createdBy` → `User.id`
- `ArchiveEntry.status` → Moderationsworkflow
- `MediaFile.fileUrl` → systemseitig generierter Speicherpfad


## Zusätzliche Infos
- Die Felder **id, status und createdBy** werden systemseitig vergeben und sind nicht Teil der Kundinnen-Datenlieferung.
