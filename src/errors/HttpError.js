export default class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
