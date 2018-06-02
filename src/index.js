const fetch = require("node-fetch");
const cors = require("cors");

const Cache = require("./Cache");

const PORT = 8080;

const apiKey = "";
const apiEndpoint = "http://api.steampowered.com";

const express = require("express");
const app = express();
app.use(cors());

const cache = new Cache();

const Endpoints = {
    PlayerSummary: `ISteamUser/GetPlayerSummaries/v2/`,
    Games: `IPlayerService/GetOwnedGames/v1/`,
    RecentGames: `IPlayerService/GetRecentlyPlayedGames/v1/`,
    FriendList: `ISteamUser/GetFriendList/v1/`,
    SteamNews: `ISteamNews/GetNewsForApp/v2/`,
    Achievements: `/ISteamUserStats/GetPlayerAchievements/v1/`
}

async function SteamApi(method, params) {
    url = `${apiEndpoint}/${method}?key=${apiKey}&format=json`;
    params = Object.entries(params).map(([key, val]) =>
        `${key}=${val}`).join("&");
    const request = `${url}&${params}`;
    console.log(request);

    const exists = await cache.exists(request);

    if (exists) {
        return cache.get(request).then(res => JSON.parse(res));
    }
    else {
        const res = await fetch(request).then(res => res.json());
        cache.set(request, JSON.stringify(res));
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
        maxlength: 300
    }).then(data => res.send(data));
});

app.get("/achievements/:id", (req, res) => {
    SteamApi(Endpoints.Achievements, {
        steamid: req.params.id,
        appid: req.query.appid
    }
    ).then(data => res.send(data));
});

app.listen(PORT, () => {
    cache.clear();
    console.log(`listening on port ${PORT}`);
});