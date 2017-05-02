const path = require('path');
const express = require('express');

module.exports = {
    app: function () {
        const app = express();
        
        const indexPath = path.join(__dirname, '../dist/index.html');
        const publicPath = express.static(path.join(__dirname, '../dist'));

        app.use('../dist', publicPath);

        app.all('*', function(req, res) {
            res.sendFile(path.resolve(__dirname, indexPath));
        })

        return app
    }
}

