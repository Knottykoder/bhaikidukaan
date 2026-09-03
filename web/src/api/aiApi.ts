import { apiSlice } from './apiSlice.js';
import { type Product } from '../types/product.js';
import { normalizeProduct } from './productsApi.js';

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface SendAiMessageRequest {
  message: string;
  history?: AiChatMessage[];
}

export interface SendAiMessageResponse {
  reply: string;
  products?: Product[];
  suggestedPrompts?: string[];
}

export const aiApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendAiMessage: builder.mutation<SendAiMessageResponse, SendAiMessageRequest>({
      query: (body) => ({
        url: '/ai/chat',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => {
        const rawProducts = Array.isArray(response.products) ? response.products : [];
        return {
          reply: response.reply || 'Here are some recommendations for you!',
          products: rawProducts.map(normalizeProduct),
          suggestedPrompts: Array.isArray(response.suggestedPrompts) ? response.suggestedPrompts : [],
        };
      },
    }),
  }),
});

export const {
  useSendAiMessageMutation,
} = aiApi;
