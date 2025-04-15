
class ApiError extends Error {
    constructor(
        statusCode = 500,
        message = "Something went wrong",
        errors = [],
        stack = ""
        // stack = new Error().stack,

    ){
        super(message)
        this.statisCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors


        if (stack) {
            this.stack = stack
        }else{ 
            Error.captureStackTrace(this, this.constructor)

        }
    }
}

export { ApiError }