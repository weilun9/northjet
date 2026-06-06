# NorthJet ✈️

A premium private jet booking system for a fictitious airline operating from Dairy Flat Airport (NZNE), Auckland.

**159.352 Assignment 2** — Next.js + MongoDB Atlas + Vercel

---

## Routes

| Route | Service | Aircraft | Frequency |
|---|---|---|---|
| NZNE ↔ YSSY | Sydney Prestige | SyberJet SJ30i (6 pax) | Weekly (Fri out / Sun return) |
| NZNE ↔ NZRO | Rotorua Shuttle | Cirrus SF50 (4 pax) | Mon–Fri, 2× daily |
| NZNE ↔ NZGB | Great Barrier Island | Cirrus SF50 (4 pax) | 3× weekly |
| NZNE ↔ NZCI | Chatham Islands | HondaJet Elite (5 pax) | 2× weekly |
| NZNE ↔ NZTL | Lake Tekapo | HondaJet Elite (5 pax) | Weekly |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB Atlas via Mongoose
- **Deployment**: Vercel
- **Styling**: Tailwind CSS
- **Fonts**: Sora + DM Sans (Google Fonts)
- **Icons**: Lucide React

---

## Setup

### 1. Clone & Install
```bash
git clone <repo>
cd northjet
npm install
```

### 2. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/northjet
```

### 3. Run Locally
```bash
npm run dev
```

### 4. Seed the Database
Open the app in your browser and click the **⚡ Seed DB** button in the navbar.  
This generates 8 weeks of scheduled flights from today.

Or call the API directly:
```bash
curl -X POST http://localhost:3000/api/seed
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/flights?orig=NZNE&dest=YSSY&date=2026-06-07&days=14` | Search flights |
| `GET` | `/api/flights/:id` | Get a single flight |
| `POST` | `/api/bookings` | Create a booking |
| `GET` | `/api/bookings?email=user@example.com` | Get all bookings by email |
| `GET` | `/api/bookings/:ref` | Get a single booking by reference |
| `DELETE` | `/api/bookings/:ref` | Cancel a booking |
| `POST` | `/api/seed` | Re-seed database with 8 weeks of flights |

---

## Pages

| Page | Path | Description |
|---|---|---|
| Landing | `/` | Hero search form, popular destinations, deals |
| Flights | `/flights?orig=&dest=&date=` | Search results (14-day window) |
| Booking | `/booking/:flightId` | Passenger details form |
| Confirmation | `/booking/confirmation?ref=NJ...` | Invoice / booking receipt |
| My Bookings | `/my-bookings` | Find & cancel bookings by email |

---

## Key Design Decisions

- All flight times stored as UTC in MongoDB; displayed in local airport time using `tzOffset` math (no timezone library dependency)
- The Chatham Islands use UTC+12:45 — handled explicitly with a 765-minute offset
- Bookings are embedded within Schedule documents (one-to-few pattern, per MongoDB best practices)
- Search window is 14 days from the selected date, to help users find infrequent routes (e.g. the weekly Sydney service)
- Booking references use the format `NJ` + 7 chars (excluding confusable chars 0/O/1/I)

---

## Deployment

Deploy to Vercel:
```bash
vercel
```

Set the `MONGODB_URI` environment variable in the Vercel dashboard.

### Vercel + MongoDB Atlas checklist

If the deployed site shows `Internal server error` or `Could not load flights`,
check these items:

1. In Vercel, open Project > Settings > Environment Variables and add:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/northjet?retryWrites=true&w=majority
   AUTH_SECRET=<a-long-random-secret>
   ```
2. Make sure both variables are enabled for the Production environment.
3. Redeploy after adding or changing environment variables. Existing Vercel
   deployments do not automatically receive new env values.
4. In MongoDB Atlas, open Network Access > IP Access List. For Vercel Hobby
   deployments, allow access from anywhere with `0.0.0.0/0` because Vercel
   serverless outbound IPs are not fixed.
5. Confirm the database user in Atlas has read/write access to the `northjet`
   database.
6. Visit `/api/health` on the deployed site:
   - `ok: true` means Vercel can connect to MongoDB.
   - `missing_mongodb_uri` means the Vercel env var is missing or the app needs
     a redeploy.
   - `authentication_failed` means the username/password in `MONGODB_URI` is
     wrong.
   - `network_or_atlas_access` usually means Atlas Network Access is blocking
     Vercel.
"# northjet" 
