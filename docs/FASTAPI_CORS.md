# FastAPI CORS setup for local development

Add this middleware to your FastAPI app to allow the Next.js frontend (running on port 3000)
to call the backend during development.

```py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

For quick local testing you can use `allow_origins=["*"]`, but do NOT use this in production.
