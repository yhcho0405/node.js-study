// require은 node.js의 모듈 로딩 시스템
// 외부 모듈을 가져올 수 있음.
// require('./경로');
// ./가 없으면 NodeJS 자체 라이브러리에서 찾음.
var http = require('http');
var fs = require('fs');
var url = require('url');

// app이라는 인스턴스 생성 (객체는 정의만 된 것, 인스턴스는 실체화 된것(메모리 차지))
// 리스너 형태로 작동
var app = http.createServer(function(request, response) {
  // console.log(request.url);
  var _url = request.url;
  // console.log(url.parse(_url, true));
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  var title = queryData.id;

  if (pathname === '/') {
    // file system
    // `data/${queryData.id}`의 텍스트를 description에 담음.
    fs.readFile(`data/${queryData.id}`, 'UTF8', function(err, description) {
      if (queryData.id === undefined) {
        title = 'Welcome';
        description = 'Hello, Hode.js';
      }
      var template = `
      <!doctype html>
      <html>
      <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">WEB</a></h1>
        <ul>
          <li><a href="/?id=HTML">HTML</a></li>
          <li><a href="/?id=CSS">CSS</a></li>
          <li><a href="/?id=JavaScript">JavaScript</a></li>
        </ul>
        <h2>${title}</h2>
        <p>${description}</p>
      </body>
      </html>
      `;
      response.writeHead(200);
      response.end(template);
    });
  } else {
    response.writeHead(200);
    response.end('Not found');
  }
});
app.listen(3000);
