/**
 * @fileoverview This file contains the definition of the AppError class, which extends the built-in Error class in JavaScript. It is used to create custom error objects with additional properties such as statusCode and status.
 * 
 * @class AppError
 */

export class AppError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
        
        Error.captureStackTrace(this, this.constructor)
    }
}