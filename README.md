# BEDS24_PMS
[![Repo Size](https://img.shields.io/github/repo-size/KunalWadhai/BEDS24_PMS?color=blue)](https://github.com/KunalWadhai/BEDS24_PMS)
[![Languages](https://img.shields.io/github/languages/top/KunalWadhai/BEDS24_PMS?color=informational)](https://github.com/KunalWadhai/BEDS24_PMS)
[![License](https://img.shields.io/github/license/KunalWadhai/BEDS24_PMS?color=green)](https://github.com/KunalWadhai/BEDS24_PMS/blob/main/LICENSE)
[![Issues](https://img.shields.io/github/issues/KunalWadhai/BEDS24_PMS?color=yellow)](https://github.com/KunalWadhai/BEDS24_PMS/issues)
[![Last Commit](https://img.shields.io/github/last-commit/KunalWadhai/BEDS24_PMS/main?color=purple)](https://github.com/KunalWadhai/BEDS24_PMS/commits/main)

> A focused JavaScript integration to manage reservations, availability, and synchronization with Beds24 — BEDS24_PMS makes property management automation simple, reliable and extensible.

---

[![Demo GIF](https://raw.githubusercontent.com/KunalWadhai/BEDS24_PMS/main/docs/demo.gif)](https://github.com/KunalWadhai/BEDS24_PMS)

Table of Contents
- [Why this project](#why-this-project)
- [Highlights](#highlights)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Environment variables](#environment-variables)
  - [Run locally](#run-locally)
- [Usage Examples](#usage-examples)
  - [Quick sync flow](#quick-sync-flow)
  - [Example: Create Booking](#example-create-booking)
  - [Webhook handling](#webhook-handling)
- [Folder Structure](#folder-structure)
- [Docker & Production](#docker--production)
- [CI / Tests](#ci--tests)
- [Troubleshooting & Tips](#troubleshooting--tips)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License & Maintainers](#license--maintainers)
- [Acknowledgements](#acknowledgements)

Why this project
----------------
Property management systems and channel managers need robust synchronization. This project is a focused BEDS24 integration (PMS) that aims to:
- Provide reliable booking & availability sync with Beds24.
- Offer a developer-friendly interface and webhook handling.
- Be easily containerized and deployed.
- Serve as a base for custom automations and property-specific logic.

Highlights
----------
- Clean JavaScript codebase (100% JS).
- Pluggable sync pipeline for booking, cancellations, availability, and rates.
- Webhook-first design for real-time updates.
- Ready for Docker and CI pipelines.
- Extensible: add adapters for other channel managers or internal systems.

Architecture
------------
High-level flow:

```
+-------------+     Webhooks      +-------------+     Sync Workers    +-------------+
| Beds24 API  | ----------------> | Webhook     | --------------->   | Sync Engine |
|  (external) |                    | Receiver    |                    | (jobs/queue)|
+-------------+                    +-------------+                    +-------------+
       ^                                   |                                |
       | REST sync / polling                v                                v
       |                                +------+                    +-----------------+
       +-------------------<------------| API  |<-------------------| Local Database  |
                                        | & UI |                    | (bookings/room) |
                                        +------+                    +-----------------+
```

A full diagram is available at: docs/architecture.svg (add your visuals there to replace placeholder).

Getting Started
---------------
Prerequisites
- Node.js >= 18
- npm >= 9 (or yarn)
- PostgreSQL / SQLite / any supported DB (if using persistence)
- Optional: Docker & Docker Compose

Install
```
git clone https://github.com/KunalWadhai/BEDS24_PMS.git
cd BEDS24_PMS
npm install
```

Environment variables
Create a `.env` file in the project root with values for your environment. Example `.env.example`:

```env
PORT=3000
NODE_ENV=development

# Beds24
BEDS24_API_KEY=your_beds24_api_key
BEDS24_ACCESS_TOKEN=your_beds24_access_token
```

Run locally
```
npm run dev        # start in development with hot reload
npm start          # production start
```

Usage Examples
--------------
The repo contains modules for Beds24 operations. Example usage patterns below illustrate typical flows.

Quick sync flow (pseudo)
1. Receive a webhook event from Beds24 (booking created/modified/cancelled).
2. Validate webhook signature.
3. Enqueue a sync job to process booking and update the internal DB.
4. Optionally push updates to other channels or notify staff.

Example: Create Booking (Node.js)
```javascript
const { Beds24Client } = require('./src/services/beds24');

const client = new Beds24Client({
  baseurl: process.env.BEDS24_BASE_URL,
  access_token: process.env.BEDS24_TOKEN
});

async function createBooking() {
  const booking = await client.createBooking({
    firstName: 'Jane',
    lastName: 'Guest',
    email: 'jane@example.com',
    checkIn: '2025-12-20',
    checkOut: '2025-12-23',
    rooms: [
      { roomTypeId: 101, quantity: 1 }
    ],
    total: 450.00,
    currency: 'USD'
  });

  console.log('Booking created:', booking);
}

createBooking().catch(console.error);
```

Webhook handling
- Validate signature using WEBHOOK_SECRET.
- Parse event type (reservation/new, reservation/modify, reservation/cancel).
- Map data to local models and persist.
- Enqueue any downstream tasks (notifications, OTA updates).

Folder Structure
----------------
A recommended structure is included:

```
/
├─ src/
│  ├─ routes/
   |- controllers           
│  ├─ services/          # Beds24 client, other external APIs
│  ├─ middlewares/              # Background workers and queue processors
│  ├─ models/            # DB models / ORM
│  ├─ config/          # Webhook handlers & validators
│  └─ utils/             # Helpers, logging, error handling
├─ tests/                # Unit & integration tests
├─ docs/                 # Architecture, screenshots, guides
├─ Dockerfile
├─ docker-compose.yml
└─ README.md
```

Docker & Production
-------------------
A sample Dockerfile (skeleton) is included. Use environment variables for secrets; never bake them into images.

Build & run:
```
docker build -t beds24_pms:latest .
docker run -d --env-file .env -p 3000:3000 beds24_pms:latest
```

For production, prefer:
- Managed DB + secure secrets (AWS Secrets Manager / Vault)
- Proper health checks and readiness probes
- Logging to a central service (ELK / Datadog / Papertrail)
- Horizontal scaling of workers (use Redis/RabbitMQ for queues)

CI / Tests
----------
Run tests:
```
npm test
```
Suggested CI:
- GitHub Actions workflow to run lint, tests and build/publish Docker image on main branch.
- Add status badges to README once CI is set.

Troubleshooting & Tips
----------------------
- Webhook failures: ensure your server is reachable from Beds24 and that signature verification matches.
- Rate limits: implement exponential backoff and retry strategies on API errors.
- Idempotency: design handlers to be idempotent (use booking external IDs).
- Timezones: ensure consistent timezone handling — store timestamps in UTC.

Roadmap
-------
Planned items:
- [ ] Add full UI for bookings & calendar
- [ ] Add multi-property support
- [ ] Implement rate & restriction sync
- [ ] Add automated nightly availability reconcile job
- [ ] Improve test coverage and add E2E tests

Contributing
------------
Contributions are welcome! Suggested flow:
1. Fork the repo
2. Create a descriptive branch (feature/..., fix/...)
3. Add tests for new behavior
4. Open a Pull Request with a clear description and screenshots if UI changes
5. Maintain a clean git history (rebase/squash as appropriate)

When opening issues or PRs, please include:
- Repro steps
- Expected vs actual behavior
- Logs and environment (Node version, OS)

License & Maintainers
---------------------
This project is MIT licensed — see LICENSE for details.

Maintained by:
- Kunal Wadhai — https://github.com/KunalWadhai

Acknowledgements
----------------
- Beds24 for their API and documentation.
- Open-source libraries that enable robust integrations and queues.

Contact
-------
For questions, feature requests, or help:
- Open an issue in this repo
- Email: (add your preferred contact)

Footer
------
Made with ❤️ for property managers and developers. Keep automating!
