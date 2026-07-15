class VoiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ProviderError extends VoiceError {
  constructor(message, provider) {
    super(message, 502); // Bad Gateway - issue with upstream provider
    this.provider = provider;
  }
}

class ValidationError extends VoiceError {
  constructor(message) {
    super(message, 400); // Bad Request
  }
}

export { VoiceError, ProviderError, ValidationError };
