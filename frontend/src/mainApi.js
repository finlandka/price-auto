class MainApi {
    constructor({ baseUrl }) {
        this._baseUrl = baseUrl;
        this.userId = null;
    }

    _request(endpoint, options) {
        return fetch(`${this._baseUrl}/${endpoint}`, options).then((res) =>
            this._getResponseData(res)
        );
    }

    _getResponseData(res) {
        if (!res.ok) {
            return Promise.reject(`Ошибка: ${res.status}`);
        }
        return res.json();
    }

    _getHeaders() {
        const token = localStorage.getItem('token');
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }

    authorization(email, password) {
        return fetch(`${this._baseUrl}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })
            .then((result) => this._getResponseData(result))
    }

    getToken(token) {
        return fetch(`${this._baseUrl}/api/admin`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }).then((result) => this._getResponseData(result));
    }

    getUserInfo() {
        return this._request("api/admin", { headers: this._getHeaders() }).then(
            (resp) => {
                this.userId = resp._id;
                return resp;
            }
        );
    }
}

module.exports = MainApi;