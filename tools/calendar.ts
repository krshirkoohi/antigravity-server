/**
 * Google Calendar API wrapper tools
 */

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const TIMEZONE = process.env.CALENDAR_TIMEZONE || 'UTC';

// Credentials loaded from environment
const getCredentials = () => ({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN!,
});

/**
 * Get a fresh access token using the refresh token
 */
async function getAccessToken(): Promise<string> {
    const creds = getCredentials();

    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: creds.clientId,
            client_secret: creds.clientSecret,
            refresh_token: creds.refreshToken,
            grant_type: 'refresh_token',
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
}

export interface CalendarEvent {
    summary: string;
    start: string;
    end: string;
    id?: string;
}

/**
 * List upcoming calendar events
 */
export async function listCalendarEvents(maxResults = 10): Promise<CalendarEvent[]> {
    const token = await getAccessToken();
    const now = new Date().toISOString();

    const url = new URL(CALENDAR_API);
    url.searchParams.set('maxResults', String(maxResults));
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('timeMin', now);

    const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error(`Calendar API error: ${response.statusText}`);
    }

    const data = await response.json();
    return (data.items || []).map((e: any) => ({
        id: e.id,
        summary: e.summary || '(No title)',
        start: e.start?.dateTime || e.start?.date,
        end: e.end?.dateTime || e.end?.date,
    }));
}

/**
 * Add a new calendar event
 */
export async function addCalendarEvent(
    summary: string,
    startTime: string,
    endTime: string,
    description?: string
): Promise<CalendarEvent> {
    const token = await getAccessToken();

    const event = {
        summary,
        description,
        start: { dateTime: startTime, timeZone: TIMEZONE },
        end: { dateTime: endTime, timeZone: TIMEZONE },
    };

    const response = await fetch(CALENDAR_API, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
    });

    if (!response.ok) {
        throw new Error(`Failed to create event: ${response.statusText}`);
    }

    const data = await response.json();
    return {
        id: data.id,
        summary: data.summary,
        start: data.start?.dateTime || data.start?.date,
        end: data.end?.dateTime || data.end?.date,
    };
}
