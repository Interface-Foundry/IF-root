import json
import ifopencv
from twisted.web import server, resource
from twisted.internet import reactor, endpoints

class FindItems(resource.Resource):
    isLeaf = True

    # right now this handles every request to the server
    def render_GET(self, request):
        urlpath = request.URLPath()
        print urlpath
        request.setHeader("content-type", "application/json")
        if "url" in request.args:
            s3url = request.args["url"][0]
        else:
            raise NameError("Must provide 'url' querystring parameter")

        img = ifopencv.getFromS3(s3url)
        items = ifopencv.findItems(img)

        return json.dumps({"items": items})

endpoints.serverFromString(reactor, "tcp:9999").listen(server.Site(FindItems()))
print "Python OpenCV processing server running on port 9999"
print "Using OpenCV python module version " + ifopencv.cv2version()
reactor.run()