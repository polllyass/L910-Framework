const http = require('http');
const fs = require('fs');
const path = require('path');
const TicketController = require('./src/controllers/ticketController');
const PlayController = require('./src/controllers/playController');
const routes = {
  'GET': {},
  'POST': {},
  'PUT': {},
  'PATCH': {},
  'DELETE': {}
};
function get(path, handler) {
  routes.GET[path] = handler;
}

function post(path, handler) {
  routes.POST[path] = handler;
}

function put(path, handler) {
  routes.PUT[path] = handler;
}

function patch(path, handler) {
  routes.PATCH[path] = handler;
}

function del(path, handler) {
  routes.DELETE[path] = handler;
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    try {
      req.body = body ? JSON.parse(body) : {};
    } catch {
      req.body = {};
    }
    callback();
  });
}

get('/', (req, res) => {
  res.json({ message: 'Театральная афиша API работает!' });
});


get('/tickets', TicketController.getAllTickets);
get('/tickets/:id', TicketController.getTicketById);
post('/tickets', TicketController.createTicket);
put('/tickets/:id', TicketController.updateTicket);
patch('/tickets/:id', TicketController.partialUpdateTicket);
del('/tickets/:id', TicketController.deleteTicket);


get('/plays', PlayController.getAllPlays);
get('/plays/:id', PlayController.getPlayById);
post('/plays', PlayController.createPlay);
put('/plays/:id', PlayController.updatePlay);
patch('/plays/:id', PlayController.partialUpdatePlay);
del('/plays/:id', PlayController.deletePlay);


const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  

  const request = {
    method: req.method,
    url: req.url,
    params: {},
    query: {},
    body: {}
  };
  
  const response = {
    statusCode: 200,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      res.writeHead(this.statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    },
    send: function(data) {
      res.writeHead(this.statusCode, { 'Content-Type': 'text/plain' });
      res.end(String(data));
    }
  };

  const urlParts = req.url.split('?');
  const path = urlParts[0];
  

  if (urlParts[1]) {
    urlParts[1].split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      request.query[key] = value;
    });
  }

  const methodRoutes = routes[req.method] || {};
  let handler = methodRoutes[path];

  if (!handler) {
    for (const routePath in methodRoutes) {
      if (routePath.includes(':')) {
        const routeParts = routePath.split('/');
        const pathParts = path.split('/');
        
        if (routeParts.length === pathParts.length) {
          const params = {};
          let match = true;
          
          for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
              const paramName = routeParts[i].substring(1);
              params[paramName] = pathParts[i];
            } else if (routeParts[i] !== pathParts[i]) {
              match = false;
              break;
            }
          }
          
          if (match) {
            request.params = params;
            handler = methodRoutes[routePath];
            break;
          }
        }
      }
    }
  }

  if (handler) {

    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      parseBody(req, () => {
        request.body = req.body;
        handler(request, response);
      });
    } else {
      handler(request, response);
    }
  } else {

    response.status(404).json({ error: 'Маршрут не найден' });
  }
});
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
  console.log('Эндпоинты:');
  console.log('  GET  /tickets');
  console.log('  GET  /plays');
  console.log('  POST /tickets');
  console.log('  POST /plays');
});