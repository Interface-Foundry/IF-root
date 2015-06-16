import json
import urllib
import numpy as np
import cv2


#Resizes an image if necessary
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
        return cv2.resize(img, (width, height), interpolation = cv2.INTER_CUBIC)
    else:
        return img


#Get Image from file: input path, output image python object
def getFromFile(filename):
    return resizeLargeImage(cv2.imread(filename))


#Get Image from S3: input url, output image python object
def getFromS3(url):
    (tmpfile, _) = urllib.urlretrieve(url)
    return getFromFile(tmpfile)


#Extract Foreground: input image, output foreground image
def extractForeground(image):
    print "TODO implement extractForeground"
    return image


#K-mean Segmentation: input image, output segmented image
def kMeanSegmentation(image):
    print "TODO implement kMeanSegmentation"
    return image


#Find Blobs: input image, output array of blob centers
def findBlobs(image):
    print "TODO implement findBlobs"

    # Convert to grayscale
    image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Set up the detector with default parameters.
    detector = cv2.SimpleBlobDetector()

    # Detect blobs.
    keypoints = detector.detect(image)

    # Draw detected blobs as red circles.
    # cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS ensures the size of the circle corresponds to the size of blob
    im_with_keypoints = cv2.drawKeypoints(image, keypoints, np.array([]), (0,0,255), cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)

    # Show keypoints
    cv2.imshow("Keypoints", im_with_keypoints)
    cv2.waitKey(0)
    return []


#Find Faces: input image, output array of face centers
def findFaces(image):
    print "TODO implement findFaces"
    return []

def cv2version():
    return cv2.__version__