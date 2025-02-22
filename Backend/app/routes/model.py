from fastapi import FastAPI, APIRouter, HTTPException
from pydantic import BaseModel
import torch

model_router = APIRouter()

# Define the request model
class InferenceRequest(BaseModel):
    input_data: list

# Load the model
model = torch.load("path/to/your/model.pt")
model.eval()

@model_router.post("/infer")
async def infer(request: InferenceRequest):
    try:
        # Convert input data to tensor
        input_tensor = torch.tensor(request.input_data)
        
        # Perform inference
        with torch.no_grad():
            output = model(input_tensor)
        
        # Convert output to list and return as response
        response = output.tolist()
        return {"output": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))