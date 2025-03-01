from google import genai

client = genai.Client(api_key="AIzaSyCDTSTz3EIv5UU7-neew8rakeBOYqotWfM")

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="Explain how AI works",
)

print(response.text)