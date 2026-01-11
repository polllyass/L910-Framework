function bodyParser(req, res, next) {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        if (body) {
          req.body = JSON.parse(body);
        } else {
          req.body = {};
        }
      } catch (error) {
        res.status(400).json({ error: 'Невалидный JSON' });
        return;
      }
      next();
    });
  } else {
    next();
  }
}
module.exports = bodyParser;