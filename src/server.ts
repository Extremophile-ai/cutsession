import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes";

dotenv.config();
const app = express();

app.use(express.json({ limit: "100mb" }));

app.use(
	express.urlencoded({ limit: "100mb", extended: true, parameterLimit: 50000 })
);

app.use(cors());

const PORT = process.env.PORT || 5100;

app.use("/", routes);

app.use("/", (_req, res) => {
	res.send(`cutsession API running on port ${PORT}`);
});

app.listen(PORT, () => {
	console.log(`⚡️[server]: Server is running on PORT:${PORT}`);
});
