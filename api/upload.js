import { formidable } from 'formidable';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

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
        const form = formidable({});
        const [fields, files] = await form.parse(request);

        const imageFile = files.file?.[0];

        if (!imageFile) {
            return response.status(400).json({ error: 'No file uploaded.' });
        }

        const coolmateFormData = new FormData();
        coolmateFormData.append('files[]', fs.createReadStream(imageFile.filepath), imageFile.originalFilename);

        const coolmateResponse = await fetch('https://media.coolmate.me/api/upload', {
            method: 'POST',
            body: coolmateFormData,
            headers: coolmateFormData.getHeaders(),
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
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}
