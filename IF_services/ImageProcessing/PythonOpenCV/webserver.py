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
            urls = request.args["url"]
            results = list()
            enumurls = list(enumerate(urls, start=0))
            for i, url in enumurls:
                s3url = url
                img = ifopencv.getFromS3(s3url)
                coords = ifopencv.findItems(img)
                result = {"index": i,"coords": coords, }
                results.append(result)
        else:
            raise NameError("Must provide 'url' querystring parameter")

        print results
        return json.dumps({"items":results})

endpoints.serverFromString(reactor, "tcp:9999").listen(server.Site(FindItems()))
print "Python OpenCV processing server running on port 9999"
print "Using OpenCV python module version " + ifopencv.cv2version()
reactor.run()