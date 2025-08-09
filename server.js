const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/generate-flashcards', async (req, res) => {
    try {
        const { topic, count = 100, customPrompt } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API key not configured' });
        }

        console.log(`Generating ${count} flashcards for topic: ${topic}`);

        // Use custom prompt if provided, otherwise use default
        let prompt;
        if (customPrompt && customPrompt.trim()) {
            // Replace placeholders in custom prompt
            prompt = customPrompt
                .replace('{count}', count)
                .replace('{topic}', topic)
                .replace('{COUNT}', count)
                .replace('{TOPIC}', topic);
            
            // Ensure the prompt asks for JSON format
            if (!prompt.toLowerCase().includes('json')) {
                prompt += '\n\nIMPORTANT: Return ONLY a JSON array of objects with "question" and "answer" fields. No additional text or markdown.';
            }
        } else {
            // Default prompt
            prompt = `Generate exactly ${count} flashcards about "${topic}". 
        Return ONLY a JSON array of objects with "question" and "answer" fields.
        Make the questions diverse, covering different aspects and difficulty levels.
        Keep answers concise but informative.
        Example format:
        [{"question": "What is...", "answer": "It is..."}, ...]
        
        IMPORTANT: Return ONLY the JSON array, no additional text or markdown.`;
        }

        // Generate a unique session identifier to ensure fresh context
        const sessionId = Date.now().toString();
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful educator creating educational flashcards. Session ID: ${sessionId}. 
                    
                    IMPORTANT: Each request is independent. Do not reference or remember any previously generated flashcards. 
                    Create entirely fresh, unique flashcards for this topic without considering what you may have generated before.
                    
                    Always return valid JSON arrays only. Ensure variety and avoid repetition within this single generation.`
                },
                {
                    role: "user",
                    content: `${prompt}
                    
                    NOTE: Generate completely original flashcards. Do not repeat or reference any previous generations.`
                }
            ],
            temperature: 0.8, // Increased for more variety
            max_tokens: 4000,
            // Add seed randomization to ensure different outputs each time
            seed: Math.floor(Math.random() * 1000000)
        });

        const responseText = completion.choices[0].message.content.trim();
        
        // Try to parse the response
        let flashcards;
        try {
            // Remove any markdown code blocks if present
            const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            flashcards = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            console.error('Raw response:', responseText);
            return res.status(500).json({ error: 'Failed to parse AI response' });
        }

        // Validate the structure
        if (!Array.isArray(flashcards)) {
            return res.status(500).json({ error: 'Invalid response format from AI' });
        }

        // Ensure all flashcards have the correct structure
        let validFlashcards = flashcards.filter(card => 
            card && typeof card.question === 'string' && typeof card.answer === 'string'
        );

        console.log(`AI generated ${validFlashcards.length} valid flashcards, requested ${count}`);

        // If we got fewer cards than requested, try to generate more
        let attempts = 0;
        const maxAttempts = 3;
        
        while (validFlashcards.length < count && attempts < maxAttempts) {
            attempts++;
            const needed = count - validFlashcards.length;
            console.log(`Attempt ${attempts}: Need ${needed} more flashcards`);
            
            try {
                const additionalPrompt = `Generate exactly ${needed} additional flashcards about "${topic}". 
                Make them different from any previously generated flashcards. 
                Return ONLY a JSON array of objects with "question" and "answer" fields.
                No duplicates or similar questions to what may have been generated before.
                
                ${customPrompt && customPrompt.trim() ? 
                    `Follow this style: ${customPrompt.replace('{count}', needed).replace('{topic}', topic)}` : 
                    'Make them diverse and educational.'
                }`;
                
                const additionalCompletion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: `You are generating additional flashcards to reach the exact count requested. Session: ${sessionId}-retry-${attempts}.
                            
                            IMPORTANT: Generate exactly ${needed} unique flashcards. Do not repeat previous content.
                            Always return valid JSON arrays only.`
                        },
                        {
                            role: "user",
                            content: additionalPrompt
                        }
                    ],
                    temperature: 0.9, // Higher temperature for more variety in retries
                    max_tokens: 2000,
                    seed: Math.floor(Math.random() * 1000000)
                });

                const additionalText = additionalCompletion.choices[0].message.content.trim();
                const cleanedAdditionalText = additionalText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
                
                let additionalCards;
                try {
                    additionalCards = JSON.parse(cleanedAdditionalText);
                } catch (parseError) {
                    console.error(`Parse error on attempt ${attempts}:`, parseError);
                    continue;
                }

                if (Array.isArray(additionalCards)) {
                    const validAdditional = additionalCards.filter(card => 
                        card && typeof card.question === 'string' && typeof card.answer === 'string'
                    );
                    
                    validFlashcards = validFlashcards.concat(validAdditional);
                    console.log(`Added ${validAdditional.length} more cards, total: ${validFlashcards.length}`);
                }
            } catch (retryError) {
                console.error(`Retry attempt ${attempts} failed:`, retryError);
            }
        }
        
        // Limit to exact count if we got more than requested
        validFlashcards = validFlashcards.slice(0, count);
        
        // Final validation
        if (validFlashcards.length < count) {
            console.warn(`Only generated ${validFlashcards.length} out of ${count} requested flashcards`);
            return res.json({ 
                flashcards: validFlashcards,
                warning: `Generated ${validFlashcards.length} flashcards instead of ${count} requested`
            });
        }

        console.log(`Successfully generated exactly ${validFlashcards.length} flashcards`);
        res.json({ flashcards: validFlashcards });

    } catch (error) {
        console.error('Error generating flashcards:', error);
        res.status(500).json({ 
            error: 'Failed to generate flashcards', 
            details: error.message 
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        apiKeyConfigured: !!process.env.OPENAI_API_KEY 
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`OpenAI API Key configured: ${!!process.env.OPENAI_API_KEY}`);
    if (!process.env.OPENAI_API_KEY) {
        console.log('\n⚠️  WARNING: No OpenAI API key found!');
        console.log('Please add OPENAI_API_KEY to your .env file');
    }
});