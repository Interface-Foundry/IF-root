git clone git@github.com:troydhanson/pmtr.git ~/pmtr
cd ~/pmtr
make
sudo ./install-pmtr.sh
cd -
sudo ln -sf $PWD/pmtr.conf /etc/pmtr.conf
