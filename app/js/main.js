import L from "leaflet";

import { ipifyAPIKey } from "./helpers/constants";
import { fetchData } from "./utils/fetchData";

let mapContainer;

const dom = {
  form: document.querySelector(".form"),
  info: {
    ip: document.querySelector("#ip"),
    location: document.querySelector("#location"),
    timezone: document.querySelector("#timezone"),
    isp: document.querySelector("#isp"),
  },
  map: document.querySelector("#map"),
};

const setInfo = ({ ip, country, city, timezone, isp }) => {
  dom.info.ip.innerText = ip;
  dom.info.location.innerText = `${country}, ${city}`;
  dom.info.timezone.innerText = `UTC ${timezone}`;
  dom.info.isp.innerText = isp;
};

const setMap = (lat, lng, mapContainer = "") => {
  if (mapContainer) {
    mapContainer.off();
    mapContainer.remove();
  }

  const markerIcon = L.icon({
    iconUrl: "images/compressed/map/marker-icon.png",
  });

  const map = L.map(dom.map).setView([lat, lng], 16);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);
  L.marker([lat, lng], { icon: markerIcon }).addTo(map);

  return map;
};

const getInfo = async (ip) => {
  const getInfoUrl = `https://geo.ipify.org/api/v2/country,city?apiKey=${ipifyAPIKey}&ipAddress=${ip}`;
  const {
    location: { country, city, lat, lng, timezone },
    isp,
  } = await fetchData(getInfoUrl);
  return { ip, country, city, timezone, isp, lat, lng };
};

const formHandler = (e) => {
  e.preventDefault();
  const regExp =
    /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const formData = new FormData(e.target);
  const { formIp } = Object.fromEntries(formData);

  if (regExp.test(formIp)) {
    getInfo(formIp).then(({ ip, country, city, timezone, isp, lat, lng }) => {
      setInfo({ ip, country, city, timezone, isp });
      mapContainer = setMap(lat, lng, mapContainer);
    });
  } else {
    alert("Only correct ip adresses allowed :)");
    return;
  }
};

const main = async () => {
  const getIpUrl = "https://api.ipify.org?format=json";
  const { ip: userIp } = await fetchData(getIpUrl);
  const { ip, country, city, timezone, isp, lat, lng } = await getInfo(userIp);
  setInfo({ ip, country, city, timezone, isp });
  mapContainer = setMap(lat, lng);
};

window.addEventListener("DOMContentLoaded", main);
dom.form.addEventListener("submit", formHandler);
