from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
from google.generativeai.types import content_types
from app.database import get_db, Database
from app.config import settings
from app.api.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatMessage(BaseModel):
    role: str # 'user' or 'model'
    text: str

class ChatRequest(BaseModel):
    history: List[ChatMessage]
    message: str

# Define tool schemas for Gemini
def get_inventory_status(warehouse_name: Optional[str] = None, product_name: Optional[str] = None):
    """Get the current inventory quantities for products or warehouses."""
    pass

def get_low_stock_items():
    """Get a list of products that have fallen below their minimum reorder level."""
    pass

def get_warehouse_capacities():
    """Get utilization and capacity information for all warehouses."""
    pass

def get_recent_movements(limit: int = 5):
    """Get the most recent stock inbound, outbound, or transfer movements."""
    pass


tools = [get_inventory_status, get_low_stock_items, get_warehouse_capacities, get_recent_movements]


@router.post("/")
async def chat_with_bot(
    req: ChatRequest, 
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured on the server.")
        
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    # System Instruction
    system_instruction = f"""You are 'WTMS Assistant', an intelligent, helpful AI for the Warehouse & Transportation Management System.
The current user you are talking to is {current_user.get('full_name')} from {current_user.get('company_name', 'your company')}. 
Their role is {current_user.get('role_type')}.

Rules:
1. Be extremely CONCISE and precise. Do not provide unnecessary explanations. Provide only the requested data if possible.
2. You MUST use the provided tools to answer questions about inventory, warehouses, or stock.
3. DO NOT make up numbers or hallucinate data. If you don't know, use a tool or say you don't know.
4. You are restricted to topics regarding Warehouse Management, Logistics, Inventory, and this software.
5. If the user asks off-topic questions, politely decline and state you are a warehouse assistant.
"""

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        tools=tools,
        system_instruction=system_instruction,
        generation_config=genai.types.GenerationConfig(
            max_output_tokens=250,
            temperature=0.2,
        )
    )
    
    # Token Optimizer: Limit history to the last 6 messages (3 turns) to save tokens
    MAX_HISTORY = 6
    history_list = list(req.history)
    recent_history = history_list[-MAX_HISTORY:] if len(history_list) > MAX_HISTORY else history_list
    
    # Build history
    history = []
    for msg in recent_history:
        history.append({"role": msg.role, "parts": [{"text": msg.text}]})
        
    chat = model.start_chat(history=history)
    
    # First, send the message to get a response or a tool call
    try:
        response = chat.send_message(req.message)
        
        # Check if the model wants to call a function
        if response.parts and response.parts[0].function_call:
            func_call = response.parts[0].function_call
            func_name = func_call.name
            args = func_call.args
            
            # Execute the respective DB query
            tool_result = {}
            if func_name == "get_inventory_status":
                q = """
                    SELECT w.warehouse_name, p.product_name, i.quantity, i.reserved_quantity 
                    FROM inventory i
                    JOIN warehouses w ON i.warehouse_id = w.warehouse_id
                    JOIN products p ON i.product_id = p.product_id
                    WHERE 1=1
                """
                params = []
                idx = 1
                if 'warehouse_name' in args and args['warehouse_name']:
                    q += f" AND w.warehouse_name ILIKE ${idx}"
                    params.append(f"%{args['warehouse_name']}%")
                    idx += 1
                if 'product_name' in args and args['product_name']:
                    q += f" AND p.product_name ILIKE ${idx}"
                    params.append(f"%{args['product_name']}%")
                    idx += 1
                
                rows = await db.fetch_all(q, *params)
                tool_result = {"inventory": [dict(r) for r in rows]}
                
            elif func_name == "get_low_stock_items":
                q = """
                    SELECT p.product_name, w.warehouse_name, i.quantity, p.reorder_level
                    FROM inventory i
                    JOIN products p ON i.product_id = p.product_id
                    JOIN warehouses w ON i.warehouse_id = w.warehouse_id
                    WHERE i.quantity <= p.reorder_level
                """
                rows = await db.fetch_all(q)
                tool_result = {"low_stock_items": [dict(r) for r in rows]}
                
            elif func_name == "get_warehouse_capacities":
                q = """
                    SELECT w.warehouse_name, w.capacity_cubic_meters, 
                           COALESCE(SUM(i.quantity * p.volume_cubic_meters), 0) as used_cubic_meters
                    FROM warehouses w
                    LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
                    LEFT JOIN products p ON i.product_id = p.product_id
                    GROUP BY w.warehouse_id
                """
                rows = await db.fetch_all(q)
                tool_result = {"warehouses": [{"warehouse_name": r['warehouse_name'], "capacity": float(r['capacity_cubic_meters']), "used": float(r['used_cubic_meters'])} for r in rows]}
                
            elif func_name == "get_recent_movements":
                limit = int(args.get('limit', 5))
                q = """
                    SELECT p.product_name, sm.quantity, sm.movement_type, sm.created_at
                    FROM stock_movements sm
                    JOIN products p ON sm.product_id = p.product_id
                    ORDER BY sm.created_at DESC
                    LIMIT $1
                """
                rows = await db.fetch_all(q, limit)
                tool_result = {"movements": [{"product": r['product_name'], "qty": r['quantity'], "type": r['movement_type'], "date": str(r['created_at'])} for r in rows]}
            
            # Send the tool output back to the model
            final_response = chat.send_message(
                content_types.Part.from_function_response(
                    name=func_name,
                    response=tool_result
                )
            )
            return {"reply": final_response.text}
            
        else:
            # Model responded with text directly
            return {"reply": response.text}
            
    except Exception as e:
        print("Chat Error:", e)
        raise HTTPException(status_code=500, detail=str(e))
