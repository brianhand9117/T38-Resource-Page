# Website Starter

This workspace contains a simple, dependency-free website starter.

## Files

- `index.html` - Main page
- `styles.css` - Page styling
- `script.js` - Basic interactivity
- `planning-aid.html` - T-38 Planning Aid GUI converted to web page
- `planning-aid.css` - Styling for the converted Planning Aid page
- `planning-aid.js` - Interactive pipeline simulation for Planning Aid page
- `data/T38_Apts_09_Feb_2026.kml` - Real airport KML used by the web map

## Planning Aid map behavior

The map inside `planning-aid.html` renders airport markers and popups from the local KML file, matching the generated map data flow from the original project.

For reliable browser loading of local KML (`fetch`), run from a local server instead of opening HTML via `file://`.

## Run locally

### Option 1: Open directly
Open `index.html` in your browser.

### Option 2: Local server (recommended)
If Python is installed:

```powershell
python -m http.server 5500
```

Then open `http://localhost:5500`.
