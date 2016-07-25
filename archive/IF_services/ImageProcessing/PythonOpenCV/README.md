how to install dependencies

Virtualenv
1. `virtualenv venv`
2. `pip install -r requirements.txt`
3. install opencv
4. find cv2.so on your system and copy it to `venv/lib/python2.7/site-packages/.` (it might be in /usr/local/lib/python2.7/dist-packages if you're on linux)
5. `source venv/bin/activate`

on mac:
echo 'import site; site.addsitedir("/usr/local/lib/python2.7/site-packages")' >> /Users/peter/Library/Python/2.7/lib/python/site-packages/homebrew.pth
