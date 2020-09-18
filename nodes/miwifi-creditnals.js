module.exports = function (RED) {

    function creditnals(config) {
        RED.nodes.createNode(this, config);

        this.password = config.password;
        this.address = config.address;
        //this.interface = config.interface;

        this.on("close", function(done)
        {
            done();
        });
    }

    RED.nodes.registerType('miwifi-creditnals', creditnals);
};
