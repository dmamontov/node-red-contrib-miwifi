module.exports = function (RED) {

    function creditnals(config) {
        RED.nodes.createNode(this, config);

        this.password = config.password;
        this.address = config.address;
        this.mac = config.mac;

        this.on("close", function(done)
        {
            done();
        });
    }

    RED.nodes.registerType('miwifi-creditnals', creditnals);
};
