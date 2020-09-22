const MiWifi = require('../lib/miwifi.js');

module.exports = function(RED) {
    function status(config) {
        RED.nodes.createNode(this, config);

        this.creditnals = config.creditnals;
        this.clientNode = RED.nodes.getNode(this.creditnals);

        let node = this;

        MiWifi.extends(
            this,
            function (msg, send, done) {
                node.clientNode.client.status()
                    .then(status => {
                        if (status.code === undefined || status.code > 0) {
                            node.errorHandler(status.code);
                        } else {
                            node.send({payload: status});
                        }

                        node.launching = false;
                    })
                    .catch(error => node.errorHandler);
            }
        );
    }

    RED.nodes.registerType("miwifi-status", status);
}
