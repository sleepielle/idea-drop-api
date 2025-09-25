import express from "express";
import cors from "cors";
import dotenv from "dotenv";

//starting dotenv to use env variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8800;

//starting middleware
app.use(cors());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
