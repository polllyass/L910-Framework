const http = require('http');
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/tickets') {
    res.end('[{"id":1,"playId":1,"seat":"A12","price":1500}]');
  } else if (req.url === '/plays') {
    res.end('[{"id":1,"title":"Гамлет","author":"Шекспир"}]');
  } else {
    res.end('{"message":"Театральная афиша API"}');
  }
});
server.listen(3000, () => {
  console.log('http://localhost:3000');
});