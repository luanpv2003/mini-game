import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  // Allow requests from any origin for development purposes.
  // For production, you might want to restrict this to your domain.
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Master-Key');

  // Handle preflight requests for CORS
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const email = request.query.email || (request.body && request.body.email);

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  // Sanitize email to create a safe key for the KV store
  const key = `questions-${email.toLowerCase().trim()}`;

  if (request.method === 'POST') {
    try {
      const { questions } = request.body;
      if (!questions) {
        return response.status(400).json({ error: 'Questions data is required' });
      }
      // Store the data in Vercel KV
      await kv.set(key, { email, questions });
      return response.status(200).json({ message: 'Question set saved successfully' });
    } catch (error) {
      console.error('KV SET Error:', error);
      return response.status(500).json({ error: 'Failed to save data.' });
    }
  }

  if (request.method === 'GET') {
    try {
      // Retrieve the data from Vercel KV
      const data = await kv.get(key);
      if (data) {
        return response.status(200).json(data);
      } else {
        // Return 404 if no data is found for the email
        return response.status(404).json({ message: 'No question set found for this email.' });
      }
    } catch (error) {
      console.error('KV GET Error:', error);
      return response.status(500).json({ error: 'Failed to retrieve data.' });
    }
  }

  // If the method is not GET or POST, return an error
  response.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return response.status(405).end(`Method ${request.method} Not Allowed`);
}
