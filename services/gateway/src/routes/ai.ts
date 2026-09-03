import { Router, type Request, type Response } from 'express';
import { productServiceClient, orderServiceClient } from '../grpc-clients.js';
import { logger } from '../logger.js';

export const aiRoutes = Router();

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ============================================
// Helper: Fetch all products via gRPC
// ============================================
function fetchProductsFromGrpc(query = ''): Promise<any[]> {
  return new Promise((resolve) => {
    productServiceClient.searchProducts(
      { query, page: 1, pageSize: 50 },
      (err: any, response: any) => {
        if (err || !response?.products) {
          // Fallback to listProducts
          productServiceClient.listProducts({ page: 1, pageSize: 50 }, (listErr: any, listResp: any) => {
            if (listErr || !listResp?.products) {
              resolve([]);
            } else {
              resolve(listResp.products);
            }
          });
          return;
        }
        resolve(response.products);
      },
    );
  });
}

// ============================================
// Helper: Fetch order details by number
// ============================================
function fetchOrderByNumber(orderNumber: string): Promise<any | null> {
  return new Promise((resolve) => {
    orderServiceClient.listOrders({ page: 1, pageSize: 20 }, (err: any, response: any) => {
      if (err || !response?.orders) {
        resolve(null);
        return;
      }
      const match = response.orders.find((o: any) =>
        o.orderNumber?.toLowerCase() === orderNumber.toLowerCase(),
      );
      resolve(match || null);
    });
  });
}

