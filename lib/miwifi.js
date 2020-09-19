'use strict';

const urljoin = require('url-join');
const querystring = require('querystring');
const axios = require('axios');
const md5 = require('md5');
const Encrypt = require('./encrypt.js');

class MiWifi {
    constructor(address, password, mac) {
        this.mac = mac;
        this.address = address || 'http://miwifi.com';
        this.password = password
        this.encrypt = new Encrypt(this.mac);
        this.token = null;
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

    login() {
        let nonce = this.encrypt.init();

        return axios.post(
            this.buildurl('/cgi-bin/luci/api/xqsystem/login'),
            querystring.stringify({
                username: 'admin',
                password: this.encrypt.oldPwd(this.password),
                logtype: 2,
                nonce: nonce
            })
        ).then(result => {
            this.token = result.data.token;

            return this.token;
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
