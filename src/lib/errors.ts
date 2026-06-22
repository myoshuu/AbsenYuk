export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} tidak ditemukan`, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Tidak memiliki akses") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Akses ditolak") {
    super(403, message, "FORBIDDEN");
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, "VALIDATION_ERROR");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, "CONFLICT");
  }
}

export function apiError(error: unknown) {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: { error: { code: error.code, message: error.message } },
    };
  }
  console.error("Unhandled error:", error);
  return {
    status: 500,
    body: { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan server" } },
  };
}
