import { NextResponse } from 'next/server';
import { HumanMessage } from '@langchain/core/messages';
import type { BaseMessage } from '@langchain/core/messages';
import { eliseeAgent } from '@/lib/agent';

interface AgentResult {
  messages: BaseMessage[];
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { message, sessionId, profile } = data;
    
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const config = { configurable: { thread_id: sessionId || 'default_thread' } };
    const inputMessage = new HumanMessage(message);

    const finalState = await eliseeAgent.invoke(
      { messages: [inputMessage], profile },
      config
    ) as AgentResult;

    const lastMsg = finalState.messages[finalState.messages.length - 1];
    return NextResponse.json({ reply: lastMsg.content });
  } catch (error: unknown) {
    console.error('AI Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
