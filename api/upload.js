export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: corsHeaders,
        });
    }

    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const formData = await req.formData();
        let file = formData.get('files[]');
        
        // Fallback lấy bất cứ file nào nếu key 'files[]' trống
        if (!file) {
            for (const value of formData.values()) {
                if (value instanceof Blob) {
                    file = value;
                    break;
                }
            }
        }

        if (!file) {
            return new Response(JSON.stringify({ error: 'No file uploaded' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Forward to Coolmate Media API
        const coolmateFormData = new FormData();
        coolmateFormData.append('files[]', file);

        const coolmateResponse = await fetch('https://media.coolmate.me/api/upload', {
            method: 'POST',
            body: coolmateFormData,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Vercel Edge Runtime) upload-proxy',
            },
        });

        const result = await coolmateResponse.json();
        
        if (result.success && result.data?.length > 0) {
            return new Response(JSON.stringify({
                success: true,
                url: 'https://media.coolmate.me' + result.data[0].original,
                data: result.data[0]
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        
        return new Response(JSON.stringify({ error: 'Upload failed', details: result }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}
