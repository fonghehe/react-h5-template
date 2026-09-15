---
layout: home
hero:
  name: React H5 Template
  text: A full-stack mobile web foundation
  tagline: Three UI implementations share one business layer, typed API boundary, and Next.js backend.
  actions:
    - theme: brand
      text: Get started
      link: /getting-started
    - theme: alt
      text: Explore the architecture
      link: /architecture
features:
  - title: Three independent apps
    details: Ant Design Mobile, NutUI React, and Arco Mobile each run as a Next.js app, while screens use one UI contract.
  - title: Explicit data boundaries
    details: TanStack Query owns remote data, Zustand owns session and cart state, and repositories own PostgreSQL access.
  - title: Reviewable contracts
    details: Zod validates requests, OpenAPI defines generated clients, and normalized responses include request IDs.
---

The template covers product browsing, cart, sign-in, local checkout simulation, mobile Web API examples, internationalization, and a demonstration SSE chat endpoint. The checkout does **not** create an order or charge a payment method; the AI endpoint does **not** call a production model. [Architecture](/architecture) records the current boundaries and the next backend work needed for a real commerce deployment.

## Read the system by journey

Start with [Getting started](/getting-started) to run one app in demo mode or connect the local PostgreSQL container. [Frontend](/frontend) shows which state belongs to Query, Zustand, form state, and the UI adapters. [Commerce](/commerce) follows catalog, detail, cart, and checkout in order and identifies the first server-side order boundary. [Authentication](/authentication) traces login, token verification, and the limitation of local logout. [AI streaming](/ai) shows the request shape and individual SSE events.

[Backend](/backend) maps methods and errors to repositories and database tables. [Internationalization](/internationalization) separates five-language UI support from three-language documentation and partially localized database content. [Quality](/quality) describes the exact checks and existing test coverage; [VS Code](/editor) connects the same pnpm scripts to editor tasks and debugging. [Deployment](/deployment) describes the three-server topology and documentation hosting. [Roadmap](/roadmap) sequences proposed production work.

The shared UI approach prevents three copies of business screens, but each app remains an independent Next.js server and browser origin. That detail determines where API routes execute, how many PostgreSQL pools exist when all apps run, and why carts do not automatically synchronize across ports.
