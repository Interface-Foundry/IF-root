from sanic import Sanic
from sanic.response import json

app = Sanic()


@app.route('/scrape', methods=['GET'])
async def scrape(request):
    return request

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)