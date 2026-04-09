# MSP Console Dashboard

A browser-based operations console for reviewing and comparing organisations, device counts, license counts, invoice totals, and cross-platform naming consistency across multiple MSP tooling sources.

## Overview

This project provides a single HTML dashboard for comparing organisation and billing data across platforms. It is designed as a lightweight admin console with a clean UI and no frontend framework dependency.

The console includes:
- organisation discovery across platforms
- automatic and manual organisation matching
- count and license comparison views
- outstanding balance lookup
- rename and sync workflow for standardising organisation names

## Features

### Organisations
- fetches organisation/customer lists from multiple systems
- supports filtered and full customer views
- includes search for fast lookup

### Match Organisations
- automatic best-match logic
- manual correction and override support
- saved match loading and persistence

### Counts and Licenses
- Syncro line and schedule total comparison
- Pax8 license parsing
- Ninja device categorisation
- outstanding invoice review
- audit tagging
- sortable and expandable detail views

### Rename and Sync
- choose a canonical organisation name
- push naming updates to connected platforms

## Current Architecture

This repository contains the frontend console only.

The current console calls a backend engine running separately, and the frontend is configured to use a local endpoint:

`http://localhost:5017`

Because of that, Netlify can host the UI, but the backend must still be available to the browser for live functionality.

## Tech Used

- HTML
- CSS
- Vanilla JavaScript
- Netlify for static hosting
- GitHub for source control

## Local Development

1. Place the frontend files in a project folder.
2. Rename `console.html` to `index.html`.
3. Run the backend engine locally.
4. Open the frontend in a browser.

## Netlify Deployment

This repository can be deployed to Netlify as a static site.

### Important
The current hosted frontend will still attempt to connect to the configured backend endpoint. If the backend remains local-only, the deployed site will not work for external users without backend changes.

## Suggested Future Improvements

- move backend secrets to a local secret file or server-side environment variables
- replace localhost backend calls with a secure hosted API endpoint
- add authentication before exposing live admin functions
- split frontend and backend into separate deployment units
- add logging and error tracing
- add export and reporting functions

## Portfolio Value

This project demonstrates:
- practical admin dashboard design
- cross-platform data normalisation
- real-world IT operations workflow thinking
- JavaScript UI work without framework overhead
- deployment readiness through GitHub and Netlify
