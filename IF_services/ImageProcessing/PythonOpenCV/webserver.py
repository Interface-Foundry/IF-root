import json
import ifopencv
from twisted.web import server, resource
from twisted.internet import reactor, endpoints

class FindItems(resource.Resource):
    isLeaf = True

    # right now this handles every request to the server
    def render_GET(self, request):
        request.setHeader("content-type", "application/json")
        if "url" in request.args:
            s3url = request.args["url"][0]
        else:
            raise NameError("Must provide 'url' querystring parameter")



        return json.dumps({"items": []})

endpoints.serverFromString(reactor, "tcp:9999").listen(server.Site(FindItems()))
reactor.run()