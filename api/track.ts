import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const getAuth = () => {
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
    return new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: privateKey,
        scopes: SCOPES,
    });
};

export default async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { title, url, referrer } = req.body as {
        title: string;
        url: string;
        referrer: string;
    };

    const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
        req.socket?.remoteAddress ??
        'unknown';

    const browser = req.headers['user-agent'] ?? 'unknown';

    const dateTime = new Date().toLocaleString('en-CA', {
        timeZone: 'America/Toronto',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const sheetId = process.env.GOOGLE_SHEET_ID;
    const tab = process.env.GOOGLE_SHEET_TAB ?? 'Sheet1';

    if (!sheetId) {
        return res.status(500).json({ error: 'Sheet ID not configured' });
    }

    try {
        const auth = getAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: `${tab}!A:F`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[dateTime, ip, browser, referrer, title, url]],
            },
        });

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('track error', err);
        return res.status(500).json({ error: 'Failed to write to sheet' });
    }
};
