const MiWifi = require('../lib/miwifi.js');

module.exports = function(RED) {
    function reboot(config)
    {
        RED.nodes.createNode(this, config);

        this.creditnals = config.creditnals;
        this.miwifi = new MiWifi(
            RED.nodes.getNode(this.creditnals),
            config.id,
            this.creditnals,
            this
        );

        this.status({});

        this.trigger = async function trigger(msg) {
            var token = await this.miwifi.login(this.reconnected);

            if (token === undefined) {
                this.status({fill: "red", shape: "dot", text: "error"});
            } else {
                this.status({fill: "green", shape: "dot", text: "connected"});

                this.log("Token: " + token);

                var result = await this.miwifi.reboot();

                if (result === undefined || result.code === undefined || result.code > 0) {
                    this.status({fill: "red", shape: "dot", text: "error"});
                } else {
                    this.status({});

                    this.send({
                        payload: result
                    });
                }
            }
        }.bind(this);

        this.on('input', this.trigger);

        this.on('close', function() {
            this.miwifi.logout();
        });
    }

    RED.nodes.registerType("miwifi-reboot", reboot);
}
