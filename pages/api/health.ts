import { NextApiRequest, NextApiResponse } from 'next';

interface HealthResponse {
    status: string;
    apiKeyConfigured: boolean;
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<HealthResponse>
) {
    res.json({ 
        status: 'ok', 
        apiKeyConfigured: !!process.env.OPENAI_API_KEY 
    });
}