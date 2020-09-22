'use strict';

class MiWifi {
    extends(node, input) {
        node.launching = false;

        node.errorHandler = function(error) {
            node.status({ fill: "red", shape: "ring", text: "error" });

            node.launching = false;

            node.clientNode.reconnect();

            if (done) {
                done(error);
            } else {
                node.error(error, error.message);
            }
        };

        if (node.clientNode) {
            node.status({fill: "red", shape: "ring", text: "disconnected"});

            node.clientNode.register(node);

            if (node.clientNode.connected) {
                node.status({ fill: "green", shape: "ring", text: "connected" });
            }

            node.on("input", function(msg, send, done) {
                if (node.clientNode.connected) {
                    node.status({ fill: "green", shape: "ring", text: "connected" });
                } else {
                    node.status({ fill: "red", shape: "ring", text: "disconnected" });
                }

                node.launching = true;

                node.debug("Token: " + node.clientNode.client.token);

                input(msg, send, done);
            });
        }

        node.on('close', function(done) {
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
}

module.exports = new MiWifi();