// ============================================
// Smart Local Fallback NLP Engine
// ============================================
async function generateSmartReply(userMessage: string, allProducts: any[]) {
  const text = userMessage.toLowerCase().trim();

  // 1. Order Tracking Check
  const orderMatch = text.match(/\b(bkd-[a-z0-9]+)\b/i) || text.match(/order\s*#?\s*([a-z0-9\-]+)/i);
  if (orderMatch) {
    const code = orderMatch[1].toUpperCase();
    const liveOrder = await fetchOrderByNumber(code);

    if (liveOrder) {
      return {
        reply: `📦 **Order Found!** (#${liveOrder.orderNumber})\n- **Status**: \`${liveOrder.status}\`\n- **Total**: ₹${parseFloat(liveOrder.total).toLocaleString('en-IN')}\n- **Delivery To**: ${liveOrder.shippingAddress?.city || 'Your address'}\n\nYour order is confirmed and being prepared for express delivery!`,
        products: [],
        suggestedPrompts: ['Show trending audio gear', 'Best deals under ₹2,000', 'Return & Refund Policy'],
      };
    }

    return {
      reply: `📦 Looking up Order #${code}... If you recently placed this order, it is confirmed and being prepared for quality check and express dispatch! You can check real-time updates in your **Orders** tab.`,
      products: [],
      suggestedPrompts: ['Show trending audio gear', 'Best deals under ₹2,000', 'Return & Refund Policy'],
    };
  }

  // 2. Extract Price Constraint (e.g. "under 3000", "below 2000", "less than 1500")
  let maxPrice: number | null = null;
  const priceMatch = text.match(/(?:under|below|less than|within|budget)\s*(?:₹|rs\.?|inr)?\s*(\d+[\d,]*)/i);
  if (priceMatch) {
    maxPrice = parseInt(priceMatch[1].replace(/,/g, ''), 10);
  }

  // 3. Category & Keyword Matching
  const keywords = text
    .replace(/[^\w\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['show', 'want', 'need', 'find', 'best', 'good', 'give', 'under', 'below', 'bhai'].includes(w));

  let matched = allProducts.filter((p) => {
    const nameMatch = keywords.some((k) => p.name?.toLowerCase().includes(k) || p.description?.toLowerCase().includes(k) || p.categoryName?.toLowerCase().includes(k));
    const priceOk = maxPrice !== null ? p.price <= maxPrice : true;
    return (keywords.length === 0 || nameMatch) && priceOk;
  });

  // If no direct keyword match, but price constraint exists
  if (matched.length === 0 && maxPrice !== null) {
    matched = allProducts.filter((p) => p.price <= maxPrice);
  }

  // If still empty, fall back to top rated
  if (matched.length === 0) {
    matched = [...allProducts].sort((a, b) => (b.rating || 5) - (a.rating || 5)).slice(0, 4);
  } else {
    matched = matched.slice(0, 4);
  }

  // 4. Formulate contextual conversational reply
  let reply = '';
  if (text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('namaste')) {
    reply = `Namaste! 🙏 Welcome to **BhaiKiDukaan**! I am your AI Shopping Copilot. Looking for high-performance audio gear, smartwatches, or trending accessories? Tell me your budget or what you need, and I'll find the best picks for you!`;
  } else if (text.includes('deal') || text.includes('discount') || text.includes('offer')) {
    reply = `🔥 Here are the hottest bestselling deals with maximum savings right now on BhaiKiDukaan! Click on any item below to add it directly to your cart:`;
  } else if (maxPrice) {
    reply = `Bhai, I found these top-rated products under **₹${maxPrice.toLocaleString('en-IN')}** for you! All items come with 1-Year Brand Warranty and Free Express Delivery.`;
  } else if (keywords.length > 0) {
    reply = `Great choice! Here are the best **${keywords.join(' ')}** items in our store right now, rated by our verified customers:`;
  } else {
    reply = `Here are some of our highest-rated recommendations hand-picked for you today! What kind of product or budget are you targeting?`;
  }

  return {
    reply,
    products: matched,
    suggestedPrompts: [
      '🎧 Wireless Earbuds with ANC',
      '🔥 Top Deals Under ₹2,999',
      '⚡ Smartwatches with AMOLED',
      '📦 How do returns work?',
    ],
  };
}

// ============================================
// Google Gemini API Engine (when key configured)
// ============================================
async function callGeminiAi(userMessage: string, history: ChatMessage[], allProducts: any[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const catalogSummary = allProducts.slice(0, 20).map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      rating: p.rating,
      category: p.categoryName,
      inStock: p.inStock,
    }));

    const systemPrompt = `You are "Bhai AI", the friendly, super-smart, and helpful AI Shopping Assistant for "BhaiKiDukaan" (an Indian premium e-commerce store).
Your goal:
1. Recommend the best products from the catalog based on the user's budget and preferences.
2. Speak in a warm, polite, enthusiastic modern Indian e-commerce style (English with natural Indian hospitality).
3. If recommending specific products, mention their names clearly.
4. Output your answer in JSON format with:
   {
     "reply": "Your conversational message with markdown",
     "recommendedProductIds": ["id1", "id2"],
     "suggestedPrompts": ["Next question 1", "Next question 2"]
   }

Current Available Store Catalog:
${JSON.stringify(catalogSummary)}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...history.slice(-4).map((h) => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
          })),
          { role: 'user', parts: [{ text: userMessage }] },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      logger.warn({ status: response.status }, 'Gemini API call failed, falling back to smart heuristic');
      return null;
    }

    const data = (await response.json()) as any;
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    const recommendedIds = Array.isArray(parsed.recommendedProductIds) ? parsed.recommendedProductIds : [];
    const matchedProducts = allProducts.filter((p) => recommendedIds.includes(p.id));

    return {
      reply: parsed.reply || 'Here are the best picks for you!',
      products: matchedProducts.length > 0 ? matchedProducts : allProducts.slice(0, 3),
      suggestedPrompts: Array.isArray(parsed.suggestedPrompts) ? parsed.suggestedPrompts : [
        '🔥 Top Deals Today',
        '🎧 Best Bass Earphones',
        '📦 Track my order',
      ],
    };
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Error calling Gemini API');
    return null;
  }
}

// ============================================
// Route: POST /api/ai/chat
// ============================================
aiRoutes.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message = '', history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // 1. Fetch live product catalog
    const allProducts = await fetchProductsFromGrpc();

    // 2. Try Gemini LLM if API Key is configured
    let aiResponse = await callGeminiAi(message, history, allProducts);

    // 3. Fallback to smart heuristic NLP engine
    if (!aiResponse) {
      aiResponse = await generateSmartReply(message, allProducts);
    }

    res.json({
      reply: aiResponse.reply,
      products: aiResponse.products,
      suggestedPrompts: aiResponse.suggestedPrompts,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, '❌ AI chat error');
    res.status(500).json({
      reply: 'Oops! I encountered a small hiccup connecting to the assistant. Please try asking again!',
      products: [],
      suggestedPrompts: ['Show trending products', 'Best deals under ₹2,000'],
    });
  }
});
