const http = require('http');
const url = require('url');
const fs = require('fs');
const xml = require('xml');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const users = {};

const setResponse = (request, response, status = 200, id = '', message = '') => {
  const resType = request.headers.accept;
  if (id && message) {
    const resMessage = {
      id,
      message,
    };


    if (resType === 'text/xml') {
      response.writeHead(status, { 'Content-Type': resType });
      response.write(xml({ response: [{ id: resMessage.id }, { message: resMessage.message }] }));
    } else {
      response.writeHead(status, { 'Content-Type': 'application/json' });
      response.write(JSON.stringify(resMessage));
    }
  } else {
    response.writeHead(status);
  }

  response.end();
};

const getContent = (request, response) => {
  const reqUrl = url.parse(request.url).pathname;
  switch (reqUrl) {
    case '/addUser':
      if (request.method === 'POST') {
        let jsonString = '';

        request.on('data', (data) => {
          jsonString += data;
        });

        request.on('end', () => {
          const user = JSON.parse(jsonString);
          if ('name' in user && user.name && 'age' in user && user.age) {
            if (user.name in users) {
              users[user.name] = { age: user.age };
              setResponse(request, response, 204);
            } else {
              users[user.name] = { age: user.age };
              setResponse(request, response, 201, 'createdUser', 'successfully created user');
            }
          } else {
            setResponse(request, response, 400, 'badRequest', 'name and age are both required');
          }
        });
        break;
      }
      setResponse(request, response, 400, 'incorrectMethod', 'incorrect method used');
      break;
    case '/getUsers':
      if (request.method === 'HEAD' && !users) {
        response.end();
        break;
      }
      response.write(JSON.stringify(users));
      response.end();
      break;
    case '/notReal':
      if (request.method === 'HEAD') {
        setResponse(request, response, 404);
      } else {
        setResponse(request, response, 404, 'notFound', 'page not found');
      }
      break;
    case '/':
      response.write(fs.readFileSync(`${__dirname}/../client/client.html`));
      response.end();
      break;
    default:
      if (fs.existsSync(`${__dirname}/../client/${reqUrl}`)) {
        const page = fs.readFileSync(`${__dirname}/../client/${reqUrl}`);
        if (reqUrl.indexOf('css') > -1) {
          response.writeHead(200, { 'Content-Type': 'text/css' });
        }
        response.write(page);
        response.end();
      } else {
        setResponse(request, response, 404, 'notFound', 'page not found');
      }
      break;
  }
};

http.createServer(getContent).listen(port);
