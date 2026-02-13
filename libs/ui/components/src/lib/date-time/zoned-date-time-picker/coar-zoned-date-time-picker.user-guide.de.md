# Zoned Date Time Picker - Benutzerhandbuch

Der Zoned Date Time Picker ermöglicht die Auswahl von Datum und Uhrzeit unter Berücksichtigung des **Ortes**, an dem das Ereignis stattfindet. Dies ist besonders nützlich für die Planung von Meetings oder Veranstaltungen über verschiedene Zeitzonen hinweg.

---

## Das Eingabefeld

Im geschlossenen Zustand zeigt der Picker ein kompaktes Eingabefeld:

```
┌─────────────────────────────────────────────────────┐
│  ✕  │  01.07.2026 9:00  │  Wien (UTC+1)  │ 🏠 │ 📅 │
└─────────────────────────────────────────────────────┘
```

| Element | Beschreibung |
|---------|--------------|
| **✕ (Löschen)** | Entfernt das ausgewählte Datum und die Uhrzeit |
| **Datum & Uhrzeit** | Das aktuell ausgewählte Datum und die Uhrzeit |
| **Zeitzonen-Label** | Zeigt an, in welcher Zeitzone die angezeigte Zeit ist (z.B. "Wien (UTC+1)") |
| **Zeitzonen-Icon** | Zeigt an, ob Sie die Zeit in Ihrer lokalen Zeit oder der Zeit des Veranstaltungsortes sehen |
| **📅 Kalender** | Öffnet das vollständige Auswahl-Panel |

---

## Zeitzonen-Icons erklärt

Das Zeitzonen-Icon zeigt Ihnen auf einen Blick, in welcher Zeitzone die angezeigte Zeit ist:

| Icon | Name | Bedeutung |
|------|------|-----------|
| 🏠 | **Zuhause** | Zeit wird in **Ihrer Zeitzone** angezeigt (Ihre lokale Zeit) |
| 📍 | **Standort** | Zeit wird in der **Zeitzone des Ereignisses** angezeigt (wo das Ereignis stattfindet) |
| 🌍 | **Welt** | Zeit wird in einer **anderen Zeitzone** angezeigt (weder Ihre noch die des Ereignisses) |

### Klick auf das Zeitzonen-Icon

Wenn Sie auf das Zeitzonen-Icon klicken, wechselt es zwischen:
- **Ihrer Zeitzone** (Zuhause 🏠)
- **Der Zeitzone des Ereignisses** (Standort 📍)

So können Sie schnell sehen "Welche Zeit ist das für mich?" vs. "Welche Zeit ist das am Veranstaltungsort?"

### Ausgegrautes Zuhause-Icon

Wenn das Zuhause-Icon **ausgeblaßt** (halbtransparent) erscheint, bedeutet das:
- Das Ereignis ist in Ihrer Zeitzone
- Es gibt nichts zum Umschalten — Ihre Zeit und die Zeit des Ereignisses sind identisch

---

## Das Auswahl-Panel

