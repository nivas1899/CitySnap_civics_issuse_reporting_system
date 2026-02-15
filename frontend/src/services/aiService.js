import { GoogleGenerativeAI } from "@google/generative-ai";

// API Keys for rotation
const API_KEYS = [
    "AIzaSyBMRrlmzTCtrGp3p9FB9XGXxhs3eFysoGQ",
    "AIzaSyBtOFeBuNxuUvKzgkdRwuF-V9ZG5D_xBNI"
];

export const aiService = {
    // Track current key index
    currentKeyIndex: 0,

    /**
     * Get the next API key in rotation
     */
    getApiKey() {
        const key = API_KEYS[this.currentKeyIndex];
        this.currentKeyIndex = (this.currentKeyIndex + 1) % API_KEYS.length;
        console.log(`Using API Key index: ${this.currentKeyIndex} (rotated)`);
        return key;
    },

    async generateCaption(imageFile) {
        let lastError = null;

        // Try each key if one fails
        for (let i = 0; i < API_KEYS.length; i++) {
            try {
                const apiKey = this.getApiKey();
                console.log("Generating caption with Gemini AI...");

                // Initialize Google Generative AI
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                // Convert image file to base64
                const base64Image = await this.fileToGenerativePart(imageFile);

                // Create prompt for civic issue analysis
                const prompt = `
            Analyze this image for civic issues reported by a citizen.
            
            Identify if the image contains any of the following civic problems:
            - Potholes or damaged roads
            - Garbage or waste accumulation
            - Broken streetlights or poles
            - Drainage issues, flooding, or water leaks
            - Tree hazards or fallen branches
            - Damaged traffic signs or signals
            - Public property vandalism or graffiti
            - Illegal parking or encroachment
            
            If NO clear civic issue is found (e.g. photos of people, food, pets, indoor rooms, selfies), output isCivicIssue: false.
            
            Provide the output in strict JSON format:
            {
              "title": "Short descriptive title (max 5-7 words)",
              "description": "Detailed description of the problem observing visual details like size, severity, surroundings. Mention specific hazards.",
              "isCivicIssue": boolean,
              "validationReason": "Explanation of why this is or isn't a valid civic issue",
              "severity": "Low", "Medium", or "High",
              "action": "Recommended action for municipal authorities"
            }
          `;

                // Generate content
                const result = await model.generateContent([prompt, base64Image]);
                const response = await result.response;
                const text = response.text();

                console.log("Raw AI response:", text);

                // Parse JSON from response
                // Remove any markdown code blocks if present
                const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
                const data = JSON.parse(cleanText);

                return {
                    title: data.title,
                    description: `${data.description}\n\n**Severity:** ${data.severity}\n**Recommended Action:** ${data.action}`,
                    isCivicIssue: data.isCivicIssue,
                    validationReason: data.validationReason,
                    rawCaption: "Analysis by Google Gemini AI"
                };

            } catch (err) {
                console.error(`Gemini AI Service Error (Attempt ${i + 1}):`, err);
                lastError = err;
                // Continue to next key loop
            }
        }

        // If all keys fail, use fallback
        console.warn("All API keys failed, using fallback logic");
        return this.generateFallbackCaption(imageFile);
    },

    // Helper to convert File to GenerativePart (base64)
    async fileToGenerativePart(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Data = reader.result.split(',')[1];
                resolve({
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type
                    }
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    generateFallbackCaption(imageFile) {
        // Keep existing fallback logic just in case
        const timestamp = new Date().toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
        const fileSize = (imageFile.size / 1024).toFixed(2);

        // Extract meaningful information from filename
        const fileName = imageFile.name.replace(/\.[^/.]+$/, "").toLowerCase();

        // Detect issue type from filename
        const issueType = this.detectIssueType(fileName);

        // CHANGED: If detected type is generic, STILL ALLOW IT (assume civic issue)
        // This prevents false rejections when AI fails
        if (issueType.isGeneric) {
            console.warn("AI analysis failed and filename is generic. Allowing submission with generic description.");
            return {
                title: "Civic Infrastructure Issue Reported",
                rawDescription: "Civic infrastructure problem requiring assessment",
                description: `A civic infrastructure issue has been reported. Please review the attached image to identify the specific problem.\n\n**Reported:** ${timestamp}\n**Image file:** ${imageFile.name} (${fileSize} KB)\n\n**Note:** AI analysis was unavailable. Manual review required.`,
                isCivicIssue: true, // CHANGED: Allow instead of reject
                validationReason: "AI analysis unavailable. Assuming valid civic issue pending manual review."
            };
        }

        // Generate descriptive title
        const title = issueType.title;

        // Generate detailed description based on detected issue type
        let description = `${issueType.description}\n\n`;
        description += `**Location Details:** Please verify the exact location on the map.\n`;
        description += `**Reported:** ${timestamp}\n`;
        description += `**Severity:** ${issueType.severity}\n`;
        description += `**Recommended Action:** ${issueType.action}\n\n`;
        description += `Image file: ${imageFile.name} (${fileSize} KB)`;

        return {
            title: title,
            rawCaption: issueType.rawDescription,
            description: description,
            isCivicIssue: true, // Assume true if filename matches specific keyword
            validationReason: "Issue identified from file details"
        };
    },

    /**
     * Detect issue type from filename (Legacy regex method kept for fallback)
     * @param {string} fileName - Lowercase filename without extension
     * @returns {object} - Issue details
     */
    detectIssueType(fileName) {
        // Check for common civic issue keywords in filename
        if (fileName.includes('pothole') || fileName.includes('hole') || fileName.includes('crack')) {
            return {
                title: 'Road Damage - Pothole/Crack Detected',
                rawDescription: 'Damaged road surface with visible pothole or crack',
                description: 'Road surface damage detected. The image shows a pothole or crack in the road that poses a safety hazard to vehicles and pedestrians. This requires immediate attention to prevent accidents and further deterioration.',
                severity: 'High - Safety hazard',
                action: 'Road repair and resurfacing required'
            };
        }

        if (fileName.includes('garbage') || fileName.includes('trash') || fileName.includes('waste') || fileName.includes('dump')) {
            return {
                title: 'Waste Management Issue - Garbage Accumulation',
                rawDescription: 'Garbage or waste accumulation in public area',
                description: 'Improper waste disposal or garbage accumulation detected. The image shows trash or waste materials that need to be cleared. This creates health hazards and environmental concerns.',
                severity: 'Medium - Health and sanitation concern',
                action: 'Waste collection and area cleaning required'
            };
        }

        if (fileName.includes('street') && (fileName.includes('light') || fileName.includes('lamp'))) {
            return {
                title: 'Street Lighting Issue',
                rawDescription: 'Streetlight malfunction or damage',
                description: 'Street lighting infrastructure issue detected. The image shows a non-functional or damaged streetlight that affects public safety, especially during nighttime.',
                severity: 'Medium - Public safety concern',
                action: 'Electrical repair or bulb replacement needed'
            };
        }

        if (fileName.includes('drain') || fileName.includes('sewer') || fileName.includes('water') || fileName.includes('flood')) {
            return {
                title: 'Drainage System Problem',
                rawDescription: 'Drainage or water logging issue',
                description: 'Drainage system malfunction detected. The image shows water logging, blocked drains, or sewage overflow that requires immediate attention to prevent flooding and health hazards.',
                severity: 'High - Flooding risk',
                action: 'Drainage cleaning and repair required'
            };
        }

        if (fileName.includes('road') || fileName.includes('street') || fileName.includes('pavement')) {
            return {
                title: 'Road Infrastructure Issue',
                rawDescription: 'Road or pavement infrastructure problem',
                description: 'Road infrastructure problem detected. The image shows damage or deterioration to road or pavement that affects traffic flow and pedestrian safety.',
                severity: 'Medium - Infrastructure maintenance needed',
                action: 'Road maintenance and repair required'
            };
        }

        if (fileName.includes('tree') || fileName.includes('branch')) {
            return {
                title: 'Tree/Vegetation Hazard',
                rawDescription: 'Fallen tree or hazardous branch',
                description: 'Tree or vegetation hazard detected. The image shows a fallen tree, broken branch, or overgrown vegetation that poses a safety risk or blocks public pathways.',
                severity: 'Medium - Safety hazard',
                action: 'Tree removal or trimming required'
            };
        }

        if (fileName.includes('sign') || fileName.includes('signal') || fileName.includes('traffic')) {
            return {
                title: 'Traffic Infrastructure Issue',
                rawDescription: 'Traffic sign or signal malfunction',
                description: 'Traffic infrastructure problem detected. The image shows damaged, missing, or malfunctioning traffic signs or signals that affect road safety and traffic management.',
                severity: 'High - Traffic safety concern',
                action: 'Sign/signal repair or replacement needed'
            };
        }

        // Default for unrecognized issues
        return {
            isGeneric: true, // Marker for unknown issue type that validation Logic can use to REJECT
            title: 'Civic Infrastructure Issue',
            rawDescription: 'General civic infrastructure problem',
            description: 'A civic infrastructure issue has been reported. Please review the attached image to identify the specific problem. The issue requires assessment and appropriate action from the municipal department.',
            severity: 'To be assessed',
            action: 'Assessment and appropriate action required'
        };
    }
};
