function getHTML (url) {
  var html = `<html>
    <head>
      <style>
        ::-webkit-scrollbar {
           width: 0px;  /* remove scrollbar space */
           background: transparent;  /* optional: just make scrollbar invisible */
        }
        /* optional: show position indicator in red */
        ::-webkit-scrollbar-thumb {
           background: transparent;
        }

        body {
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div style='height: 100%; width: 50%; margin: 0 auto; overflow: auto;'>
        <iframe scrolling='no' height="1000px" width="100%" frameborder="0" src="${url}"></iframe>
      </div>
    </body>
  </html>`;
  return html;
}

module.exports = getHTML;
