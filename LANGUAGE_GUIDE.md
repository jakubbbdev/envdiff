# Sprachauswahl in EnvDiff

## Wie ändere ich die Sprache?

1. **Sprachauswahl-Button finden**: Oben rechts in der App findest du ein Sprachsymbol (🌐)
2. **Sprache auswählen**: Klicke auf das Symbol und wähle zwischen:
   - 🇺🇸 English (Englisch)
   - 🇩🇪 Deutsch (Deutsch)

## Verfügbare Sprachen

- **Englisch** (Standard): Vollständige englische Übersetzung
- **Deutsch**: Vollständige deutsche Übersetzung

## Sprachdateien

Die Übersetzungen befinden sich in:
- `src/i18n/locales/en.json` - Englische Übersetzungen
- `src/i18n/locales/de.json` - Deutsche Übersetzungen

## Übersetzte Bereiche

✅ **Vollständig übersetzt**:
- App-Titel und Untertitel
- Datei-Upload-Buttons
- Status-Nachrichten
- Diff-Ansicht (Tooltips, Labels)
- Export-Buttons
- Drag&Drop-Texte
- Fehlermeldungen
- Erfolgsmeldungen

## Technische Details

- **Framework**: react-i18next
- **Persistierung**: Sprache bleibt beim Neustart erhalten
- **Fallback**: Bei fehlenden Übersetzungen wird Englisch verwendet 