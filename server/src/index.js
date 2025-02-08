import { configDotenv } from "dotenv";
import app from "./app.js";
import connectDB from "./config/db-connect.js";

configDotenv({
    path: "./.env",
});

const PORT = process.env.PORT || 4004;

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`🛜  Server is running on port ${PORT}`);
    });
})
.catch((err) => {
    console.error(`❌  Error connecting to the database: ${err.message}`);
});
