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
| `id` | UUID/String | * | Eindeutige ID | Format: UUID v4 | `"123e4567-e89b-12d3-a456-426614174001"` |
| `title` | String | * | Titel des Eintrags | max. 200 Zeichen, min. 5 | `"Cafe Anna"` |
| `description` | String | * | Detaillierte Beschreibung | max. 2000 Zeichen | `"Historische queer-lesbische Bar..."` |
| `type` | Enum: `SPACE`, `ARTEFACT`, `PHOTOGRAPHY`, `OTHER` | * | Eintrags-Typ | - | `"SPACE"` |
| `authorName` | String | | Urheberin/-name | max. 100 Zeichen | `"Anna Berthold"` |
| `creationDate` | Date/String (ISO) | * | Erstellungs-/Ereignis-Datum | YYYY-MM-DD | `"2025-12-18"` |
| `externalLinks` | Array<String> | | Externe Links | max. 5, gültige URLs | `["https://example.com/cafe-anna"]` |
| `keywords` | Array<String> | | Suchbegriffe | max. 20, max. 50 Zeichen pro | `["Wien", "Bar", "queer"]` |
| `status` | Enum: `DRAFT`, `SUBMITTED`, `APPROVED`, `DECLINED` | * | Moderationsstatus | - | `"APPROVED"` |
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

### MediaFile (Separate Tabelle/FK)

| Attribut | Typ | Pflicht | Beschreibung | Validierung | Beispiel |
|----------|-----|---------|--------------|-------------|----------|
| `imageUrl` | String | * | Relativer Pfad | max. 255 Zeichen | `"dummy/space_cafe_anna.jpg"` |
| `imageFiletype` | Enum: `JPG`, `PNG`, `PDF` | * | Dateityp | - | `"JPG"` |
| `imageSizeMB` | Double | | Dateigröße | max. 10.0 MB | `2.1` |
| `credits` | String | | Fotografin/Urheber | max. 100 Zeichen | `"Unsplash CC0"` |

## Validierungsregeln
- **Title**: Min. 5, max. 200 Zeichen, keine HTML-Tags
- **Description**: Max. 2000 Zeichen, einfache Markdown erlaubt
- **Date**: ISO-Format, nicht zukünftig (> heute)
- **Geo-Koordinaten**: Plausibel für Wien (47.5-48.5° N, 16.0-17.0° E)
- **Medien**: Max. 10 GB gesamt pro Eintrag, nur JPG/PNG/PDF
- **Keywords**: Unique innerhalb Eintrag, lowercase normalization

## Beziehungen (DB-Schema)
