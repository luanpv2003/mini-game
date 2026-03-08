import fetch from 'node-fetch';
import FormData from 'form-data';
import { Readable } from 'stream';

export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper để parse multipart form data
async function parseMultipartForm(req) {
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) throw new Error('No boundary found');

    const chunks = [];
    for await (const chunk of req) {
        chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Tìm file trong multipart data
    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const parts = [];
    let start = 0;

    while (true) {
        const boundaryIndex = buffer.indexOf(boundaryBuffer, start);
        if (boundaryIndex === -1) break;

        const nextBoundary = buffer.indexOf(boundaryBuffer, boundaryIndex + boundaryBuffer.length);
        if (nextBoundary === -1) break;

        const part = buffer.slice(boundaryIndex + boundaryBuffer.length, nextBoundary);
        parts.push(part);
        start = nextBoundary;
    }

    for (const part of parts) {
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd === -1) continue;

        const headers = part.slice(0, headerEnd).toString();
        const filenameMatch = headers.match(/filename="([^"]+)"/);
        
        if (filenameMatch) {
            const fileData = part.slice(headerEnd + 4, part.length - 2); // Loại bỏ \r\n cuối
            return {
                filename: filenameMatch[1],
                buffer: fileData
            };
        }
    }

    throw new Error('No file found in request');
}

export default async function handler(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { filename, buffer } = await parseMultipartForm(request);

        // Tạo FormData để gửi đến Coolmate API
        const coolmateFormData = new FormData();
        const stream = Readable.from(buffer);
        coolmateFormData.append('files[]', stream, filename);

        const coolmateResponse = await fetch('https://media.coolmate.me/api/upload', {
            method: 'POST',
            body: coolmateFormData,
            headers: {
                ...coolmateFormData.getHeaders(),
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
                'Origin': 'https://admin.coolmate.me',
                'Referer': 'https://admin.coolmate.me/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            },
        });

        if (!coolmateResponse.ok) {
            const errorText = await coolmateResponse.text();
            console.error('Coolmate API Error:', errorText);
            return response.status(coolmateResponse.status).json({ error: 'Failed to upload image to Coolmate.' });
        }

        const result = await coolmateResponse.json();

        if (result.success && result.data && result.data.length > 0) {
            const imageUrl = 'https://media.coolmate.me' + result.data[0].original;
            return response.status(200).json({ success: true, url: imageUrl });
        } else {
            return response.status(500).json({ error: 'Invalid response from Coolmate API.' });
        }
    } catch (error) {
        console.error('Upload handler error:', error);
        return response.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
