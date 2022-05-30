import express from "express";
import { dirname, join } from "path";
import { JSONFile, Low } from "lowdb";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const apiRouter = express.Router();

// Database Init
const file = join(__dirname, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

apiRouter.use(express.json());

apiRouter.get("/posts", async (req, res) => {
  await db.read();
  db.data ||= { increment: 0, posts: [] };
  const securePosts = db.data.posts.map(({ id, name, title, content }) => ({
    id,
    name,
    title,
    content,
  }));
  res.json({
    success: true,
    result: securePosts,
  });
});

apiRouter.post("/posts", async (req, res) => {
  const body = req.body;
  if (!body.name || !body.title || !body.content || !body.password) {
    res.sendStatus(500).send("Wrong post definition");
    return;
  }
  await db.read();
  db.data ||= { increment: 0, posts: [] };
  const post = {
    id: db.data.increment,
    name: body.name,
    title: body.title,
    content: body.content,
    password: body.password,
  };
  db.data.increment += 1;
  db.data.posts.push(post);
  await db.write();
  res.json({
    success: true,
    result: post,
  });
});

apiRouter.put("/posts/:postId", async (req, res) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Basic ")
  ) {
    res.sendStatus(403).send("Wrong authorization sent.");
    return;
  }
  const body = req.body;
  if (!body.name && !body.title && !body.content) {
    res.sendStatus(500).send("Wrong post definition.");
    return;
  }
  await db.read();
  const targetIdx = db.data.posts.findIndex(
    (post) => post.id === parseInt(req.params.postId)
  );
  if (targetIdx < 0) {
    res.sendStatus(404).send("Not found");
    return;
  }
  const target = db.data.posts[targetIdx];
  const auth = req.headers.authorization.split(" ")[1];
  const authDecoded = Buffer.from(auth, "base64").toString("utf8").split(":");
  if (
    authDecoded.length < 2 ||
    authDecoded[0] !== target.name ||
    authDecoded[1] !== target.password
  ) {
    res.sendStatus(401).send("Unauthorized");
    return;
  }
  const modifiedPost = {
    ...target,
    ...(body.name && { name: body.name }),
    ...(body.title && { title: body.title }),
    ...(body.content && { content: body.content }),
  };
  db.data.posts[targetIdx] = modifiedPost;
  await db.write();
  res.json({
    success: true,
    result: modifiedPost,
  });
});

apiRouter.delete("/posts/:postId", async (req, res) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Basic ")
  ) {
    res.sendStatus(403).send("Wrong authorization sent.");
    return;
  }
  await db.read();
  const targetIdx = db.data.posts.findIndex(
    (post) => post.id === parseInt(req.params.postId)
  );
  if (targetIdx < 0) {
    res.sendStatus(404).send("Not found");
    return;
  }
  const target = db.data.posts[targetIdx];
  const auth = req.headers.authorization.split(" ")[1];
  const authDecoded = Buffer.from(auth, "base64").toString("utf8").split(":");
  if (
    authDecoded.length < 2 ||
    authDecoded[0] !== target.name ||
    authDecoded[1] !== target.password
  ) {
    res.sendStatus(401).send("Unauthorized");
    return;
  }
  db.data.posts.splice(targetIdx, 1);
  await db.write();
  res.json({
    success: true,
    result: target,
  });
});