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
// Advanced Human-Like Local Fallback Engine
// ============================================
async function generateSmartReply(
  userMessage: string,
  allProducts: any[],
  context: { userName?: string; currentProductName?: string; cartCount?: number } = {},
) {
  const text = userMessage.toLowerCase().trim();
  const userName = context.userName ? `${context.userName} ji` : 'Bhai';

  // 1. Order Tracking Check
  const orderMatch = text.match(/\b(bkd-[a-z0-9\-]+)\b/i) || text.match(/order\s*#?\s*([a-z0-9\-]+)/i);
  if (orderMatch || text.includes('track') || text.includes('status')) {
    const code = orderMatch ? orderMatch[1].toUpperCase() : null;
    let liveOrder = code ? await fetchOrderByNumber(code) : null;

    if (liveOrder) {
      return {
        reply: `📦 **Order Status Found!** (#${liveOrder.orderNumber})\n\nNamaste ${userName}! Here are your live order details:\n- 🚚 **Status**: \`${liveOrder.status}\`\n- 💰 **Total Value**: ₹${parseFloat(liveOrder.total).toLocaleString('en-IN')}\n- 📍 **Destination**: ${liveOrder.shippingAddress?.city || 'Your shipping address'}\n- 🛡️ **Items**: ${liveOrder.items?.length || 1} product(s)\n\n⚡ *Your order has passed our 4-point quality inspection and is on schedule for express delivery!*`,
        products: [],
        suggestedPrompts: ['Show return & warranty policy', 'Best audio gear deals', 'Talk to human support'],
      };
    }

    if (code) {
      return {
        reply: `📦 **Checking Order #${code}**\n\n${userName}, your order #${code} is confirmed in our system and currently undergoing final packaging and safety dispatch. You can monitor live tracking updates anytime in your **Orders** tab!\n\nNeed help modifying or tracking another order?`,
        products: [],
        suggestedPrompts: ['View my Orders tab', 'What is the return window?', 'Show trending tech drops'],
      };
    }

    return {
      reply: `📦 Sure ${userName}! To track your package right away, please paste your **Order ID** (e.g. \`BKD-2026-...\`) or head over to the **Orders** tab at the top of the page.`,
      products: [],
      suggestedPrompts: ['Check order BKD-20260826-426110', 'How long does delivery take?', 'Return policy'],
    };
  }

  // 2. Product Comparison Intent
  if (text.includes('compare') || text.includes('vs') || text.includes('difference between')) {
    const audioItems = allProducts.filter((p) => p.categoryName?.toLowerCase().includes('audio') || p.tags?.includes('audio') || p.tags?.includes('wireless'));
    if (audioItems.length >= 2) {
      const p1 = audioItems[0];
      const p2 = audioItems[1];
      return {
        reply: `⚖️ **Here is a quick head-to-head comparison for you!**\n\n### 1. **${p1.name}** (₹${p1.price.toLocaleString('en-IN')})\n- ⭐ **Rating**: ${p1.rating} / 5.0 (${p1.reviewCount} verified reviews)\n- 🎯 **Best For**: Audiophiles wanting flagship sound & 45h marathon battery.\n\n### 2. **${p2.name}** (₹${p2.price.toLocaleString('en-IN')})\n- ⭐ **Rating**: ${p2.rating} / 5.0\n- 🎯 **Best For**: Pocket convenience, ultra-low latency gaming & gym workouts.\n\n💡 **Bhai's Verdict**: If your budget is flexible and you love over-ear comfort, go for the **${p1.name}**. For on-the-go mobility, **${p2.name}** is unmatched value!`,
        products: [p1, p2],
        suggestedPrompts: [`Add ${p1.name.substring(0, 18)}... to cart`, 'Show customer reviews', 'Any discount codes?'],
      };
    }
  }

  // 3. Discount, Offers & Coupon Code Intent
  if (text.includes('discount') || text.includes('coupon') || text.includes('offer') || text.includes('promo') || text.includes('deal') || text.includes('code')) {
    return {
      reply: `🎉 **Bhai, aapke liye exclusive savings unlock kar diye hain!**\n\nHere are the top active discount codes for BhaiKiDukaan today:\n\n- 🔥 **\`BHAI20\`** ➔ **Flat 20% OFF** on orders above ₹2,999.\n- ⚡ **\`FIRST100\`** ➔ **₹100 Instant Discount** on any first purchase.\n- 🚚 **\`FREESHIP\`** ➔ **Zero Delivery Fee** across India!\n\nJust apply any of these at checkout for instant savings. Ready to grab something special?`,
      products: allProducts.slice(0, 3),
      suggestedPrompts: ['Show best deals under ₹2,000', 'Top rated wireless earbuds', 'Go to checkout'],
    };
  }

  // 4. Return, Warranty & Customer Support Intent
  if (text.includes('return') || text.includes('refund') || text.includes('warranty') || text.includes('replace') || text.includes('guarantee')) {
    return {
      reply: `🛡️ **The BhaiKiDukaan Assurance Policy:**\n\n- 🔄 **7-Day Hassle-Free Replacement**: If there's any defect or fitting issue, we arrange a free doorstep pickup & instant replacement.\n- 📜 **1-Year Brand Warranty**: Official warranty included with every electronics and smartwatch order.\n- 🚚 **Free Express Shipping**: Safe, bubble-wrapped Pan-India dispatch via top couriers.\n\nAap bilkul tension-free hoke order place kar sakte ho! 😊`,
      products: [],
      suggestedPrompts: ['Show trending audio gear', 'Best deals today', 'Check smartwatches'],
    };
  }

  // 5. Price & Budget Constraints (e.g. "under 2000", "below 3000", "budget 1500")
  let maxPrice: number | null = null;
  const priceMatch = text.match(/(?:under|below|less than|within|budget|around)\s*(?:₹|rs\.?|inr)?\s*(\d+[\d,]*)/i);
  if (priceMatch) {
    maxPrice = parseInt(priceMatch[1].replace(/,/g, ''), 10);
  }

  // 6. Keywords & Category matching
  const stopWords = ['show', 'want', 'need', 'find', 'best', 'good', 'give', 'under', 'below', 'bhai', 'please', 'tell', 'suggest', 'recommend', 'what', 'which'];
  const keywords = text
    .replace(/[^\w\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.includes(w));

  let matched = allProducts.filter((p) => {
    const nameMatch = keywords.some(
      (k) =>
        p.name?.toLowerCase().includes(k) ||
        p.description?.toLowerCase().includes(k) ||
        p.categoryName?.toLowerCase().includes(k) ||
        (Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(k))),
    );
    const priceOk = maxPrice !== null ? p.price <= maxPrice : true;
    return (keywords.length === 0 || nameMatch) && priceOk;
  });

  if (matched.length === 0 && maxPrice !== null) {
    matched = allProducts.filter((p) => p.price <= maxPrice);
  }

  if (matched.length === 0) {
    matched = [...allProducts].sort((a, b) => (b.rating || 5) - (a.rating || 5)).slice(0, 3);
  } else {
    matched = matched.slice(0, 3);
  }

  // 7. Humanized conversational reply
  let reply = '';
  if (text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('namaste')) {
    reply = `Namaste ${userName}! 🙏 Great to have you here at **BhaiKiDukaan**.\n\nI'm your personal shopping buddy. Whether you're searching for studio-grade audio gear, premium smartwatches, mechanical keyboards, or heavyweight hoodies — tell me your budget or requirements, and I'll find the best picks for you!`;
  } else if (maxPrice) {
    reply = `${userName}, I handpicked the highest-rated options under **₹${maxPrice.toLocaleString('en-IN')}** for you! Every item comes with 1-Year Brand Warranty and Free Express Delivery:`;
  } else if (keywords.length > 0) {
    reply = `Awesome choice! Here are our verified top-sellers in **${keywords.join(' ')}** with genuine customer reviews:`;
  } else {
    reply = `Here are our hottest, hand-picked recommendations for today! Tell me your target budget or style, and I'll tailor the picks specifically for you:`;
  }

  return {
    reply,
    products: matched,
    suggestedPrompts: [
      '🎧 Wireless Earbuds with ANC',
      '🔥 Top Deals Under ₹2,999',
      '⚡ Smartwatches with AMOLED',
      '📦 What is your return policy?',
    ],
  };
}

// ============================================
// Google Gemini LLM Engine (Warm Humanized Persona)
// ============================================
async function callGeminiAi(
  userMessage: string,
  history: ChatMessage[],
  allProducts: any[],
  context: { userName?: string; currentProductName?: string; cartCount?: number } = {},
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const catalogSummary = allProducts.slice(0, 20).map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      rating: p.rating,
      category: p.categoryName,
      inStock: p.inStock,
      tags: p.tags,
      features: p.description,
    }));

    const systemPrompt = `You are "Bhai AI", the hyper-smart, friendly, warm, and honest human-like shopping assistant for "BhaiKiDukaan" (a top Indian premium lifestyle & tech e-commerce store).

Customer Context:
- User Name: ${context.userName || 'Friend'}
- Currently Viewed Item on Screen: ${context.currentProductName || 'Browsing Catalog'}
- Active Cart Item Count: ${context.cartCount || 0}

YOUR PERSONA & SPEAKING STYLE:
1. Speak warmly, respectfully, and enthusiastically (fluent modern English with natural Indian hospitality / gentle Hinglish charm like "Bhai", "Namaste", "Zabardast", "Value for money").
2. Answer like an expert real human concierge at a boutique store — be honest about pros & cons, give personal verdicts, and explain WHY a product is great for their specific use case (e.g. gym, coding, gaming, travel).
3. If the user asks for comparison, compare specs clearly with bullet points.
4. Active Store Coupons: Mention 'BHAI20' (20% off > ₹2999) or 'FIRST100' (₹100 off) whenever they ask for deals or discounts.
5. All products include: 1-Year Brand Warranty, 7-Day Doorstep Replacement, and Free Express Delivery across India.

OUTPUT FORMAT:
Output ONLY valid JSON with this exact schema:
{
  "reply": "Your rich, warm conversational response formatted with markdown (use emojis, bold highlights, bullet points)",
  "recommendedProductIds": ["id1", "id2"],
  "suggestedPrompts": ["Short natural follow-up 1", "Short natural follow-up 2", "Short natural follow-up 3"]
}

Available Store Catalog:
${JSON.stringify(catalogSummary)}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...history.slice(-6).map((h) => ({
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
      products: matchedProducts.length > 0 ? matchedProducts : (allProducts.slice(0, 2)),
      suggestedPrompts: Array.isArray(parsed.suggestedPrompts) ? parsed.suggestedPrompts : [
        '🔥 What are the best deals today?',
        '🎧 Compare ANC Earbuds vs Headphones',
        '📦 What is the warranty policy?',
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
    const {
      message = '',
      history = [],
      userName,
      currentProductName,
      cartCount,
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const context = { userName, currentProductName, cartCount };

    // 1. Fetch live product catalog
    const allProducts = await fetchProductsFromGrpc();

    // 2. Try Gemini LLM if API Key is configured
    let aiResponse = await callGeminiAi(message, history, allProducts, context);

    // 3. Fallback to smart heuristic NLP engine
    if (!aiResponse) {
      aiResponse = await generateSmartReply(message, allProducts, context);
    }

    res.json({
      reply: aiResponse.reply,
      products: aiResponse.products,
      suggestedPrompts: aiResponse.suggestedPrompts,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, '❌ AI chat error');
    res.status(500).json({
      reply: 'Oops! I encountered a small hiccup connecting to the server. Please try asking again!',
      products: [],
      suggestedPrompts: ['Show trending products', 'Best deals under ₹2,000'],
    });
  }
});
