# Dhilakesh B — Portfolio (frontend only)

Plain HTML, CSS and JavaScript. No build step, no framework, no backend.

## Run it
- Double-click `index.html`, or
- from this folder run `npx serve` (or `python -m http.server`) and open the printed address.

## Files
- `index.html`  all content and structure
- `style.css`   design tokens (top of file), layout, animations, responsive rules
- `script.js`   entrance, scroll reveals, cursor, tilt, magnetic and liquid buttons, menu, form
- `assets/`     portrait cutout, project images, resume (`assets/resume.pdf`), certificates (`assets/certificates/`)

## Common edits
- Text and links: edit `index.html` (search for the project or section name).
- Resume: replace `assets/resume.pdf` (keep the file name).
- Certificates: put the PDF in `assets/certificates/` and link it from the card in the Certifications section.
- Project images: replace the files in `assets/projects/` (keep the names).
- LeetCode numbers: search `19` in `index.html` (stat strip and Coding section).
- Colors: the `:root` block at the top of `style.css`.
- Contact form: opens the visitor's email app (`mailto:`). Nothing is sent to a server.

## Deploy (static site)
- GitHub Pages: push this folder's contents to a repo and enable Pages for the branch root.
- Render: New > Static Site, build command empty, publish directory `.`
