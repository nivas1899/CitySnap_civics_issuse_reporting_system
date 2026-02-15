// SambaNova AI Service for Image Analysis
const SAMBANOVA_API_KEY = "f6bf0158-49f5-40a0-9065-7894f15a711a";
const SAMBANOVA_BASE_URL = "https://api.sambanova.ai/v1";
const VISION_MODEL = "Llama-3.2-90B-Vision-Instruct";

export const aiService = {
    /**
     * Convert image file to base64
     */
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Data = reader.result.split(',')[1];
                resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    async generateCaption(imageFile) {
        try {
            console.log("🚀 Generating caption with SambaNova AI...");

            // Convert image to base64
            const base64Image = await this.fileToBase64(imageFile);

            // Create prompt for civic issue analysis
            const prompt = `Analyze this image for civic issues reported by a citizen.

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
}`;

            // Make API request to SambaNova
            const response = await fetch(`${SAMBANOVA_BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SAMBANOVA_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: VISION_MODEL,
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: prompt
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:image/jpeg;base64,${base64Image}`
                                    }
                                }
                            ]
                        }
                    ],
                    temperature: 0.1,
                    max_tokens: 1024
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`SambaNova API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;

            console.log("✅ SambaNova AI SUCCESS - Raw response:", aiResponse);

            // Parse JSON from response
            const cleanText = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsedData = JSON.parse(cleanText);

            return {
                title: parsedData.title,
                description: `${parsedData.description}\n\n**Severity:** ${parsedData.severity}\n**Recommended Action:** ${parsedData.action}`,
                isCivicIssue: parsedData.isCivicIssue,
                validationReason: parsedData.validationReason,
                rawCaption: "Analysis by SambaNova AI"
            };

        } catch (err) {
            console.error("❌ SambaNova AI Error:", {
                errorMessage: err.message,
                errorName: err.name,
                fullError: err
            });

            // Use fallback
            console.warn("⚠️ Using fallback logic (manual description)");
            return this.generateFallbackCaption(imageFile);
        }
    },

    generateFallbackCaption(imageFile) {
        const timestamp = new Date().toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
        const fileSize = (imageFile.size / 1024).toFixed(2);

        // Extract meaningful information from filename
        const fileName = imageFile.name.replace(/\.[^/.]+$/, "").toLowerCase();

        // Detect issue type from filename
        const issueType = this.detectIssueType(fileName);

        // Allow submission with generic description if AI fails
        if (issueType.isGeneric) {
            console.warn("AI analysis failed and filename is generic. Allowing submission with generic description.");
            return {
                title: "Civic Infrastructure Issue Reported",
                rawDescription: "Civic infrastructure problem requiring assessment",
                description: `A civic infrastructure issue has been reported. Please review the attached image to identify the specific problem.\n\n**Reported:** ${timestamp}\n**Image file:** ${imageFile.name} (${fileSize} KB)\n\n**Note:** AI analysis was unavailable. Manual review required.`,
                isCivicIssue: true,
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
            isCivicIssue: true,
            validationReason: "Issue identified from file details"
        };
    },

    /**
     * Detect issue type from filename (Legacy regex method kept for fallback)
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
            isGeneric: true,
            title: 'Civic Infrastructure Issue',
            rawDescription: 'General civic infrastructure problem',
            description: 'A civic infrastructure issue has been reported. Please review the attached image to identify the specific problem. The issue requires assessment and appropriate action from the municipal department.',
            severity: 'To be assessed',
            action: 'Assessment and appropriate action required'
        };
    }
};
