'use strict';

const urljoin = require('url-join');
const querystring = require('querystring');
const axios = require('axios');
const md5 = require('md5');
const Encrypt = require('./encrypt.js');

class MiWifi {
    constructor(params = {}, node_id, auth_id, node) {
        this.mac = params.mac;
        this.address = params.address || 'http://miwifi.com';
        this.password = params.password
        this.encrypt = new Encrypt(this.mac);
        this.node_id = md5(node_id);
        this.node = node;
        this.id = "miwifi-" + md5(auth_id);

        if (node.context().global.get(this.id)) {
            this.token = this.node.context().global.get(this.id);
        } else {
            this.token = null;
        }

        if (this.node.context().global.get("miwifi-login-block") === undefined) {
            this.node.context().global.set("miwifi-login-block", this.node_id);
        }

        this.clear = function clear() {
            if (this.node.context().global.get("miwifi-login-block")) {
                this.node.context().global.set("miwifi-login-block");
            }

            if (this.node.context().global.get(this.id)) {
                this.node.context().global.set(this.id);
            }
        }.bind(this);

        this.node.on('close', this.clear)
    }

    buildurl(path) {
        return urljoin(this.address, path);
    }

    getApiEndpoint(endpoint) {
        return axios.get(
            urljoin(this.address, '/cgi-bin/luci/;stok=' + this.token, '/api/', endpoint)
        ).then(result => {
            return result.data;
        }).catch(error => {
            this.node.error(error);

            return undefined;
        });
    }

    postApiEndpoint(endpoint, param) {
        return axios.post(
            urljoin(this.address, '/cgi-bin/luci/;stok=' + this.token, '/api/', endpoint),
            querystring.stringify(param),
            {timeout: 180000}
        ).then(result => {
            return result.data;
        }).catch(error => {
            this.node.error(error);

            return undefined;
        });
    }

    login(force) {
        const nonce = this.encrypt.init();
        const oldPwd = this.encrypt.oldPwd(this.password);
        const param = {
            username: 'admin',
            password: oldPwd,
            logtype: 2,
            nonce: nonce
        };

        if (this.node.context().global.get(this.id)) {
            this.token = this.node.context().global.get(this.id);
        }

        if (!force && this.token !== null) {
            var that = this;

            return new Promise(function (resolve, reject) {
                resolve(that.token);
            }).then(result => {
                return result;
            });
        }

        if (this.node.context().global.get("miwifi-login-block") !== this.node_id) {
            return new Promise(function (resolve, reject) {
                resolve();
            }).then(result => {
                return undefined;
            });
        }

        return axios.post(this.buildurl('/cgi-bin/luci/api/xqsystem/login'), querystring.stringify(param)).then(result => {
            this.token = result.data.token;

            this.node.context().global.set(this.id, this.token);

            this.node.context().global.set("miwifi-login-block");

            return this.token;
        }).catch(error => {
            this.node.error(error);

            return undefined;
        });
    }

    logout() {
        return axios.get(urljoin(this.address, '/cgi-bin/luci/;stok=' + this.token, 'web', 'logout'));
    }

    status() {
        return this.getApiEndpoint('xqnetwork/wan_info');
    }

    speed(history) {
        return this.postApiEndpoint('misystem/bandwidth_test', history ? {history: 1} : {add: 1});
    }

    reboot() {
        return this.getApiEndpoint('xqsystem/reboot');
    }
}

module.exports = MiWifi;
