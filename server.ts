import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import cors from "cors";
import Razorpay from "razorpay";
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === "production";
const PORT = 3000;

async function startServer() {
  try {
    const app = express();
    app.use(express.json());
    app.use(cors());

    // Razorpay Instance
    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
    });

    // API Routes
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok", mode: isProd ? 'production' : 'development' });
    });

    // Razorpay Order Creation
    app.post("/api/payments/order", async (req, res) => {
      const { amount, currency = "INR", receipt } = req.body;
      try {
        const order = await razorpay.orders.create({
          amount: amount * 100, // amount in smallest currency unit
          currency,
          receipt,
        });
        res.json(order);
      } catch (error) {
        console.error("Razorpay order error:", error);
        res.status(500).json({ error: "Failed to create order" });
      }
    });

    // Vite Integration
    if (!isProd) {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      
      // Explicitly serve index.html for the root if vite middleware doesn't
      app.get('*', async (req, res, next) => {
        const url = req.originalUrl;
        if (url.startsWith('/api')) return next();
        try {
          let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          next(e);
        }
      });
      console.log("Vite middleware and fallback loaded");
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
      console.log("Serving static files from dist");
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();
