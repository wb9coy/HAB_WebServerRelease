To enable the ground station gateway to startup at boot execute the following commands:

sudo cp /home/gswiech/HAB_Server/systemd/HABserver.service /lib/systemd/system
sudo chmod 644 /lib/systemd/system/HABserver.service
sudo systemctl daemon-reload
sudo systemctl enable HABserver.service
sudo reboot


Notes:
sudo systemctl stop HABserver.service