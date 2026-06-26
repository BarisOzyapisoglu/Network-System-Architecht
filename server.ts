import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily to avoid crashing on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API endpoint for AI assistant
app.post("/api/assistant", async (req, res) => {
  try {
    const { message, context } = req.body;
    const client = getAiClient();
    
    const systemInstruction = `
Sen "NetSim-Architect" uygulamasının uzman yapay zeka çekirdeğisin. Ağ ve Veri Merkezi Mimarı olarak, "Screw-to-Code" (Vidadan Koda) metodolojisini benimsersin.
Kullanıcılara tamamen TÜRKÇE, son derece profesyonel, açıklayıcı ve cesaretlendirici bir dille yanıt vermen gerekir.

Yanıtlarında şu kurallara kesinlikle uy:
1. Fiziksel Aşama: Kullanılan araçları (tornavidalar, kafes somunları, etiketleme makineleri), tam fiziksel yerleşimleri (U yükseklikleri), fiziksel arayüzleri (SFP+ modülleri, DAC, fiber alıcı-vericiler, RJ45 pinleri) detaylandır.
2. Mantıksal Aşama: Kesin konfigürasyon komutları (Cisco IOS, Juniper Junos veya Arista EOS CLI formatında), subnetting hesapları, yönlendirme protokolleri (BGP, OSPF) ve güvenlik kuralları sağla.
3. Kullanıcının ağ boyutuna göre yanıtları ölçeklendir. Soyut özetlerden kaçın, adım adım komut dizileri sun.
`;

    const prompt = `
Kullanıcı Ağ Altyapısı Bilgileri:
- Ofis Cihazları: ${context.officeEndpoints || "Belirtilmemiş"}
- Fabrika/OT Cihazları: ${context.otAssets || "Yok"}
- Veri Merkezi Cihazları: ${context.datacenterAssets || "Standart Dağıtım"}
- Güncel Faz: ${context.currentPhase || "Faz 1"}

Kullanıcı Mesajı:
${message}
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Yapay zeka yanıtı oluşturulurken bir hata oluştu." });
  }
});

// Start the server and mount Vite middleware
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
