from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException
from pydantic import BaseModel
from google.genai import Client
from PIL import Image
import torch
import timm
import torchvision.transforms as transforms
import io
import os
from dotenv import load_dotenv    
import requests

load_dotenv()

API_KEY = os.getenv("LLM_API")
client = Client(api_key=API_KEY)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

current_dir = os.getcwd()

MODEL_PATH = os.path.join(current_dir, "routes", "model.pth")
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


@app.post("/chat")
async def chat(
    question: str = Form(None),
    language: str = Form(...),
    is_image_check: bool = Form(False),
    file: UploadFile = File(None)
):
    if is_image_check:
        if file is None:
            raise HTTPException(status_code=400, detail="Image file is required when is_image_check is True.")

        # Read and process image
        image_bytes = await file.read()
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor_image = transform(pil_image).unsqueeze(0).to(device)

        # Model prediction
        with torch.no_grad():
            outputs = model(tensor_image)
            _, predicted = torch.max(outputs, 1)
            prediction = predicted.item()

        label = "normal" if prediction == 1 else "diabetic foot ulcer"

        # 🔥 One Gemini Call with smart prompt
        gemini_prompt = f"""
        "You are a diabetic foot care specialist.

        Please examine the image below and explain your assessment **in {language}**:

        1. If the image is **not a human foot**, politely inform the user that the image is not valid for diabetic foot ulcer analysis.
        2. If the image is a **human foot**, explain:
              - Whether there are visible signs consistent with the prediction: **{label.upper()}**
              - What those signs might mean medically
              - Suggested next steps, treatments, or home care
              - Strongly advise the user to consult a medical professional as soon as possible

           Write clearly and respectfully. Avoid phrases like 'I will assess' or 'Let me check'. Speak directly and empathetically to the user."
        """

        if question:
            gemini_prompt = f"User asked: {question}\n\n" + gemini_prompt

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[gemini_prompt, pil_image]
        )

        return {"message": response.text, "label": label}

    else:
        # Text-only Q&A
        if not question or "foot ulcer" not in question.lower():
            raise HTTPException(status_code=400, detail="Only questions about foot ulcers are allowed.")

        prompt = f"Answer the following question strictly in {language}, regardless of the input language:\n{question}"
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        return {"message": response.text}


# # Define request model
# class ChatRequest(BaseModel):
#     question: str
#     language: str

# @app.post("/chat")
# def chat(request: ChatRequest):
#     # Check if the question is related to foot ulcers
#     if "foot ulcer" not in request.question.lower():
#         raise HTTPException(status_code=400, detail="Only questions about foot ulcers are allowed.")
    
#     # Generate response from Gemini in the specified language
#     prompt = f"Answer the following question strictly in {request.language}, regardless of the input language:\n{request.question}"
    
#     response = client.models.generate_content(
#         model="gemini-2.0-flash",
#         contents=prompt
#     )
    
#     return {"message": response.text}