Klicken Sie auf das Kalender-Icon, um das vollständige Auswahl-Panel zu öffnen:

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────┐  ┌───────────────────────────────┐ │
│  │                     │  │  < 2025 >                     │ │
│  │   Scrollbarer       │  │  Jan Feb Mär Apr              │ │
│  │   Kalender          │  │  Mai Jun Jul Aug              │ │
│  │                     │  │  Sep Okt Nov Dez              │ │
│  │                     │  ├───────────────────────────────┤ │
│  │                     │  │      ▲ 11 : 30 ▲ AM           │ │
│  │                     │  │      ▼      ▼    ▼            │ │
│  │                     │  ├───────────────────────────────┤ │
│  │                     │  │  Anzeige-Zeitzone             │ │
│  │                     │  │  [Wien (UTC+1)          ▼]    │ │
│  └─────────────────────┘  └───────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  📍 Accra (UTC+0)                    15.06.2025 14:30    ⚙️ │
└─────────────────────────────────────────────────────────────┘
```

### Linke Seite: Kalender

- **Scrollen** Sie nach oben oder unten, um durch die Monate zu navigieren
- **Klicken** Sie auf ein Datum, um es auszuwählen
- Ein kleiner **Pfeil-Button** erscheint, um zum aktuellen Monat zurückzuspringen, wenn Sie weit gescrollt haben

### Rechte Seite: Steuerelemente

| Bereich | Funktion |
|---------|----------|
| **Jahres-Stepper** | Verwenden Sie `<` und `>` um das Jahr zu ändern |
| **Monats-Raster** | Klicken Sie auf einen Monat, um direkt dorthin zu springen |
| **Zeit-Picker** | Stunden und Minuten anpassen (Pfeile verwenden oder direkt eingeben) |
| **Anzeige-Zeitzone** | Ändern Sie, in welcher Zeitzone Sie die Zeit **sehen** möchten |

### Fußzeile: Ereignis-Standort

Die Fußzeile zeigt die **tatsächliche Zeitzone, in der das Ereignis gespeichert ist**:

```
📍 Accra (UTC+0)                    15.06.2025 14:30  ⚙️
```

| Element | Beschreibung |
|---------|--------------|
| **📍 Standort-Icon** | Zeigt an, dass dies die "Heimat"-Zeitzone des Ereignisses ist |
| **Zeitzonen-Name** | Wo das Ereignis stattfindet (z.B. "Accra (UTC+0)") |
| **Datum/Uhrzeit** | Die Ereigniszeit in der Standort-Zeitzone |
| **⚙️ Einstellungen** | Klicken, um die Standort-Zeitzone des Ereignisses zu ändern |

---

## Die zwei Zeitzonen verstehen

Dieser Picker handhabt zwei wichtige Konzepte:

### 1. Ereignis-Standort-Zeitzone (📍)
**Wo das Ereignis physisch stattfindet.**

Beispiel: Eine Konferenz in New York beginnt um 9:00 Uhr. Die Standort-Zeitzone ist "America/New_York". Egal wo Sie sich auf der Welt befinden, die Konferenz beginnt um 9:00 Uhr New Yorker Zeit.

### 2. Anzeige-Zeitzone (🏠 oder 🌍)
**Wie Sie die Zeit sehen möchten.**

Beispiel: Sie sind in Wien und möchten an der New Yorker Konferenz teilnehmen. Sie können die Zeit anzeigen als:
- 9:00 Uhr (New Yorker Zeit — Standort 📍)
- 15:00 Uhr (Wiener Zeit — Zuhause 🏠)

Beide sind korrekt — sie repräsentieren denselben Moment, nur unterschiedlich dargestellt.

---

## Häufige Aufgaben

### Datum und Uhrzeit auswählen

1. Klicken Sie auf das **Kalender-Icon**, um den Picker zu öffnen
2. **Scrollen** Sie oder verwenden Sie das Monats-Raster, um Ihr Datum zu finden
3. **Klicken** Sie auf das Datum, um es auszuwählen
4. Passen Sie die **Uhrzeit** mit dem Zeit-Picker an
5. Klicken Sie außerhalb des Panels, um es zu schließen

### Standort des Ereignisses ändern

1. Öffnen Sie das Picker-Panel
2. Klicken Sie auf das **⚙️ Einstellungen-Icon** in der Fußzeile
3. Suchen und wählen Sie die neue Zeitzone
4. Das Ereignis ist jetzt im neuen Standort gespeichert

### In einer anderen Zeitzone anzeigen

**Schnelles Umschalten:** Klicken Sie auf das Zeitzonen-Icon (🏠/📍) im Eingabefeld, um zwischen Ihrer Zeit und der Ereigniszeit zu wechseln.

**Beliebige Zeitzone:** Öffnen Sie das Panel und verwenden Sie das "Anzeige-Zeitzone" Dropdown, um eine beliebige Zeitzone der Welt auszuwählen.

### Auswahl löschen

Klicken Sie auf den **✕** Button auf der linken Seite des Eingabefeldes, um Datum und Uhrzeit zu entfernen.

---

## Tipps

- **Bewegen** Sie die Maus über das Zeitzonen-Icon für einen Tooltip, der beide Zeitzonen zeigt
- Das **Zeitzonen-Label** im Eingabefeld zeigt immer an, welche Zeitzone aktuell angezeigt wird
- Bei der Terminplanung mit Personen in anderen Zeitzonen nutzen Sie die **Anzeige-Zeitzone** Funktion, um zu sehen, welche Zeit es für sie ist
- Das **ausgegraute Zuhause-Icon** bedeutet, dass das Ereignis lokal für Sie ist — keine Zeitzonen-Verwirrung!

---

## Beispiel: Ein internationales Meeting planen

**Szenario:** Sie sind in Wien und müssen einen Anruf mit einem Kollegen in Tokio planen.

1. Öffnen Sie den Picker und wählen Sie das Datum
2. Die Zeit wird standardmäßig in Ihrer Zeitzone (Wien) angezeigt
3. Stellen Sie die Zeit ein, wenn Sie verfügbar sind (z.B. 16:00 Uhr Wien)
4. Klicken Sie auf das **Anzeige-Zeitzone** Dropdown und wählen Sie "Asia/Tokyo"
5. Sie sehen, dass es 00:00 Uhr (Mitternacht) in Tokio ist — wahrscheinlich nicht ideal!
6. Passen Sie die Zeit an, bis sie für beide Parteien passt
7. Das Ereignis wird mit Ihrer lokalen Zeit gespeichert, aber Sie haben überprüft, dass es über Zeitzonen hinweg funktioniert
