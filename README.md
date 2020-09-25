# Node-RED nodes for integration MiWifi

### Nodes:
![status](https://raw.githubusercontent.com/dmamontov/node-red-contrib-miwifi/master/images/miwifi-status.png)
<br><br>
![speed](https://raw.githubusercontent.com/dmamontov/node-red-contrib-miwifi/master/images/miwifi-speed.png)
<br><br>
![reboot](https://raw.githubusercontent.com/dmamontov/node-red-contrib-miwifi/master/images/miwifi-reboot.png)


### Installation:
```
npm install node-red-contrib-miwifi
```

### Specification:
* status - requesting the status of the router and the internet
* speed - internet connection speed request
* reboot - reboot router

input:
```
Anything (only required to run)
```
output:
```
{
     payload: {response from api},
}
```

### Conclusion
I really want to modify this library. But for this I need your support and wishes. Leave your wishes in the issues.
