"""
Vercel Serverless Function entry point for FastAPI.
Wraps the backend/app/main.py FastAPI app for Vercel deployment.
"""
import os
import sys

# Add backend directory to Python path so imports work
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import the FastAPI app from backend
from app.main import app

# Export for Vercel serverless function
