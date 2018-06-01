const fetch = require("node-fetch");
const cors = require("cors");
const redis = require("redis");
const { promisify } = require("util");
const client = redis.createClient();

const getAsync = promisify(client.get).bind(client);
const existsAsync = promisify(client.exists).bind(client);

const PORT = 8080;

const apiKey = "";
const apiEndpoint = "http://api.steampowered.com";

const express = require("express");
const app = express();
app.use(cors());

const Endpoints = {
    PlayerSummary: `ISteamUser/GetPlayerSummaries/v2/`,
    Games: `IPlayerService/GetOwnedGames/v1/`,
    RecentGames: `IPlayerService/GetRecentlyPlayedGames/v1/`,
    FriendList: `ISteamUser/GetFriendList/v1/`,
    SteamNews: `ISteamNews/GetNewsForApp/v2/`,
    Achievements: `ISteamUserStats/GetUserStatsForGame/v2`
}

async function SteamApi(method, params) {
    url = `${apiEndpoint}/${method}?key=${apiKey}&format=json`;
    params = Object.entries(params).map(([key, val]) =>
        `${key}=${val}`).join("&");
    const request = `${url}&${params}`;
    console.log(request);

    const exists = await existsAsync(request);

    if (exists) {
        return getAsync(request).then(res => JSON.parse(res));
    }
    else {
        const res = await fetch(request).then(res => res.json());
        client.set(request, JSON.stringify(res));
        return res;
    }
}

app.get("/playerSummary/:id", (req, res) => {
    SteamApi(Endpoints.PlayerSummary, {
        steamids: req.params.id
    }).then(data => res.send(data));
});

app.get("/gameList/:id", (req, res) => {
    SteamApi(Endpoints.Games, {
        input_json: JSON.stringify({
            steamid: req.params.id,
            include_appinfo: true
        })
    }).then(data => res.send(data));
});

app.get("/recentGameList/:id", (req, res) => {
    SteamApi(Endpoints.RecentGames, {
        steamid: req.params.id
    }).then(data => res.send(data));
});

app.get("/friendList/:id", (req, res) => {
    SteamApi(Endpoints.FriendList, {
        steamid: req.params.id,
        relationship: "all"
    }).then(data => res.send(data));
});

app.get("/steamNews/:id", (req, res) => {
    SteamApi(Endpoints.SteamNews, {
        appid: req.params.id,
        count: 3,
        maxlength: 200
    }).then(data => res.send(data));
});

app.get("/achievements/:id", (req, res) => {
    SteamApi(Endpoints.Achievements, {
        input_json: JSON.stringify({
            steamid: req.params.id,
            appid: req.query.appid
        })
    }).then(data => res.send(data));
});

app.listen(PORT, () => {
    client.flushdb();
    console.log(`listening on port ${PORT}`);
});