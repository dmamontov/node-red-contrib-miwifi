const moment = require('moment');
const md5 = require('md5');
const MiWifi = require('../lib/miwifi.js');

module.exports = function(RED) {
    function status(config)
    {
        RED.nodes.createNode(this, config);

        this.creditnals = config.creditnals;
        this.miwifi = new MiWifi(
            RED.nodes.getNode(this.creditnals),
            config.id,
            this.creditnals,
            this
        );
        this.interval = moment.duration(parseInt(config.interval), config.unit).asMilliseconds();
        this.reconnected = false;

        this.status({});

        this.trigger = async function trigger() {
            var token = await this.miwifi.login(this.reconnected);

            if (token === undefined) {
                if (this.context().global.get(md5(this.creditnals))) {
                    this.reconnected = true;

                    this.status({fill: "red", shape: "dot", text: "error"});
                } else {
                    this.status({fill: "yellow", shape: "dot", text: "wait"});
                }
            } else {
                this.reloging = false;

                this.status({fill: "green", shape: "dot", text: "connected"});

                this.log("Token: " + token);

                var result = await this.miwifi.status();

                if (result === undefined || result.code === undefined || result.code > 0) {
                    this.reconnected = true;

                    this.status({fill: "blue", shape: "dot", text: "re-connected"});
                } else {
                    this.send({
                        payload: result
                    });
                }
            }
        }.bind(this);

        setTimeout(this.trigger, 1000);
        this.intervalHandle = setInterval(this.trigger, this.interval);

        this.on('close', function() {
            this.miwifi.logout().then(result => {
                clearInterval(this.intervalHandle);
            });
        });
    }

    RED.nodes.registerType("miwifi-status", status);
}
