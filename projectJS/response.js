class Response {
  constructor(res) {
    this.res = res;
    this.statusCode = 200;
    this.headers = {};
  }
  status(code) {
    this.statusCode = code;
    return this;
  }
  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }
  send(data) {
    const isString = typeof data === 'string';
    const contentType = isString ? 'text/plain' : 'application/json';
    this.setHeader('Content-Type', contentType);
    if (!isString) {
      data = JSON.stringify(data);
    }
    this.res.writeHead(this.statusCode, this.headers);
    this.res.end(data);
  }
  json(data) {
    this.setHeader('Content-Type', 'application/json');
    this.res.writeHead(this.statusCode, this.headers);
    this.res.end(JSON.stringify(data));
  }
}
module.exports = Response;