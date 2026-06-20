import { NextResponse } from 'next/server';
import { eliseeAgent } from '@/lib/agent';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { message, sessionId, profile } = data;
    
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const config = { configurable: { thread_id: sessionId || 'default_thread' } };
    const inputMessage = { role: "user", content: message };
    
    const finalState = await eliseeAgent.invoke(
      { messages: [inputMessage], profile }, 
      config
    );
    
    const lastMsg = finalState.messages[finalState.messages.length - 1];
    return NextResponse.json({ reply: lastMsg.content });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
