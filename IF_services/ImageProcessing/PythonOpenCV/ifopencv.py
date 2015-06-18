import json
import urllib
import numpy as np
import cv2
import os


# Resizes an image if necessary
def resizeLargeImage(img):
    max_size = 1000
    height, width, channels = img.shape
    if height > max_size or width > max_size:
        if height > width:
            width = max_size * width / height
            height = max_size
        else:
            height = max_size * height / width
            width = max_size
        return cv2.resize(img, (width, height), interpolation=cv2.INTER_CUBIC)
    else:
        return img


# Get Image from file: input path, output image python object
def getFromFile(filename):
    return resizeLargeImage(cv2.imread(filename))


# Get Image from S3: input url, output image python object
def getFromS3(url):
    cachedFileName = "/tmp/" + url.replace('/', '').replace(':', '')
    if not os.path.isfile(cachedFileName):
        print "not found in cache, saving to " + cachedFileName
        (tmpfile, _) = urllib.urlretrieve(url)
        os.rename(tmpfile, cachedFileName)
    return getFromFile(cachedFileName)


# Extract Foreground: input image, output foreground image
def extractForeground(image):
    print "TODO implement extractForeground"
    return image


# K-mean Segmentation: input image, output segmented image
def kMeanSegmentation(image):
    print "TODO implement kMeanSegmentation"
    return image


# Find Blobs: input image, output array of blob centers
def findBlobs(image):
    print "TODO implement findBlobs"

    # Convert to grayscale
    image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Set up the detector with default parameters.
    detector = cv2.SimpleBlobDetector()

    # Detect blobs.
    keypoints = detector.detect(image)

    return keypoints


def findBlobsMSER(img):
    mser = cv2.MSER()
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    regions = mser.detect(gray, None)
    hulls = [cv2.convexHull(p.reshape(-1, 1, 2)) for p in regions]
    return hulls

# Finds the edges of things
def findContours(image):
    # Convert to grayscale
    image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    ret, thresh = cv2.threshold(image, 127, 255, 0)
    contours, hierarchy = cv2.findContours(thresh, 1, 2)

    return contours

# Finds the edges of things while combining nearby items
def findCompoundContours(image):
    dilatedImage = dilateImage(image)
    contours = findContours(dilatedImage)
    return contours

    # compoundContours = []

    # rectangles []
    # for contour in countours:

    #   rectangles.append(cv2.boundingRect(cnt))

    # first clump all the smallish boxes together

    # for each contour
    # return compoundContours


# returns a list of rectangles
def findItems(image):
    contours = findCompoundContours(image)
    height, width, channels = image.shape

    # convert to rectangles
    rectangles = []
    for c in contours:
        r = cv2.boundingRect(c)
        # only get rectangles that aren't THE WHOLE IMAGE RAH
        if r[2] <= .9 * width and r[3] <= .9 * height:
            rectangles.append(r)

    # combine overlapping rectangles
    combinedRectangles = getSetOfCombinedRectangles(rectangles)

    # big rectangles eat nearby small rectangles
    newRectangles = []
    for r in combinedRectangles:
        # grow each rectangle by the minimum of 20% or 50 pixels
        widthGrowth = min(int(.2 * r[2]), 50)
        heightGrowth = min(int(.2 * r[3]), 50)
        x = max(r[0] - int(widthGrowth/2), 0) # can't be negative
        y = max(r[1] - int(heightGrowth/2), 0)
        w = min(r[2] + widthGrowth, width - x)
        h = min(r[3] + heightGrowth, height - y)
        newRectangles.append((x, y, w, h))

    combinedRectangles = getSetOfCombinedRectangles(newRectangles)

    # remove small ones
    newRectangles = []
    for r in combinedRectangles:
        if r[2] >= width * .1 and r[3] >= height * .1:
            newRectangles.append(r)

    return newRectangles

# determine if two rectangles intersect
# rectangle: (x,y,w,h)
def rectanglesIntersect(r1, r2):
    # r1 intersects r2 if the vertical planes and horizontal planes intersect

    # vertical planes
    # 
    # here's a graphic to help you understand
    #  a----------b
    #     c------------d
    a = r1[0]
    b = a + r1[2]
    c = r2[0]
    d = c + r2[2]

    if c <= b and d >= a:
        # now the equivalent for horizontal planes
        if r2[1] <= r1[1] + r1[3] and r2[1] + r2[3] >= r1[1]:
            return True

    return False


# make one big rectangle that wraps the extents of a list of rectangles
def combineRectangles(rectangles):
    if len(rectangles) == 0:
        return None
    elif len(rectangles) == 1:
        return rectangles[0]

    # start with the first rectangle
    minx = rectangles[0][0]
    maxx = minx + rectangles[0][2]
    miny = rectangles[0][1]
    maxy = miny + rectangles[0][3]

    for r in rectangles:
        minx = min(minx, r[0])
        maxx = max(maxx, r[0] + r[2])
        miny = min(miny, r[1])
        maxy = max(maxy, r[1] + r[3])

    return (minx, miny, maxx - minx, maxy - miny)


# takes a whole bunch of rectangles and combines all the ones that touch
# recursive algorithm, watch out!
def getSetOfCombinedRectangles(rectangles):
    l = len(rectangles)
    if l <= 1:
        return rectangles

    for i1, r1 in enumerate(rectangles[:]):
        for i2, r2 in enumerate(rectangles[:]):
            if (not i1 == i2) and rectanglesIntersect(r1, r2):
                rectangles[i1] = combineRectangles([r1, r2])
                rectangles.remove(r2)
                return getSetOfCombinedRectangles(rectangles)

    return rectangles


# dilates an image (which is kind of like blurring)
def dilateImage(image):
    kernel = np.ones((5, 5), np.uint8)
    dilation = cv2.dilate(image, kernel, iterations=1)
    return dilation


# Find Faces: input image, output array of face centers
def findFaces(image):
    print "TODO implement findFaces"
    return []


def cv2version():
    return cv2.__version__
