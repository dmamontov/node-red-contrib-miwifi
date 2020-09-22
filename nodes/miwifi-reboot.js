const MiWifi = require('../lib/miwifi.js');

module.exports = function(RED) {
    function reboot(config) {
        RED.nodes.createNode(this, config);

        this.creditnals = config.creditnals;
        this.clientNode = RED.nodes.getNode(this.creditnals);

        let node = this;

        MiWifi.extends(
            this,
            function (msg, send, done) {
                node.clientNode.client.reboot()
                    .then(response => {
                        if (response.code === undefined || response.code > 0) {
                            node.errorHandler(response.code);
                        } else {
                            node.send({payload: response});
                        }

                        node.launching = false;
                    })
                    .catch(error => node.errorHandler);
            }
        );
    }

    RED.nodes.registerType("miwifi-reboot", reboot);
}
