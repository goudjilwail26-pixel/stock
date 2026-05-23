# Stokiloo — B2B Wholesale Marketplace

Dark editorial B2B wholesale platform built with React, Express, and Supabase.

## Quick Start

```bash
npm install
cp .env.example .env   # fill in your Supabase credentials
npm run dev
```

## Setup Supabase

1. Run the SQL from `supabase/migrations/001_schema.sql` in your Supabase SQL Editor
2. Copy your Supabase URL and anon/service keys to `.env`

## Deploy

```bash
npm run build
npm start
```

## Login

| Role  | Email            | Password  |
|-------|------------------|-----------|
| Admin | admin@b2b.com    | admin123  |
| Buyer | buyer@b2b.com    | buyer123  |
