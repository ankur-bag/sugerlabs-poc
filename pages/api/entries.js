import dbConnect from "../../lib/mongodb";
import Entry from "../../models/Entry";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: Please log in." });
  }

  try {
    await dbConnect();
    console.log("Successfully connected to MongoDB");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    return res.status(500).json({ error: "Failed to connect to database" });
  }

  if (req.method === "GET") {
    try {
      const entries = await Entry.find({ userId }).sort({ createdAt: -1 });
      res.status(200).json({ entries });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  } else if (req.method === "POST") {
    try {
      const { activityType, projectName, reflections, summary } = req.body;
      const entry = await Entry.create({ userId, activityType, projectName, reflections, summary });
      res.status(201).json({ entry });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create entry" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
