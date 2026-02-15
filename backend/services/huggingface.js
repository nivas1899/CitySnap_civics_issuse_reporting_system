import axios from 'axios';

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base';

/**
 * Generate image caption using HuggingFace BLIP model
 * @param {Buffer} imageBuffer - Image file buffer
 * @returns {Promise<string>} - Generated caption
 */
export const generateCaption = async (imageBuffer) => {
    try {
        const response = await axios.post(
            HUGGINGFACE_API_URL,
            imageBuffer,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/octet-stream'
                },
                timeout: 30000 // 30 second timeout
            }
        );

        // HuggingFace returns array with generated text
        if (response.data && response.data[0] && response.data[0].generated_text) {
            return response.data[0].generated_text;
        }

        throw new Error('Invalid response from HuggingFace API');
    } catch (error) {
        if (error.response) {
            // API returned error
            throw new Error(`HuggingFace API error: ${error.response.data.error || error.response.statusText}`);
        } else if (error.request) {
            // No response received
            throw new Error('No response from HuggingFace API. The model might be loading, please try again.');
        } else {
            throw new Error(`Error generating caption: ${error.message}`);
        }
    }
};

/**
 * Enhance AI caption into formal civic report format
 * @param {string} caption - Raw AI caption
 * @returns {string} - Formatted civic report description
 */
export const enhanceDescription = (caption) => {
    // Convert caption to formal civic report format
    const enhanced = `Civic Issue Report: ${caption.charAt(0).toUpperCase() + caption.slice(1)}. ` +
        `This issue requires attention from the relevant municipal department. ` +
        `Immediate action is recommended to address this matter.`;

    return enhanced;
};
