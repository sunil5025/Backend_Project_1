
class ApiError extends Error {
    constructor(
        statusCode = 500,
        message = "Something went wrong",
        errors = [],
        statck = ""
        // stack = new Error().stack,

    ){
        super(message)
        this.statisCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors


        if (statck) {
            this.stack = statck
        }else{ 
            Error.captureStackTrace(this, this.constructor)

        }
    }
}

export { ApiError }