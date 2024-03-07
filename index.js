/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const functions = require("firebase-functions");
const axios = require("axios");
// index.js

var admin = require("firebase-admin");
var serviceAccount = require("./firebase-admin-sdk/payakorn-e862a-firebase-adminsdk-oyp62-ef986f7405.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// ต่อไปนี้คุณสามารถใช้ Firebase Admin SDK ในโปรเจกต์ของคุณได้
// เพิ่มโค้ดเข้ามาที่นี่


exports.LineBotReply = functions.region("asia-east2").https.onRequest(async (req, res) => {
  if (req.body.events[0].message.type === "location") {
    const replyToken = req.body.events[0].replyToken;
    const latitude = req.body.events[0].message.latitude;
    const longitude = req.body.events[0].message.longitude;

    const AQI_API_KEY = "65664010-2e90-4bb2-a397-0609c2167602";
    const uri = `https://api.airvisual.com/v2/nearest_city?
      lat=${latitude}&lon=${longitude}&key=${AQI_API_KEY}`;
    try {
      const response = await axios.get(uri);
      const data = response.data.data;

      const city = data.city;
      const AQI = data.current.pollution.aqius;
      const temperature = data.current.weather.tp;
      const weatherIcon = data.current.weather.ic;

      // สร้าง URL ของไอคอนอากาศ
      let weatherIconUrl;
      let level; let bgColor; let textColor; let maskUrl;

      switch (weatherIcon) {
        case "01d":
          weatherIconUrl =
                "https://airvisual.com/images/01d.png";
          break;
        case "01n":
          weatherIconUrl =
                "https://airvisual.com/images/01n.png";
          break;
        case "02d":
          weatherIconUrl =
                "https://airvisual.com/images/02d.png";
          break;
        case "02n":
          weatherIconUrl =
                "https://airvisual.com/images/02n.png";
          break;
        case "03d":
          weatherIconUrl =
                "https://airvisual.com/images/03d.png";
          break;
        case "03n":
          weatherIconUrl =
                "https://airvisual.com/images/03n.png";
          break;
        case "04d":
          weatherIconUrl =
                "https://airvisual.com/images/04d.png";
          break;
        case "09d":
          weatherIconUrl =
                "https://airvisual.com/images/09d.png";
          break;
        case "10d":
          weatherIconUrl =
                "https://airvisual.com/images/10d.png";
          break;
        case "10n":
          weatherIconUrl =
                "https://airvisual.com/images/10n.png";
          break;
        case "11d":
          weatherIconUrl =
                "https://airvisual.com/images/11d.png";
          break;
        case "13d":
          weatherIconUrl =
                "https://airvisual.com/images/13d.png";
          break;
        case "50d":
          weatherIconUrl =
                "https://airvisual.com/images/50d.png";
      }
      if (AQI < 50) {
        level = "Good";
        bgColor = "#a8e05f";
        textColor = "#718b3A";
        maskUrl =
              "https://www.iqair.com/assets/aqi/ic-face-green.svg";
      } else if (AQI < 100) {
        level = "Moderate";
        bgColor = "#fdd74b";
        textColor = "#a57f23";
        maskUrl =
              "https://www.iqair.com/assets/aqi/ic-face-yellow.svg";
      } else if (AQI < 150) {
        level = "Unhealthy for Sensitive Groups";
        bgColor = "#fe9b57";
        textColor = "#b25826";
        maskUrl =
              "https://www.iqair.com/assets/aqi/ic-face-orange.svg";
      } else if (AQI < 200) {
        level = "Unhealthy";
        bgColor = "#fe6a69";
        textColor = "#af2c3b";
        maskUrl =
              "https://www.iqair.com/assets/aqi/ic-face-red.svg";
      } else if (AQI < 300) {
        level = "Very Unhealthy";
        bgColor = "#a97abc";
        textColor = "#634675";
        maskUrl =
              "https://www.iqair.com/assets/aqi/ic-face-purple.svg";
      } else {
        level = "Hazardous";
        bgColor = "#a87383";
        textColor = "#683e51";
        maskUrl =
              "https://www.iqair.com/assets/aqi/ic-face-maroon.svg";
      }

      // สร้างเนื้อหาของ Flex Message
      const message = {
        type: "bubble",
        header: {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: city,
              color: "#414141",
              gravity: "center",
              size: "xl",
              wrap: true,
              flex: 3,
            },
            {
              type: "image",
              url: weatherIconUrl,
              size: "xs",
              flex: 1,
            },
            {
              type: "text",
              text: `${temperature} °C`,
              color: "#414141",
              size: "lg",
              align: "end",
              gravity: "center",
              flex: 1,
            },
          ],
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "image",
                  url: maskUrl,
                  size: "md",
                  align: "start",
                },
                {
                  type: "text",
                  text: level,
                  wrap: true,
                  size: "lg",
                  color: textColor,
                  gravity: "center",
                },
              ],
              margin: "xxl",
            },
            {
              type: "box",
              layout: "baseline",
              contents: [
                {
                  type: "text",
                  text: `${AQI}`,
                  color: textColor,
                  size: "5xl",
                  align: "center",
                },
                {
                  type: "text",
                  text: "US AQI",
                  color: textColor,
                  size: "xs",
                  margin: "sm",
                },
              ],
            },
          ],
        },
        styles: {
          body: {
            backgroundColor: bgColor,
          },
        },
      };

      // ส่ง Flex Message กลับไปยังผู้ใช้
      const CHANNEL_ACCESS_TOKEN = functions.config().linebot.channel_access_token;
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      };

      await axios.post("https://api.line.me/v2/bot/message/reply", {
        replyToken: replyToken,
        messages: [message],
      }, {
        headers: headers,
      });

      res.status(200).send("Message sent successfully");
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(400).send("Invalid Request");
  }
});
