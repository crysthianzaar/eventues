import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.src.models.base import Base
from backend.src.models.user_model import UserModel, UserRole
from backend.src.repositories.user_repository import UserRepository

DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


def test_create_user(db_session):
    repo = UserRepository(db_session)
    user = UserModel(username="test_user", email="test@example.com",
                     role=UserRole.PARTICIPANT)
    created_user = repo.create_user(user)
    assert created_user.id is not None
    assert created_user.username == "test_user"
    assert created_user.email == "test@example.com"


def test_get_user_by_email(db_session):
    repo = UserRepository(db_session)
    user = UserModel(username="test_user", email="test@example.com",
                     role=UserRole.PARTICIPANT)
    repo.create_user(user)
    found_user = repo.get_user_by_email("test@example.com")
    assert found_user is not None
    assert found_user.email == "test@example.com"


def test_get_user_by_google_id(db_session):
    repo = UserRepository(db_session)
    user = UserModel(username="test_user", email="test@example.com",
                     google_id="12345", role=UserRole.PARTICIPANT)
    repo.create_user(user)
    found_user = repo.get_user_by_google_id("12345")
    assert found_user is not None
    assert found_user.google_id == "12345"


def test_update_user(db_session):
    repo = UserRepository(db_session)
    user = UserModel(username="test_user", email="test@example.com",
                     role=UserRole.PARTICIPANT)
    created_user = repo.create_user(user)
    created_user.username = "updated_user"
    updated_user = repo.update_user(created_user)
    assert updated_user.username == "updated_user"


def test_delete_user(db_session):
    repo = UserRepository(db_session)
    user = UserModel(username="test_user", email="test@example.com",
                     role=UserRole.PARTICIPANT)
    created_user = repo.create_user(user)
    repo.delete_user(created_user)
    deleted_user = repo.get_user_by_id(created_user.id)
    assert deleted_user is None
