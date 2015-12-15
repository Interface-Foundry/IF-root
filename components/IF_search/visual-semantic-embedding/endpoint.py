from datetime import datetime

from flask import (
    Flask,
    abort,
    redirect,
    render_template,
    request,
    url_for,
)


app = Flask(__name__)
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = 'pop_it_like_a_wheelie_should'

if __name__ == '__main__':
    app.run()