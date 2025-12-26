import express from "express";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const app = express();
app.use(express.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


app.post("/start-call", async (req, res) => {
  try {
    const { userPhone, targetPhone } = req.body;

    if (!userPhone || !targetPhone) {
      return res.status(400).json({ message: "Phone numbers required" });
    }

    const call = await client.calls.create({
      to: userPhone,
      from: process.env.TWILIO_VIRTUAL_NUMBER,
      url: `https://vaarta-api.onrender.com/bridge?target=${encodeURIComponent(targetPhone)}`
    });

    res.json({
      success: true,
      callSid: call.sid,
      message: "Call initiated"
    });
  } catch (error) {
    console.error("CALL ERROR:", error);
    res.status(500).json({ error: error, message: "Failed to start call" });
  }
});


app.post("/bridge", (req, res) => {
  const target = req.query.target;

  const twiml = new twilio.twiml.VoiceResponse();
  const dial = twiml.dial({
    callerId: process.env.TWILIO_VIRTUAL_NUMBER
  });

  dial.number(target);

  res.type("text/xml");
  res.send(twiml.toString());
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port http://localhost:${process.env.PORT}`);
});
