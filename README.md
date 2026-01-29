# Form Capture Service

A NestJS microservice that captures form submissions from the website, validates input, and forwards them via email to the build team.

## Features

- Validates form submissions (name, email, subject, message)
- Forwards submissions to `build@memeticblock.com` via Google Workspace SMTP relay
- Sets reply-to header to submitter's email for easy responses

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp-relay.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP authentication username | `formcapture@memeticblock.com` |
| `SMTP_PASS` | Google App Password | - |
| `MAIL_FROM` | Sender email address | `formcapture@memeticblock.com` |
| `MAIL_TO` | Recipient email address | `build@memeticblock.com` |
| `IS_LIVE` | Enable email sending (`true`/`false`) | `false` |
| `TURNSTILE_ENABLED` | Enable Cloudflare Turnstile captcha (`true`/`false`) | `true` |
| `TURNSTILE_SECRETKEY` | Cloudflare Turnstile secret key | - |

### Cloudflare Turnstile Setup

This service uses [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) to protect form submissions from bots.

1. Go to the [Cloudflare dashboard](https://dash.cloudflare.com/) → Turnstile
2. Click "Add site" and configure your widget
3. Copy the **Secret Key** to `TURNSTILE_SECRETKEY`
4. Use the **Site Key** in your frontend integration

For local development, set `TURNSTILE_ENABLED=false` to bypass verification.

See the [Turnstile documentation](https://developers.cloudflare.com/turnstile/get-started/) for detailed setup instructions.

### Google App Password Setup

1. Sign in to `formcapture@memeticblock.com` in Google Admin
2. Go to Security → 2-Step Verification (must be enabled)
3. Go to Security → App passwords
4. Generate a new app password for "Mail"
5. Copy the 16-character password to `SMTP_PASS` in `.env`

## Running the Service

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The service runs on port `3000` by default (configurable via `PORT` env var).

## API

### POST /form

Submit a form.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Partnership inquiry",
  "message": "Hello, I'd like to discuss a potential partnership...",
  "turnstileToken": "0.ABC123..."
}
```

**Validation Rules:**

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | string | Required, 1-100 characters |
| `email` | string | Required, valid email format |
| `subject` | string | Required, 1-200 characters |
| `message` | string | Required, 1-5000 characters |
| `turnstileToken` | string | Required, Cloudflare Turnstile response token |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Form submitted successfully"
}
```

**Validation Error Response:** `400 Bad Request`

```json
{
  "statusCode": 400,
  "message": ["email must be an email", "name should not be empty"],
  "error": "Bad Request"
}
```

**Captcha Error Response:** `403 Forbidden`

```json
{
  "statusCode": 403,
  "message": "Captcha verification failed",
  "error": "Forbidden"
}
```

## Deployment

This service is designed to run behind a Traefik reverse proxy which handles:

- CORS headers
- Rate limiting
- TLS termination

## Development

```bash
# Install dependencies
npm install

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Lint
npm run lint
```
