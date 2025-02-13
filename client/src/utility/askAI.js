import axios from "./axios";

export async function askAI(type, language, code = "", query = "") {
    try {
        const response = await axios.post("/services/askai", {
            type,
            language,
            code,
            query,
        })

        return response?.data?.data; // { readme, code }
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}
