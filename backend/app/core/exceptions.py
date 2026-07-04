"""
Application-level exception hierarchy.

All custom exceptions inherit from ``AppError`` so callers can catch the
entire family with a single ``except AppError`` clause if needed.

Hierarchy
---------
AppError
├── RepositoryError          — database I/O failures
├── ServiceError             — base for all domain-level errors
│   ├── NotFoundError        — resource does not exist          → HTTP 404
│   ├── BadRequestError      — invalid input data               → HTTP 400
│   ├── ConflictError        — operation conflicts with state   → HTTP 409
│   ├── BusinessRuleError    — domain rule violation            → HTTP 422
│   └── ValidationError      — input fails domain validation    → HTTP 422
├── AuthenticationError      — identity not verified            → HTTP 401
└── AuthorizationError       — identity lacks permission        → HTTP 403

Placement
---------
Exceptions live in ``app/core`` so both the repository and service layers
can import them without introducing circular dependencies.
"""
from __future__ import annotations


# ── Root ─────────────────────────────────────────────────────────────────────


class AppError(Exception):
    """Base class for all application-specific exceptions."""


# ── Repository layer ──────────────────────────────────────────────────────────


class RepositoryError(AppError):
    """
    Raised by repository methods when a database operation fails.

    The service layer catches this and converts it to an appropriate
    HTTP response (e.g. 503 Service Unavailable).  Raw ``PyMongoError``
    exceptions are never allowed to propagate beyond the repository.

    Parameters
    ----------
    operation:
        The repository method name that failed (e.g. ``"create"``).
    detail:
        Human-readable description of the failure.
    """

    def __init__(self, operation: str, detail: str) -> None:
        self.operation: str = operation
        self.detail: str = detail
        super().__init__(f"Repository error during '{operation}': {detail}")


# ── Service layer ─────────────────────────────────────────────────────────────


class ServiceError(AppError):
    """
    Base class for all domain / business-layer errors.

    The API layer catches subclasses of this and maps them to HTTP
    status codes (see individual subclasses for their intended status).

    Parameters
    ----------
    detail:
        Human-readable description of the error.
    """

    def __init__(self, detail: str) -> None:
        self.detail: str = detail
        super().__init__(detail)


class NotFoundError(ServiceError):
    """
    Raised when a requested resource does not exist.

    Maps to HTTP 404 Not Found.
    """


class ConflictError(ServiceError):
    """
    Raised when an operation conflicts with the current state of a resource.

    Example: creating a duplicate entry where uniqueness is required.
    Maps to HTTP 409 Conflict.
    """


class BadRequestError(ServiceError):
    """
    Raised when input fails validation that cannot be processed.

    Example: destination city is not found by geocoding API.
    Maps to HTTP 400 Bad Request.
    """


class BusinessRuleError(ServiceError):
    """
    Raised when a request violates a domain business rule.

    Example: travel date is in the past; notes missing when required.
    Maps to HTTP 422 Unprocessable Entity.
    """


class ValidationError(ServiceError):
    """
    Raised when input fails domain-level validation that Pydantic alone
    cannot express (e.g. cross-field rules resolved at the service layer).

    Maps to HTTP 422 Unprocessable Entity.
    """


# ── Auth layer ────────────────────────────────────────────────────────────────


class AuthenticationError(AppError):
    """
    Raised when a request cannot be authenticated.

    Example: missing or expired JWT token.
    Maps to HTTP 401 Unauthorized.
    """

    def __init__(self, detail: str = "Authentication required.") -> None:
        self.detail: str = detail
        super().__init__(detail)


class AuthorizationError(AppError):
    """
    Raised when an authenticated user lacks permission for an action.

    Example: a regular user attempting an admin-only operation.
    Maps to HTTP 403 Forbidden.
    """

    def __init__(self, detail: str = "Permission denied.") -> None:
        self.detail: str = detail
        super().__init__(detail)
