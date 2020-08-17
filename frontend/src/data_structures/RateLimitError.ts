class RateLimitError extends Error {
    constructor(message) {
      super(message); // (1)
      this.name = "ValidationError"; // (2)
    }
  }