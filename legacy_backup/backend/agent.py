from typing import TypedDict, List, Optional, Annotated
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

class EliseeState(TypedDict):
    messages: Annotated[List, add_messages]           # Storia conversazione
    client_profile: Optional[dict]                    # Profilo cliente recuperato
    relevant_projects: List[dict]                     # Progetti simili dal RAG
    current_intent: Optional[str]                     # "visual_request", "quote", "info", "booking"
    tool_calls: List[dict]                            # Tool da eseguire
    generated_visuals: List[str]                      # URL o path delle immagini generate
    quote_draft: Optional[dict]                       # Preventivo in bozza
    needs_human_approval: bool                        # Per azioni sensibili
    final_response: Optional[str]

# === NODI ===

def retrieve_context(state: EliseeState):
    # Query vector DB con embedding dell'ultimo messaggio
    # profile = get_client_profile(state["messages"][-1])
    # projects = search_similar_projects(state["messages"][-1], top_k=8)
    return {"client_profile": {}, "relevant_projects": []}

def classify_intent(state: EliseeState):
    # LLM piccolo o prompt leggero per classificare
    # intent = classify_with_llm(state["messages"][-1].content)
    return {"current_intent": "info"}

def agent_reason(state: EliseeState):
    # LLM principale con tool calling abilitato
    # response = llm_with_tools.invoke([...])  
    return {"tool_calls": [], "messages": []}

def execute_tools(state: EliseeState):
    results = []
    for tool_call in state["tool_calls"]:
        # result = call_tool(tool_call)   # dispatch su visual_generator, quote_generator, etc.
        # results.append(result)
        pass
    return {"tool_results": results}

def visual_generator(state: EliseeState):
    # images = generate_visuals_with_flux(state)
    return {"generated_visuals": []}

def quote_generator(state: EliseeState):
    # quote = create_personalized_quote(state)
    return {"quote_draft": {}, "needs_human_approval": True}

def format_response(state: EliseeState):
    # final = format_final_message(state)
    return {"final_response": ""}

def route_after_reasoning(state: EliseeState):
    if len(state.get("tool_calls", [])) > 0:
        return "use_tools"
    return "direct_response"

def should_generate_visual_or_quote(state: EliseeState):
    intent = state.get("current_intent")
    if intent == "visual_request":
        return "visual_generator"
    elif intent == "quote":
        return "quote_generator"
    return "format_response"

# === GRAFO ===

workflow = StateGraph(EliseeState)

workflow.add_node("retrieve_context", retrieve_context)
workflow.add_node("classify_intent", classify_intent)
workflow.add_node("agent_reason", agent_reason)
workflow.add_node("execute_tools", execute_tools)
workflow.add_node("visual_generator", visual_generator)
workflow.add_node("quote_generator", quote_generator)
workflow.add_node("format_response", format_response)

# Edge
workflow.set_entry_point("retrieve_context")
workflow.add_edge("retrieve_context", "classify_intent")
workflow.add_edge("classify_intent", "agent_reason")

# Conditional edges
workflow.add_conditional_edges(
    "agent_reason",
    route_after_reasoning,
    {
        "use_tools": "execute_tools",
        "direct_response": "format_response"
    }
)

workflow.add_edge("execute_tools", "agent_reason")  # loop se servono più tool

# Note: should_generate_visual_or_quote mapped to correct nodes
workflow.add_conditional_edges("execute_tools", should_generate_visual_or_quote, {
    "visual_generator": "visual_generator",
    "quote_generator": "quote_generator",
    "format_response": "format_response"
})

workflow.add_edge("visual_generator", "format_response")

# Human in the loop mock logic
def human_approval(state: EliseeState):
    # if state["needs_human_approval"]:
    #     return interrupt({"quote_draft": state["quote_draft"]})
    return state

workflow.add_node("human_approval", human_approval)
workflow.add_edge("quote_generator", "human_approval")   
workflow.add_edge("human_approval", "format_response")

workflow.add_edge("format_response", END)

# Persistenza
checkpointer = MemorySaver()
graph = workflow.compile(checkpointer=checkpointer)

print("Elisee LangGraph Orchestrator inizializzato con successo.")
