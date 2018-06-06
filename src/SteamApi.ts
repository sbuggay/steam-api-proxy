import fetch from "node-fetch";

export function GetStoreFeatured() {
    return fetch("http://store.steampowered.com/api/featured/").then(res => res.json());
}