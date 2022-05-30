import express from "express";
import { apiRouter, db } from "./api.js";

// Express Init
const app = express();
const port = 3000;

// Set template engine to ejs
app.set("view engine", "ejs");

// front page serving
app.get("/", async (req, res) => {
  await db.read();
  db.data ||= { increment: 0, posts: [] };
  res.render("index", {
    posts: db.data.posts,
  });
});

app.use("/api", apiRouter);

// static file serving
app.use(express.static("public"));

app.listen(port, () => {
  console.log(`webprogramming-project app listening on port ${port}`);
});
