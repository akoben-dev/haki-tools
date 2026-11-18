// B5: CloudFront Function (cloudfront-js-2.0), runs on every viewer request.
//  1. www.haki.tools/...  -> 301 https://haki.tools/...
//  2. /path (no extension) -> 301 /path/   (one canonical URL per page)
//  3. /path/               -> serves /path/index.html from the bucket
function qs(q) {
  var parts = [];
  for (var k in q) {
    var v = q[k];
    if (v.multiValue) v.multiValue.forEach(function (m) { parts.push(k + '=' + m.value); });
    else parts.push(v.value === '' ? k : k + '=' + v.value);
  }
  return parts.length ? '?' + parts.join('&') : '';
}

function redirect(location) {
  return { statusCode: 301, statusDescription: 'Moved Permanently', headers: { location: { value: location } } };
}

function handler(event) {
  var req = event.request;
  var host = req.headers.host ? req.headers.host.value : '';
  var uri = req.uri;

  if (host.indexOf('www.') === 0) return redirect('https://' + host.slice(4) + uri + qs(req.querystring));

  if (uri.endsWith('/')) {
    req.uri = uri + 'index.html';
    return req;
  }
  var last = uri.slice(uri.lastIndexOf('/') + 1);
  if (last.indexOf('.') === -1 && uri.indexOf('/api/') !== 0) return redirect(uri + '/' + qs(req.querystring));
  return req;
}
