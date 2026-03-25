# Days 2 - Google Calendar Countdown

Countdown to all-day events from Google Calendar (birthdays, holidays, deadlines).

## Setup

1. Create a Google Cloud project and enable the **Google Calendar API**.
2. Configure OAuth consent screen (External) and add your account as a test user.
3. Create an **iOS** OAuth Client ID with bundle ID `com.raycast`.
4. In Raycast, open the extension preferences for this extension and paste the iOS Client ID into the "Client ID" field.

Notes:

- The extension uses the `calendar.readonly` scope.
- The OAuth flow requires an iOS-type client ID with bundle ID `com.raycast` so Raycast can complete the redirect.

## Usage

- `days2` — Main command: shows next event, upcoming all-day events, and supports search.
- `manage-calendars` — Toggle which calendars are displayed.
- `background-refresh` — No-view command that updates the shortcut subtitle (runs every hour).

## Troubleshooting

- If events do not appear, check the extension preferences for a valid Client ID and ensure the Google Calendar API is enabled in your Google Cloud project.
- The extension surfaces API failures via a Toast notification in the UI and logs details to the console for debugging.

## Development

Run locally with:

```bash
npm install
npm run dev
```

Build with:

```bash
npm run build
```
