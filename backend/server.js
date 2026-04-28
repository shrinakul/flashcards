import express from "express";
import pg from "pg";
import env from "dotenv";

env.config();
const app = express();

app.use(express.json());

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.get("/api/cards", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM flashcards ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cards" });
  }
});

app.post("/api/cards", async (req, res) => {
  const { question, answer } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO flashcards (question, answer) VALUES ($1, $2) RETURNING *",
      [question, answer],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to save card" });
  }
});

app.put("/api/cards/:id", async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;
  try {
    const result = await db.query(
      "UPDATE flashcards SET question = $1, answer = $2 WHERE id = $3 RETURNING *",
      [question, answer, id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

app.delete("/api/cards/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM flashcards WHERE id = $1", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

app.listen(3000, () => console.log("Backend running on port 3000"));
