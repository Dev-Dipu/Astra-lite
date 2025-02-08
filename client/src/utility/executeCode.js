import axios from "axios";

const piston = axios.create({
    baseURL: `https://emkc.org/api/v2/piston/`,
    headers: {
        "Content-Type": "application/json",
    },
});

import { runtimes } from "./constants";

const getVersionByLanguage = (language) => {
    const runtime = runtimes.find((runtime) => runtime.language === language);
    return runtime?.version; // Returns version if found, otherwise undefined
};

const executeCode = async (snippet, code, input="") => {
    let {title, language} = snippet;
    const version = getVersionByLanguage(snippet?.language);

    if (!version) {
        console.error("Version not found for the specified language");
        return;
    }

    if (language === "cplusplus") {
        language = "c++";
    }

    const res = await piston.post("/execute", {
        language: language,
        version: version, // Use the version retrieved from runtimes
        files: [
            {
                name: title || "astra", // File name
                content: code || "", // File content
            },
        ],
        stdin: input || "", 
    });

    console.log(res.data.run);
    return res.data.run;
};


export default executeCode;
