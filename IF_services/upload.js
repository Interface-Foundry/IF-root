'use strict';

var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    q = require('q'),
    async = require('async'),
    AWS = require('aws-sdk'),
    crypto = require('crypto'),
    urlify = require('urlify').create({
        addEToUmlauts: true,
        szToSs: true,
        spaces: "_",
        nonPrintable: "_",
        trim: true
    }),
    im = require('imagemagick'),
    fs = require('fs'),
    request = require('request'),
    Promise = require('bluebird');

module.exports = {
    uploadPicture: function(str, image) {
        return new Promise(function(resolve, reject) {
            // console.log('!!!!honestly guise: ', str, image)
            function convertBase64(image) {
                return new Promise(function(resolve, reject) {
                    //Detect if the passed image is base64 already or a URI
                    var base64Matcher = new RegExp("^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$");
                    if (base64Matcher.test(image)) {
                        resolve(image)
                    } else {
                        request({
                            url: image,
                            encoding: 'base64'
                        }, function(err, res, body) {
                            if (!err && res.statusCode == 200) {
                                var base64prefix = 'data:' + res.headers['content-type'] + ';base64,';
                                resolve(body)
                            } else {
                                if (err) {
                                    console.log('44', err)
                                }
                                reject('Cannot download image.')
                            }
                        });
                    }
                })
            }

            convertBase64(image).then(function(base64) {
                    var tmpfilename = urlify('temp_' + str + '_' + (new Date().toString()))
                    var inputPath = "../../temp/input/" + tmpfilename + ".png";
                    var outputPath = "../../temp/output/" + tmpfilename + ".png";
                    fs.writeFile(inputPath, base64, 'base64', function(err) {
                            if (err) console.log('57', err);
                            // var width = 300; // output width in pixels
                            // //Optimal image compression settings using imagemagick
                            // var args = [
                            //     inputPath,
                            //     '-filter',
                            //     'Triangle',
                            //     '-define',
                            //     'filter:support=2',
                            //     '-thumbnail',
                            //     '450',
                            //     '-unsharp' ,
                            //     '0.25x0.25+8+0.065',
                            //     '-dither',
                            //     'None',
                            //     '-posterize'
                            //     ,'136',
                            //     '-quality',
                            //     '82',
                            //     '-define',
                            //     'jpeg:fancy-upsampling=off',
                            //     '-define', 
                            //     'png:compression-filter=5',
                            //     '-define',
                            //     'png:compression-level=9',
                            //     '-define',
                            //     'png:compression-strategy=1',
                            //     '-define', 
                            //     'png:exclude-chunk=all',
                            //     '-interlace', 
                            //     'none',
                            //     '-colorspace',
                            //     'sRGB',
                            //     '-strip',
                            //     outputPath
                            // ];

                            im.resize({
                                srcPath: inputPath,
                                dstPath: outputPath,
                                strip: true,
                                quality: 82,
                                width: 450
                            }, function(err, stdout, stderr) {
                                if (err) console.log('83: ', err)
                                fs.readFile(outputPath, function(err, buffer) {
                                    var object_key = crypto.createHash('md5').update(tmpfilename).digest('hex');
                                    // var fileType = buffer.split(';')[0].split('/')[1];
                                    var current = object_key + ".png"
                                        // + fileType;
                                    var awsKey = current;
                                    var s3 = new AWS.S3();
                                    s3.putObject({
                                        Bucket: 'if-server-general-images',
                                        Key: awsKey,
                                        Body: buffer,
                                        ACL: 'public-read'
                                    }, function(err, data) {
                                        wait(function() {
                                            fs.unlink(outputPath)
                                        }, 200);
                                        wait(function() {
                                            fs.unlink(inputPath)
                                        }, 200);
                                        if (err) {
                                            console.log('99', err)
                                            return reject(err)
                                        } else {
                                            var imgURL = "https://s3.amazonaws.com/if-server-general-images/" + awsKey
                                                // console.log('Uploaded!', imgURL)
                                            resolve(imgURL)
                                        }
                                    });
                                }); //END OF FS READFILE
                            }); //END OF CONVERT
                        }) // END OF FS WRITEFILE
                }).catch(function(err) {
                    if (err) {
                        console.log('112', err)
                        reject('There was an error in converting the image')
                    }

                }) //END OF CONVERTBASE64
        }); //END OF BLUEBIRD
    },
    uploadPictures: function(str, array) {
        var self = this;
        var str = str;
        var images = [];
        // console.log('SELF: ', self)
        return new Promise(function(resolve, reject) {
            async.eachSeries(array, function iterator(image, cb) {
                self.uploadPicture(str, image).then(function(url) {
                    images.push(url)
                    cb()
                }).catch(function(err) {
                    if (err) {
                        console.log('131', err)
                    }
                    cb()
                })
            }, function finished(err) {
                if (err) {
                    console.log('137', err)
                    return reject(err)
                }
                images = _.uniq(images)
                resolve(images)
            })
        })
    }
}


function wait(callback, delay) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + delay);
    callback();
}