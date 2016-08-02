import tornado.ioloop
import tornado.web
import json
import suggest

"""
This web server is a microservice that calculates suggested bubbles.
"""


"""MainHandler
Handles posts to /
Posts to / return suggestions depending on the search criteria in the
post body.  The post body should be formData, the response is json.
"""


class MainHandler(tornado.web.RequestHandler):

    def get(self):
        self.write(
            "I suggest you use POST, not GET.  Oh and don't forget to include relevant search criteria!")

    def post(self):
        if (self.request.body):
            try:
                data = json.loads(self.request.body)
            except ValueError:
                self.send_error(404)

            # get the recommendations
            recommendedBubbles = suggest.getSuggestion(data.userId, data.searchCategory)

            # send as json back to the client (probably node.js)
            self.content_type = 'application/json'
            self.write(json.dumps(recommendedBubbles)
        else:
            self.send_error(500)

application=tornado.web.Application([
    (r"/", MainHandler),
])

if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
