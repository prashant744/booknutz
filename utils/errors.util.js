class AppError {
    constructor({
      statusCode = 500,
      message = "Server encountered some error. Please try after sometime..",
      shortMsg = "server-err",
      targetUri = "/",
    } = {}) {
      this.statusCode = statusCode;
      this.message = message;
      this.shortMsg = shortMsg;
      this.targetUri = targetUri;
    }
  
    toString() {
      return `STATUS:[${this.statusCode}] | ${this.message}`;
    }
  }
  
  module.exports = {
    AppError,
  };