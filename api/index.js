"use strict";
import express from "express";
import cors from "cors";
import { PORT } from "./configs.js";
import { getNewsFromDB } from "./db.js";
import { addNewsToCache, getNewsFromCache, publishNews } from "./redis.js";

// base express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// '/' endpoint to test the server
app.get("/", (_, res) => res.status(200).send("Hello World!"));

// '/get' endpoint to get all news
app.get("/get", async (_, res) => {
  try {
    // get the news from the cache
    const cachedNews = await getNewsFromCache();
    if (!cachedNews) {
      const news = await getNewsFromDB();
      res.status(200).send({ isCached: false, news: news });
      return await addNewsToCache(news);
    }
    res.status(200).send({ isCached: true, news: cachedNews });
  } catch (error) {
    res.status(500).send({ message: "Error getting news" });
  }
});

// set '/create' endpoint to create a new news
app.post("/create", async (req, res) => {
  try {
    const { text } = req.body;
    await publishNews(text);
    res.status(201).send({ message: "News created successfully" });
  } catch (error) {
    res.status(500).send({ message: "Error creating news" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
