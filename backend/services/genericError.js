

export class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "NotFoundError";
        this.statusCode = 404;
        this.isOperational = true;
    }
}

export class SaveError extends Error {
    constructor(message) {
        super(message);
        this.name = "SaveError";
        this.statusCode = 500;
        this.isOperational = true;
    }
}

export class LoginError extends Error {
    constructor(message) {
        super(message);
        this.name = "LoginError";
        this.statusCode = 401;
        this.isOperational = true;
    }
}

export class OperationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'OperationError';
        this.statusCode = 500;
        this.isOperational = true;
    }
}

export class AuthorizationError extends Error {
    constructor(message) {
        super(message);
        this.name = "AuthorizationError";
        this.statusCode = 403;
        this.isOperational = true;
    }
}

export class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = "UnauthorizedError";
        this.statusCode = 401;
        this.isOperational = true;
    }
}

export class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.name = "BadRequestError";
        this.statusCode = 400;
        this.isOperational = true;
    }
}

export class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = "ConflictError";
        this.statusCode = 409;
        this.isOperational = true;
    }
}

export class NotSuccessful extends Error {
    constructor(message) {
        super(message);
        this.name = "NotSuccessful";
        this.statusCode = 500;
        this.isOperational = true;
    }
}
