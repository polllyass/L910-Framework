class Router {
    constructor() {
        this.routes = {
            GET: [],
            POST: [],
            PUT: [],
            PATCH: [],
            DELETE: []
        };
        this.notFoundHandler = this.defaultNotFoundHandler;
    }

    // Пользовательский обработчик 404
    setNotFoundHandler(handler) {
        this.notFoundHandler = handler;
    }

    // Обработчик 404 по умолчанию
    defaultNotFoundHandler(req, res) {
        res.status(404).json({
            success: false,
            error: 'Маршрут не найден',
            path: req.url,
            method: req.method
        });
    }

    createRegexFromPath(path) {
        const regexPattern = path
            .split('/')
            .map(part => part.startsWith(':') ? '([^/]+)' : part)
            .join('/');
        return new RegExp(`^${regexPattern}$`);
    }

    addRoute(method, path, handler) {
        if (!this.routes[method]) {
            throw new Error(`Метод ${method} не поддерживается`);
        }

        this.routes[method].push({
            path,
            handler,
            regex: this.createRegexFromPath(path)
        });
    }

    findRoute(method, url) {
        if (!this.routes[method]) {
            return null;
        }

        for (const route of this.routes[method]) {
            const match = url.match(route.regex);
            if (match) {
                const params = {};
                const routeParts = route.path.split('/');
                const urlParts = url.split('/');
                
                for (let i = 0; i < routeParts.length; i++) {
                    if (routeParts[i].startsWith(':')) {
                        const paramName = routeParts[i].slice(1);
                        params[paramName] = urlParts[i];
                    }
                }
                
                return {
                    handler: route.handler,
                    params
                };
            }
        }
        
        return null;
    }

    handleRequest(req, res) {
        const routeInfo = this.findRoute(req.method, req.url);
        
        if (routeInfo) {
            req.params = routeInfo.params;
            try {
                const result = routeInfo.handler(req, res);
                if (result && result.catch) {
                    result.catch(error => {
                        console.error('Ошибка в асинхронном обработчике:', error);
                        if (!res.headersSent) {
                            res.status(500).json({
                                success: false,
                                error: 'Внутренняя ошибка сервера',
                                message: error.message
                            });
                        }
                    });
                }
            } catch (error) {
                console.error('Ошибка в синхронном обработчике:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        error: 'Внутренняя ошибка сервера',
                        message: error.message
                    });
                }
            }
        } else {
            // Маршрут не найден - 404
            this.notFoundHandler(req, res);
        }
    }
}

module.exports = Router;