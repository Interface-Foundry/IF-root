function getHTML (url) {
  var html = `<html>
    <body>
      <div style="width:38em;margin:3em 20% 1em 20%;">
        <iframe scrolling="no" height="1000px" width="100%" frameborder="0" src="${url}"></iframe>`+
      `</div>
    </body>
  </html>`;
  return html;
}

module.exports = getHTML;
