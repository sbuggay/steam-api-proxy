import * as express from "express";
import fetch from "node-fetch";
import * as cors from "cors";

import buildCache from "./Cache";
import { GetStoreFeatured } from "./SteamApi";

const PORT = 8080;

const apiKey = "7B4DEF2A374D9B1AA1E9BC9538412237";
const apiEndpoint = "http://api.steampowered.com";

const app = express();
app.use(cors());

const cache = buildCache(false);

const Endpoints = {
    PlayerSummary: `ISteamUser/GetPlayerSummaries/v2/`,
    Games: `IPlayerService/GetOwnedGames/v1/`,
    RecentGames: `IPlayerService/GetRecentlyPlayedGames/v1/`,
    FriendList: `ISteamUser/GetFriendList/v1/`,
    SteamNews: `ISteamNews/GetNewsForApp/v2/`,
    Achievements: `/ISteamUserStats/GetPlayerAchievements/v1/`,
    SteamLevel: "/IPlayerService/GetSteamLevel/v1",
}

async function SteamApi(method: string, params: any) {
    let url = `${apiEndpoint}/${method}?key=${apiKey}&format=json`;
    params = Object.keys(params).map(key =>
        `${key}=${params[key]}`).join("&");
    const request = `${url}&${params}`;
    console.log(request);

    const exists = await cache.exists(request);

    if (exists) {
        return cache.get(request).then((res: any) => JSON.parse(res));
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

app.get("/achievements/:id", (req, res) => {
    SteamApi(Endpoints.Achievements, {
        steamid: req.params.id,
        appid: req.query.appid
    }
    ).then(data => res.send(data));
});

app.get("/featured", (req, res) => {
    GetStoreFeatured().then(data => {
        res.send(data);
    });
});


app.listen(PORT, () => {
    cache.clear();
    console.log(`listening on port ${PORT}`);
});