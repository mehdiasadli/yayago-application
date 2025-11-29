# When Performing A Task Use This As A Guide

## Structure of Project

This project has been scaffolded with `create-better-t-stack`.
It has two main folders.

- `/apps` - contains the applications folders.
- `/packages` - contains sharable the packages folders.

`apps`

- `web` - contains the web (Next.js@16) application folder.
- `native` - contains the mobile (React Native with Expo) application folder.
- `server` - contains the backend API (Hono, ORPC) folder.
- `admin` - contains the admin panel (Next.js@16) folder.
- `partner` - contains the partner portal (Next.js@16) folder.

note: all frontends use orpc to talk with `packages/api` folder.

`packages`

- `api` - contains the shared API logic folder. This folder contains the shared API logic for the project. It is used by the frontends and the backend.
- `auth` - contains the shared authentication logic folder. We have used `better-auth` for authentication.
- `db` - contains the shared database logic folder.
- `i18n` - contains the shared internationalization logic folder.
- `utils` - contains the shared utility functions folder.
- `stripe` - contains the shared stripe logic folder.

### Ne
