module.exports = function(RED) {
    function status(config) {
        RED.nodes.createNode(this, config);

        this.creditnals = config.creditnals;
        this.clientNode = RED.nodes.getNode(this.creditnals);
        this.launching = false;

        let node = this;

        if (node.clientNode) {
            node.status({fill: "red", shape: "ring", text: "disconnected"});

            node.clientNode.register(node);

            if (node.clientNode.connected) {
                node.status({ fill: "green", shape: "ring", text: "connected" });
            }

            this.errorHandler = function(error) {
                node.status({ fill: "red", shape: "ring", text: "error" });

                node.launching = false;

                node.clientNode.reconnect();

                if (done) {
                    done(error);
                } else {
                    node.error(error, error.message);
                }
            };

            this.on("input", function(msg, send, done) {
                if (node.clientNode.connected) {
                    node.status({ fill: "green", shape: "ring", text: "connected" });
                } else {
                    node.status({ fill: "red", shape: "ring", text: "disconnected" });
                }

                node.launching = true;

                node.debug("Token: " + node.clientNode.client.token);

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

            });
        }

        this.on('close', function(done) {
            try {
                if (node.clientNode) {
                    node.clientNode.deregister(node, function() {
                        node.launching = false;

                        done();
                    });
                } else {
                    done();
                }
            } catch(error) {
                done();
            }
        });
    }

    RED.nodes.registerType("miwifi-status", status);
}
