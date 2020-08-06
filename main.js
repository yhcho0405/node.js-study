// require은 node.js의 모듈 로딩 시스템
// 외부 모듈을 가져올 수 있음.
// require('./경로');
// ./가 없으면 NodeJS 자체 라이브러리에서 찾음.
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring')
//HTML
function getTemplateHTML(title, list, description, control) {
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>${list}${control}
    ${description}
  </body>
  </html>
  `;
}
// 파일 list를 받아 html로 변환 후 스트링 리턴
function getTemplateList(filelist) {
  var list = `
  <ul>`;
  var i = 0;
  while (i < filelist.length) {
    list += `
    <li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i++;
  }
  list += `
  </ul>
  `;
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
      var control = `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`;
      if (queryData.id === undefined) {
        title = 'Welcome';
        description = 'Hello, Node.js';
        control = '<a href="/create">create</a>';
      }
      // filesystem
      // ./data 파일 목록을 filelist에 배열로 저장
      fs.readdir('./data', function(error, filelist) {
        var list = getTemplateList(filelist);
        var template = getTemplateHTML(title, list, `
          <h2>${title}</h2>
          <p>${description}</p>
        `, control);
        response.writeHead(200);
        response.end(template);
      });
    });
  } else if (pathname === '/create') { // 글쓰기 페이지
    fs.readdir('./data', function(error, filelist) {
      var title = 'WEB - create';
      var list = getTemplateList(filelist);
      var template = getTemplateHTML(title, list, `
        <form action="http://localhost:3000/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
      `, '');
      response.writeHead(200);
      response.end(template);
    });
  } else if (pathname === '/create_process') { // get POST create
    var body = '';
    request.on('data', function(data) {
      body += data;
      // over 1mb
      if (body.length > 1e6)
        request.connection.destroy();
    });
    request.on('end', function() {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      // 파일 생성
      fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
        response.writeHead(302, {Location: `/?id=${title}`});
        response.end();
      });
    });
  } else if (pathname === '/update') { // update
    fs.readdir('./data', function(error, filelist) {
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description) {
          var title = queryData.id;
          var list = getTemplateList(filelist);
          var template = getTemplateHTML(title, list, `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `, `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
          response.writeHead(200);
          response.end(template);
        });
      });
  } else if (pathname === '/update_process') { // get POST update
    var body = '';
    request.on('data', function(data) {
      body += data;
      // over 1mb
      if (body.length > 1e6)
        request.connection.destroy();
    });
    request.on('end', function() {
      var post = qs.parse(body);
      var id = post.id
      var title = post.title;
      var description = post.description;
      // 파일 생성
      fs.rename(`data/${id}`, `data/${title}`, function(error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end();
        });
      });
    });
  } else { // 404
    response.writeHead(404);
    response.end('Not found');
  }
});
// port 3000
app.listen(3000);
