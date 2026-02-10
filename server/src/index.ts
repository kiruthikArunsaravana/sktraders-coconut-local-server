import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb, getDb } from "./db";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Initialize database
initDb().then(() => {
  console.log("Database initialized");
}).catch(err => {
  console.error("Failed to initialize database:", err);
});

// Allow all origins in development for simplicity (change for production)
app.use(cors());
app.use(express.json());

// Basic health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Coconut endpoints
app.get("/api/coconut", async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all("SELECT * FROM coconut_inputs ORDER BY date DESC");
    // map DB columns (snake_case) to frontend shape
    const mapped = rows.map(r => ({
      id: r.id,
      date: new Date(r.date).toISOString(),
      count: r.count,
      pricePerUnit: Number(r.price_per_unit),
      totalPrice: Number(r.total_price),
      clientName: r.client,
      paymentStatus: r.payment_status,
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/api/coconut", async (req, res) => {
  try {
    const { id, date, count, pricePerUnit, totalPrice, clientName, paymentStatus } = req.body;
    if (!id || !date || !count || !pricePerUnit || !totalPrice || !clientName) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const db = getDb();
    await db.run(
      `INSERT INTO coconut_inputs (id,date,count,price_per_unit,total_price,client,payment_status) VALUES (?,?,?,?,?,?,?)`,
      [id, date, count, pricePerUnit, totalPrice, clientName, paymentStatus || "pending"]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// app.delete("/api/coconut/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     await pool.execute(`DELETE FROM coconut_inputs WHERE id = ?`, [id]);
//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "DB error" });
//   }
// });

app.delete("/api/coconut/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    await db.run(`DELETE FROM coconut_inputs WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});


app.put("/api/coconut/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { count, pricePerUnit, totalPrice, clientName, paymentStatus } = req.body;
    if (!count || !pricePerUnit || !totalPrice || !clientName) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const db = getDb();
    await db.run(
      `UPDATE coconut_inputs SET count=?, price_per_unit=?, total_price=?, client=?, payment_status=? WHERE id=?`,
      [count, pricePerUnit, totalPrice, clientName, paymentStatus || "pending", id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// Labour endpoints
app.get("/api/labour", async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all("SELECT * FROM labour_wages ORDER BY date DESC");
    const mapped = rows.map(r => ({
      id: r.id,
      date: new Date(r.date).toISOString(),
      workerName: r.worker_name,
      days: Number(r.days),
      ratePerDay: Number(r.rate_per_day),
      totalWage: Number(r.total_wage),
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/api/labour", async (req, res) => {
  try {
    const { id, date, workerName, days, ratePerDay, totalWage } = req.body;
    if (!id || !date || !workerName || !days || !ratePerDay || !totalWage) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const db = getDb();
    await db.run(
      `INSERT INTO labour_wages (id,date,worker_name,days,rate_per_day,total_wage) VALUES (?,?,?,?,?,?)`,
      [id, date, workerName, days, ratePerDay, totalWage]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.delete("/api/labour/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    await db.run(`DELETE FROM labour_wages WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.put("/api/labour/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { workerName, days, ratePerDay, totalWage } = req.body;
    if (!workerName || !days || !ratePerDay || !totalWage) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const db = getDb();
    await db.run(
      `UPDATE labour_wages SET worker_name=?, days=?, rate_per_day=?, total_wage=? WHERE id=?`,
      [workerName, days, ratePerDay, totalWage, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// Client endpoints
app.get("/api/clients", async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all("SELECT * FROM clients ORDER BY name");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/api/clients", async (req, res) => {
  try {
    const { id, name } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const db = getDb();
    await db.run(
      `INSERT INTO clients (id, name) VALUES (?, ?)`,
      [id, name]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.delete("/api/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    await db.run(`DELETE FROM clients WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
