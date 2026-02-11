export class DomainException extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class EntityNotFoundException extends DomainException {
    constructor(entity: string, id: string) {
        super(`${entity} with id "${id}" not found`);
    }
}

export class EntityConflictException extends DomainException {
    constructor(message: string) {
        super(message);
    }
}

export class UnauthorizedException extends DomainException {
    constructor(message = 'Unauthorized') {
        super(message);
    }
}

export class ForbiddenException extends DomainException {
    constructor(message = 'Forbidden') {
        super(message);
    }
}
