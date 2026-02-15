import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base';

serve(async (req) => {
    try {
        // 1. Handle CORS
        if (req.method === 'OPTIONS') {
            return new Response('ok', {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
                },
            })
        }

        // 2. Auth check (optional, but good practice)
        // The client should send the anon key, which Supabase verifies before reaching here if 'Verify JWT' is on.
        // We can also double check headers if needed.

        // 3. Parse FormData
        const formData = await req.formData();
        const image = formData.get('image');

        if (!image) {
            return new Response(
                JSON.stringify({ message: 'No image uploaded' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // 4. API Key
        // You must set this secret: supabase secrets set HUGGINGFACE_API_KEY=...
        const huggingFaceKey = Deno.env.get('HUGGINGFACE_API_KEY');
        if (!huggingFaceKey) {
            console.error('Missing HUGGINGFACE_API_KEY');
            return new Response(
                JSON.stringify({ message: 'Server configuration error' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // 5. Call HuggingFace
        const response = await fetch(HUGGINGFACE_API_URL, {
            headers: {
                Authorization: `Bearer ${huggingFaceKey}`,
                "Content-Type": "application/octet-stream",
            },
            method: "POST",
            body: image, // Fetch handles the stream/blob correctly
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('HuggingFace Error:', err);
            return new Response(
                JSON.stringify({ message: 'Error generating caption' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const result = await response.json();
        const caption = result[0]?.generated_text || "No caption generated";

        // 6. Generate Title from Caption
        // Create a concise title (5-8 words) from the caption
        const words = caption.split(' ');
        const titleWords = words.slice(0, Math.min(6, words.length));
        const title = titleWords.map((word, index) =>
            index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
        ).join(' ');

        // 7. Enhance Caption into Description
        const description = `Civic Issue Report: ${caption.charAt(0).toUpperCase() + caption.slice(1)}. ` +
            `This issue requires attention from the relevant municipal department. ` +
            `Immediate action is recommended to address this matter.`;

        // 8. Return Result
        return new Response(
            JSON.stringify({
                title: title,
                rawCaption: caption,
                description: description
            }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        )

    } catch (error) {
        console.error('Edge Function Error:', error);
        return new Response(
            JSON.stringify({ message: 'Internal Server Error', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
})
