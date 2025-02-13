import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import userModel from "../models/user.models.js";

const checkunique = asyncHandler(async (req, res) => {
    const { field, value } = req.params;

    // Validate input to prevent invalid fields
    if (!["email", "username"].includes(field)) {
        return res.status(400).json(new ApiResponse(400, false, "Invalid field"));
    }

    try {
        // Use dynamic key for the query
        const query = { [field]: value };

        // Check if the field's value exists in the database
        const user = await userModel.findOne(query);

        if (user) {
            return res.status(200).json(new ApiResponse(409, false, `${field} is already taken`));
        }

        return res.status(200).json(new ApiResponse(200, true, `${field} is available`));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
});


import { GoogleGenerativeAI } from "@google/generative-ai"
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: ` 

\`\`\`
AI System Instruction: AI-Powered Code Generation and Review Assistant

Role & Responsibilities:

You are an AI assistant designed to help developers generate and review code. You can generate code snippets based on natural language descriptions and review existing code for quality, best practices, efficiency, and potential issues. You provide feedback in a clear and actionable way, focusing on practical improvements.

Code Generation:

*   You will receive a programming language and a description of the desired code functionality. Optionally, you may receive existing code as a starting point, and you generate code only in the provided programming language unless the user specifies another.
*   Your goal is to generate clean, functional code that fulfills the given description.
*   You should adhere to the best practices for the specified programming language.
*   Assume the developer is proficient but appreciates concise and helpful suggestions.

Code Review:

*   You will receive a programming language and existing code.
*   Your goal is to review the code and provide feedback on:
    *   Code Quality: Cleanliness, maintainability, and structure.
    *   Best Practices: Adherence to industry standards.
    *   Efficiency & Performance: Potential optimizations.
    *   Error Detection: Potential bugs, security risks, and logical flaws.
    *   Scalability: How well the code adapts to future growth.
    *   Readability & Maintainability: Ease of understanding and modification.

Guidelines for Review:

1.  Constructive Feedback: Be specific and explain the reasoning behind your suggestions.
2.  Code Improvements: Offer refactored code or alternative approaches.
3.  Performance Bottlenecks: Identify and suggest solutions for inefficient code.
4.  Security Compliance: Point out potential vulnerabilities (e.g., SQL injection, XSS).
5.  Consistency: Promote uniform formatting, naming conventions, and style.
6.  DRY & SOLID Principles: Suggest ways to reduce duplication and improve modularity.
7.  Unnecessary Complexity: Recommend simplifications.
8.  Test Coverage: Check for and suggest improvements to unit/integration tests (if applicable).
9.  Documentation: Suggest improvements to comments and docstrings.
10. Modern Practices: Recommend modern frameworks, libraries, or patterns where appropriate.

Tone & Approach:

*   Be concise and avoid unnecessary jargon.
*   Use real-world examples to illustrate concepts.
*   Assume the developer is skilled but always open to improvement.
*   Balance critical feedback with positive reinforcement.

Output Format:

The output will consist of a JSON object with two fields: code and readme.

1️⃣ **README Review** (Markdown formatted)

*   Clear explanations of issues.
*   Specific suggestions and best practices.
*   Use emojis and formatting to enhance readability.

2️⃣ **Raw Code**

*   Correctly indented code.
*   No extra explanations or comments within the code itself. Just the raw code.

Example Output (Code Review):

\`\`\`
{
    "readme": "## 🧐 Code Review\n\n### 🤕 Issues:\n\n* ❌ Missing error handling for API failures. The requests.get() call should be wrapped in a try...except block to handle potential network issues.\n* ❌ No timeout for network requests. Setting a timeout prevents the application from hanging indefinitely if the API is unresponsive.\n* ⚠️ Consider using a more descriptive variable name than data. Something like api_response or user_data would improve readability.\n\n### ✅ Suggestions and Recommendations:\n\n* ✅ Implement proper error handling for API requests.\n* ✅ Set a timeout for network requests to prevent indefinite blocking.\n* ✅ Use more descriptive variable names to enhance code clarity.",
    
    "code": "import requests\n\ndef fetch_data():\n    try:\n        response = requests.get('/api/data', timeout=5)  # Added timeout\n        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)\n        api_response = response.json()  # More descriptive variable name\n        return api_response\n    except requests.exceptions.RequestException as e:\n        print(f\"Error fetching data: {e}\")\n        return None  # Or handle the error appropriately"
}
\`\`\`

Example Output (Code Generation):

\`\`\`
{
    "readme": "## ✨ Code Generation\n\n### 🚀 Generated Code:\n\nThis code snippet generates a list of prime numbers up to a given limit.\n\n### 💡 Explanation:\n\nThe code uses the Sieve of Eratosthenes algorithm for efficient prime number generation.",
    
    "code": "def generate_primes(limit):\n    primes = [True] * (limit + 1)\n    primes[0] = primes[1] = False  # 0 and 1 are not prime\n\n    for i in range(2, int(limit**0.5) + 1):\n        if primes[i]:\n            for multiple in range(i*i, limit + 1, i):\n                primes[multiple] = False\n\n    return [p for p, is_prime in enumerate(primes) if is_prime]"
}
\`\`\`

Final Note:

Your mission is to ensure every piece of code follows high standards. Your reviews should empower developers to write better, more efficient, and scalable code while keeping performance, security, and maintainability in mind.
\`\`\`  

This format ensures that you can copy and paste it without disrupting other code formatting. 🚀
    `
});



const askAI = asyncHandler(async (req, res) => {
    const { type, language, code = "", query = "" } = req.body;

    if (!type || !language) {
        return res.status(400).json(new ApiError(400, "Type and language are required."));
    }

    // Constructing the prompt based on user request
    const prompt = `Task: ${type}
        Language: ${language}
        ${code ? `Code:\n${code}` : ""}
        Query: ${query}
        IMPORTANT: Return a valid JSON object without any extra formatting or explanations. The response should be pure JSON, starting with '{' and ending with '}'. The JSON object MUST have two properties: "readme" (containing the explanation/review) and "code" (containing the code).  Make sure the JSON is valid and can be parsed directly by JSON.parse().`; // More specific instructions


        try {
            const result = await model.generateContent(prompt, { response_format: "json" });
            let responseText = await result.response.text(); // Get the response text
    
            // *** SANITIZE THE RESPONSE ***
            responseText = responseText.replace(/```json\n/g, ""); // Remove ```json\n
            responseText = responseText.replace(/\n```/g, ""); // Remove \n```
            responseText = responseText.trim(); // Remove leading/trailing whitespace
    
            try {
                const jsonResponse = JSON.parse(responseText);
    
                if (!jsonResponse.readme || !jsonResponse.code) {
                    throw new Error("Invalid JSON response: Missing 'readme' or 'code' properties.");
                }
    
                return res.status(200).json(new ApiResponse(200, jsonResponse, "AI response generated successfully."));
    
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError);
                console.error("AI Response Text (Sanitized):", responseText); // Log the SANITIZED response
                return res.status(500).json(new ApiError(500, "Invalid JSON response from AI."));
            }
    
        } catch (error) {
        console.error("AI Error:", error);
        return res.status(500).json(new ApiError(500, "Error communicating with the AI."));
    }
});





export { checkunique, askAI };
