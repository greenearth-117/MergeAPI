# MSP Console Dashboard

A browser-based operations console for comparing organisation data, license counts, device counts, billing details, and cross-platform naming consistency across multiple MSP systems.

## Overview

This project is a lightweight admin console built with plain HTML, CSS, and JavaScript. It provides a single interface for reviewing organisation records, matching companies across systems, checking counts and licenses, reviewing invoice-related values, and pushing standardised naming across connected platforms.

## Main Functions

### Organisation Discovery
- Fetches organisation and customer records from multiple connected systems
- Supports search and filtering
- Separates recurring and full customer views

### Match Organisations
- Auto-match support using name similarity
- Manual override and correction
- Save and reload match mappings

### Counts and Licenses
- Compare organisation counts across systems
- Review Syncro recurring schedule totals
- View Pax8 license totals
- View Ninja device totals
- Expand rows for detailed breakdown
- Mark rows as audited

### Rename and Sync
- Set a canonical organisation name
- Push renamed values to connected systems

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- GitHub
- Netlify

## Current Architecture

This repository contains the frontend console only.

The frontend currently communicates with a backend engine running separately and uses a local endpoint:

`http://localhost:5017`

Because of that, the interface can be hosted on Netlify, but full live functionality depends on the backend engine being available to the browser.

## Portfolio Value

This project demonstrates:
- real-world IT operations workflow design
- admin dashboard UI development
- data matching across platforms
- practical JavaScript without a frontend framework
- preparation for source control and static deployment

## Files Included

- `index.html` — main frontend console
- `netlify.toml` — Netlify configuration
- `README.md` — project documentation

## Files Excluded

The backend engine, local secrets, and working data files are intentionally excluded from the public repository.

## Deployment Notes

This project is suitable for static hosting on Netlify as a frontend interface.

For full production hosting, the local backend endpoint would need to be replaced with a secure hosted API endpoint.

## Future Improvements

- Move backend calls from localhost to a hosted API
- Add authentication before exposing admin actions
- Store configuration more securely
- Add export and reporting features
- Improve logging and error handling
