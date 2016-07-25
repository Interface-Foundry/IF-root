import ifopencv
import cv2
import json
import numpy as np

testImages = [
    'https://s3.amazonaws.com/if-server-general-images/2015/5/instagram-test1.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/instagram-test2.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/instagram-test3.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/instagram-test4.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/instagram-test5.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/instagram-test6.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/instagram-test7.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/instagram-test8.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/instagram-test9.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172021.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172026.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172032.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172041.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172103.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172107.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172120.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172132.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172150.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172206.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172212.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172227.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172242.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172251.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172256.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172303.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172310.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172327.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172336.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172344.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172346.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172448.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172452.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172555.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172627.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172906.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172917.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172930.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_172951.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_173004.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_173017.jpg',
    'https://s3.amazonaws.com/if-server-general-images/2015/5/20150616_173025.jpg'
]

# flags for which methods to use
doBlobs = False
doContours = False
doCompoundContours = False
pureContours = False
doContourAxes = False
doBlobsMSER = False
doItems = True

for url in testImages:
    print 'Processing', url
    img = ifopencv.getFromS3(url)
    annotatedImage = img.copy()

    if doBlobs:
        keypoints = ifopencv.findBlobs(img)
        for k in keypoints:
            print k.pt, k.size

        # Draw detected blobs as red circles.
        # cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS ensures the size of the circle corresponds to the size of blob
        annotatedImage = cv2.drawKeypoints(annotatedImage, keypoints, np.array([]), (0, 0, 255),
                                           cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)

    if doContours:
        contours = ifopencv.findContours(img)
        min_size = 1
        if pureContours:
            cv2.drawContours(annotatedImage, contours, -1, (0, 255, 0))
        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            if w > min_size or h > min_size:
                print x, y, w, h
                cv2.rectangle(annotatedImage, (x, y), (x + w, y + h), (0, 255, 0))

                if doContourAxes:
                    rows, cols = img.shape[:2]
                    [vx, vy, x, y] = cv2.fitLine(cnt, cv2.cv.CV_DIST_L2, 0, 0.01, 0.01)
                    lefty = int((-x * vy / vx) + y)
                    righty = int(((cols - x) * vy / vx) + y)
                    cv2.line(annotatedImage, (cols - 1, righty), (0, lefty), (20, 255, 20), 1)

    if doItems:
        rectangles = ifopencv.findItems(img)
        for r in rectangles:
            cv2.rectangle(annotatedImage, (r[0], r[1]), (r[0] + r[2], r[1] + r[3]), (255, 255, 0), 2)

    if doBlobsMSER:
        hulls = ifopencv.findBlobsMSER(img)
        cv2.polylines(annotatedImage, hulls, 1, (255, 0, 0))

    cv2.imshow("Annotated Image", annotatedImage)
    cv2.waitKey(0)
