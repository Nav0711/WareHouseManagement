from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from app.database import get_db, Database
from app.models.user import UserCreate, UserLogin, UserOut, UserUpdate, Token
from app.utils.auth import verify_password, get_password_hash, create_access_token
from app.config import settings
from typing import Optional
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Database = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    query = "SELECT * FROM users WHERE email = $1"
    user_record = await db.fetch_one(query, email)
    if user_record is None:
        raise credentials_exception
    return dict(user_record)

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Database = Depends(get_db)):
    # Check if user exists
    existing = await db.fetch_one("SELECT user_id FROM users WHERE email = $1", user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user.password)
    
    query = """
        INSERT INTO users (email, password_hash, full_name, company_name, role_type, inventory_focus)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    """
    new_user = await db.fetch_one(
        query, 
        user.email, 
        hashed_password, 
        user.full_name, 
        user.company_name, 
        user.role_type, 
        user.inventory_focus
    )
    return dict(new_user)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Database = Depends(get_db)):
    query = "SELECT * FROM users WHERE email = $1"
    user = await db.fetch_one(query, form_data.username)
    
    if not user or not verify_password(form_data.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['email']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login-json", response_model=Token)
async def login_json(user_credentials: UserLogin, db: Database = Depends(get_db)):
    query = "SELECT * FROM users WHERE email = $1"
    user = await db.fetch_one(query, user_credentials.email)
    
    if not user or not verify_password(user_credentials.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['email']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
async def update_users_me(user_update: UserUpdate, current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    # Build dynamic update query
    updates = []
    values = []
    idx = 1
    
    update_dict = user_update.model_dump(exclude_unset=True)
    
    if not update_dict:
        return current_user
        
    for key, value in update_dict.items():
        updates.append(f"{key} = ${idx}")
        values.append(value)
        idx += 1
        
    values.append(current_user['user_id'])
    
    query = f"""
        UPDATE users 
        SET {", ".join(updates)}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${idx}
        RETURNING *
    """
    
    updated_user = await db.fetch_one(query, *values)
    return dict(updated_user)
