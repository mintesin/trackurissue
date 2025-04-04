

export class notFoundError extends Error {
    constructor(message){
        super(message)
        this.name = "NotFoundError"
    }
}

export class saveError extends Error {
    constructor(message){
        super(message)
        this.name = "saveDataFailedError"
    }
}

export class loginFailed extends Error{
    constructor(message){
        this.name = "loginFailedError"
    }
}

export class NotSuccessFul extends Error {
    constructor(message){
        this.name = 'NotSuccessFulError'
    }
}

export class AuthorizationError extends Error{
    constructor(message){
        this.name = "AuthorizationError"
    }
}
