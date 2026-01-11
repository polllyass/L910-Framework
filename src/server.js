const http = require('http');

class Server {
    constructor(router) {
        this.router = router;
        this.middlewares = [];
        this.server = null;
    }

    use(middleware) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware должен быть функцией');
        }
        this.middlewares.push(middleware);
        return this;
    }

    executeMiddlewares(req, res, index = 0) {
        if (index < this.middlewares.length) {
            try {
                this.middlewares[index](req, res, (err) => {
                    if (err) {
                        this.handleError(err, req, res);
                    } else {
                        this.executeMiddlewares(req, res, index + 1);
                    }
                });
            } catch (error) {
                this.handleError(error, req, res);
            }
        } else {
            // После всех middleware обрабатываем маршрут
            this.router.handleRequest(req, res);
        }
    }

    // Обработчик ошибок
    handleError(error, req, res) {
        console.error('Ошибка при обработке запроса:', error);
        
        if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                success: false,
                error: 'Внутренняя ошибка сервера',
                message: process.env.NODE_ENV === 'development' ? error.message : undefined,
                path: req.url,
                method: req.method
            }));
        }
    }

    // Методы для маршрутов остаются без изменений
    get(path, handler) {
        this.router.addRoute('GET', path, handler);
        return this;
    }

    post(path, handler) {
        this.router.addRoute('POST', path, handler);
        return this;
    }

    put(path, handler) {
        this.router.addRoute('PUT', path, handler);
        return this;
    }

    patch(path, handler) {
        this.router.addRoute('PATCH', path, handler);
        return this;
    }

    delete(path, handler) {
        this.router.addRoute('DELETE', path, handler);
        return this;
    }

    requestHandler(req, res) {
        // Инициализация объектов
        req.params = {};
        req.query = {};
        req.body = {};
        
        // Обработка query параметров
        const urlParts = req.url.split('?');
        req.url = urlParts[0];
        
        if (urlParts[1]) {
            const queryParams = new URLSearchParams(urlParts[1]);
            req.query = Object.fromEntries(queryParams);
        }

        // Методы для ответа
        res.send = (data) => {
            if (!res.headersSent) {
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.statusCode = res.statusCode || 200;
                res.end(data);
            }
        };

        res.json = (data) => {
            if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.statusCode = res.statusCode || 200;
                res.end(JSON.stringify(data, null, 2));
            }
        };

        res.status = (code) => {
            res.statusCode = code;
            return res;
        };

        // Middleware для обработки ошибок
        res.on('error', (error) => {
            this.handleError(error, req, res);
        });

        // Запускаем цепочку middleware
        this.executeMiddlewares(req, res);
    }

    listen(port, callback) {
        this.server = http.createServer((req, res) => {
            this.requestHandler(req, res);
        });

        // Глобальный обработчик ошибок сервера
        this.server.on('error', (error) => {
            console.error('Ошибка сервера:', error);
            if (error.code === 'EADDRINUSE') {
                console.error(`Порт ${port} уже занят!`);
            }
        });

        this.server.listen(port, () => {
            if (callback) callback();
        });
    }

    close() {
        if (this.server) {
            this.server.close();
        }
    }
}

module.exports = Server;