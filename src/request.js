const { URL } = require('url');
class Request {
  constructor(req) {
    this.req = req;
    this.url = req.url;
    this.method = req.method;
    this.body = {};
    this.params = {};
    this.query = {};
    this.headers = req.headers;
    
    this.parseQuery();
  }
  parseQuery() {
    try {
      const url = `http://localhost${this.url}`;
      const urlObj = new URL(url);
      
      urlObj.searchParams.forEach((value, key) => {
        this.query[key] = value;
      });
    } catch (error) {
    }
  }
  setBody(body) {
    this.body = body;
  }

  setParams(params) {
    this.params = params;
  }
}
module.exports = Request;