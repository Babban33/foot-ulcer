from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException
from pydantic import BaseModel
from google import genai
from PIL import Image
import torch
import timm
import torchvision.transforms as transforms
import io
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
client = genai.Client(api_key=os.getenv("LLM_API"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "C:\Users\athar\OneDrive\Desktop\Atharva\Github\Frelance\foot-ulcer\Backend\app\model\model.pth"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = timm.create_model("vit_base_patch16_224", pretrained=False, num_classes=2)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.to(device)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

@app.get("/")
async def root():
    return {"message": "Hello, World!"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image = Image.open(io.BytesIO(await file.read())).convert("RGB")
        image = transform(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(image)
            _, predicted = torch.max(outputs, 1)
            prediction = predicted.item()
        
        return {"prediction": prediction, "success": True, "error": None}
    
    except Exception as e:
        return {"prediction": None, "success": False, "error": str(e)}
    

# Define request model
class ChatRequest(BaseModel):
    question: str
    language: str

@app.post("/chat")
def chat(request: ChatRequest):
    # Check if the question is related to foot ulcers
    if "foot ulcer" not in request.question.lower():
        raise HTTPException(status_code=400, detail="Only questions about foot ulcers are allowed.")
    
    # Generate response from Gemini in the specified language
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=f"Respond in {request.language}: {request.question}"
    )
    
    return {"message": response.text}