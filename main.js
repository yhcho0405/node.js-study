// require은 node.js의 모듈 로딩 시스템
// 외부 모듈을 가져올 수 있음.
// require('./경로');
// ./가 없으면 NodeJS 자체 라이브러리에서 찾음.
var http = require('http');
var fs = require('fs');
var url = require('url');

function getTemplateHTML(title, list, description) {
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    <h2>${title}</h2>
    <p>${description}</p>
  </body>
  </html>
  `;
}

function getTemplateList(filelist) {
  var list = `<ul>
  `;
  var i = 0;
  while (i < filelist.length) {
    list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>
    `;
    i++;
  }
  list += `</ul>`;
  return list;
}

// "app" 인스턴스 생성 (객체는 정의만 된 것, 인스턴스는 실체화 된것(메모리 차지))
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
        description = 'Hello, Node.js';
      }
      // filesystem
      // ./data 파일 목록을 filelist에 배열로 저장
      fs.readdir('./data', function(error, filelist) {
        var list = getTemplateList(filelist);
        var template = getTemplateHTML(title, list, description);
        response.writeHead(200);
        response.end(template);
      });
    });
  } else {
    response.writeHead(200);
    response.end('Not found');
  }
});
app.listen(3000);
