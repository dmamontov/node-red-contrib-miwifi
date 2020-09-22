const MiWifi = require('../lib/miwifi.js');

module.exports = function(RED) {
    function speed(config) {
        RED.nodes.createNode(this, config);

        this.creditnals = config.creditnals;
        this.history = config.history;
        this.clientNode = RED.nodes.getNode(this.creditnals);

        let node = this;

        MiWifi.extends(
            this,
            function (msg, send, done) {
                node.clientNode.client.speed(node.history)
                    .then(speed => {
                        if (speed.code === undefined || speed.code > 0) {
                            node.errorHandler(speed.code);
                        } else {
                            node.send({payload: speed});
                        }

                        node.launching = false;
                    })
                    .catch(error => node.errorHandler);
            }
        );
    }

    RED.nodes.registerType("miwifi-speed", speed);
}
