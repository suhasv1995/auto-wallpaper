require("isomorphic-fetch");
const fs = require("fs");

fetch("https://www.sony.net/united/clock/assets/js/heritage_data.js")
  .then((response) => response.text())
  .then((response) => {
    const matches = response
      .match(/id:"(.*?)"/g)
      .map((entry) => entry.replace(/(id:"|")/g, ""));
    console.log(matches.join(","));
    fs.writeFileSync("sites.txt", matches.join(","));
    console.log("Created sites.txt!");
  })
  .catch((err) => {
    console.error(err);
  });
