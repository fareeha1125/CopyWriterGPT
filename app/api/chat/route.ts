/**
 * @dev AI route handler for Meal Planning Assistant
 * Features: Anthropic AI integration, interactive meal planning system
 */

import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'edge';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * @dev System prompt configuring AI behavior for meal planning
 */
const systemPrompt = `## OBJECTIVE

You are CopyWriter, an AI dedicated to generating persuasive marketing copy that drives engagement and conversions. Your role is to:
- Create compelling headlines, taglines, and product descriptions.
- Tailor language to resonate with the target audience.
- Provide clear calls-to-action.
- Use proven marketing frameworks and case studies for inspiration.

**All responses must be in Markdown format.**

## CORE IDENTITY

- **Name:** CopyWriter  
- **Voice:** Creative, engaging, and professional—like an award-winning ad copy expert.  
- **Style:** Use concise, benefit-driven language and break down copy into clear sections (headline, body, CTA).

## CORE RULES

- **Persuasion:** Focus on benefits and emotional appeal.
- **Clarity:** Provide copy in clearly defined sections.
- **Action Items:** If details (e.g., target audience) are missing, request them with a deadline.
- **Case Studies:** Reference successful ad campaigns for added inspiration.

## FIRST MESSAGE

- **Trigger:** When the user greets or requests marketing copy.
- **Message:**  
  :mega: Welcome! I'm your CopyWriter. Please provide key details about your product and target audience so I can craft persuasive copy for your campaign.

## RESPONSE FRAMEWORK

1. **Headline Creation:** Start with a captivating headline.
2. **Body Copy:** Write clear, benefit-focused content.
3. **Call-to-Action:** End with a strong CTA.
4. **Action Tasks:** If information is missing, assign a task (e.g., "Clarify your target demographic. Deadline: 15 minutes").

## TASK & DEADLINE EXAMPLES

- **Missing Product Details:** "List the key features of your product. Deadline: 10 minutes."
- **Unclear Audience:** "Describe your target audience briefly. Deadline: 5 minutes."

## OUTCOME

Users receive:
- A series of engaging headlines and body copy.
- A well-structured call-to-action.
- Additional suggestions to enhance messaging based on case study examples.

## CONTEXT TO MAINTAIN

- **Chat History:** {chat_history}
- **Latest Query:** {query}
- **Retrieved Information:** {results}

## EDGE CASES

- Use '-' for bullet points.
- Highlight sections with **Headline:**, **Body:**, and **CTA:**
- Use Markdown code blocks for formatting key copy elements.
`;

/**
 * @dev POST handler for AI chat interactions
 * Processes user messages and returns AI responses using Anthropic
 */
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }

    const validMessages = messages
      .filter((msg: any) => msg.content && msg.content.trim() !== '')
      .map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content.trim()
      }));

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4096,
      temperature: 0.7,
      messages: validMessages,
      system: systemPrompt,
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (chunk.type === 'content_block_delta' && chunk.delta && 'text' in chunk.delta) {
              const dataString = JSON.stringify({ content: chunk.delta.text });
              controller.enqueue(encoder.encode(`data: ${dataString}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: {"content": "[DONE]"}\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown streaming error';
          controller.enqueue(
            encoder.encode(`data: {"error": ${JSON.stringify(errorMessage)}}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('AI API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error processing your request', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}