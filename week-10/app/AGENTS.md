# AGENTS.md — Smart Campus Room Availability Checker

Instructions for any coding agent working in this project. Read this file before you change
anything, and follow it over any general habit of yours.

## Project

A React + TypeScript page (Vite) that tells a student whether a campus room is free for a
requested time. The booking rule lives in `src/booking.ts` (`canBook`); the page is `src/App.tsx`;
the tests are in `src/booking.test.ts`.

Fictional data only: one fictional room per check, made-up bookings, no real room names or timetables.

## Acceptance contract

- AC1 Reject start ≥ end and requests in the past.
- AC2 Enforce the maximum allowed duration (120 minutes).
- AC3 Reject a blocked room.
- AC4 Reject overlaps. Bookings that only touch at an endpoint do NOT overlap and stay Available.
- AC5 Return Available / Unavailable without changing booking data.
- AC6 Clear, responsive feedback on desktop and mobile.

## Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Tests: `npm test`
- Build: `npm run build`

## You may

- Edit any file in the project.
- Add packages only after asking me first.
- Never add a login, a database or a backend, never write secrets or .env values, never deploy anywhere.

## Before you finish

- Make sure the page still loads.
- Run `npm test` and `npm run build` and report the real output before you propose acceptance.
