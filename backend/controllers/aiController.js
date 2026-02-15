import { generateCaption, enhanceDescription } from '../services/huggingface.js';
import fs from 'fs';

/**
 * Generate AI caption from uploaded image
 */
export const captionImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        // Read image file
        const imageBuffer = fs.readFileSync(req.file.path);

        // Generate caption using HuggingFace
        const rawCaption = await generateCaption(imageBuffer);

        // Enhance caption into formal civic report
        const enhancedDescription = enhanceDescription(rawCaption);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            rawCaption,
            description: enhancedDescription
        });
    } catch (error) {
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        console.error('AI caption error:', error);
        res.status(500).json({
            message: 'Error generating caption',
            error: error.message
        });
    }
};
