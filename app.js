import express from "express";
import { apiRouter } from "./api.js";

// Express Init
const app = express();
const port = 3000;

// Set template engine to ejs
app.set("view engine", "ejs");

// front page serving
app.get("/", (req, res) => {
  res.render("index");
});

app.use("/api", apiRouter);

// static file serving
app.use(express.static("public"));

app.listen(port, () => {
  console.log(`webprogramming-project app listening on port ${port}`);
});
