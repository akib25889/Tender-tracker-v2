from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal, run_migrations
import app.models  # Ensures all models are registered
from app.services.seeder import seed_database
from app.routers import (
    auth,
    tenders,
    tasks,
    documents,
    comments,
    dashboard,
    permissions,
    alerts,
    categories,
    settings as settings_router,
    submissions,
    chat,
    organizations,
    requirements,
    company_credentials,
    company_profiles,
    financial_rules,
    users,
    client_visits,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed initial data
    Base.metadata.create_all(bind=engine)
    run_migrations()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown: Cleanups if needed


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise API Core for TenderTracker Command Center",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(tenders.router, prefix=settings.API_V1_STR)
app.include_router(tasks.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(comments.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(permissions.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(categories.router, prefix=settings.API_V1_STR)
app.include_router(settings_router.router, prefix=settings.API_V1_STR)
app.include_router(submissions.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(organizations.router, prefix=settings.API_V1_STR)
app.include_router(requirements.router, prefix=settings.API_V1_STR)
app.include_router(company_credentials.router, prefix=settings.API_V1_STR)
app.include_router(company_profiles.router, prefix=settings.API_V1_STR)
app.include_router(financial_rules.router)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(client_visits.router, prefix=settings.API_V1_STR)
app.include_router(client_visits.router, prefix="/api/v1")


@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to TenderTracker Command Center API Core",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health",
    }
