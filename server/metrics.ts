import express = require("express");
import expressKeen = require("express-keenio");
import KeenTracking = require("keen-tracking");

const keenProjectId = process.env.KEEN_PROJECT_ID || "";
const keenWriteKey = process.env.KEEN_WRITE_KEY || "";

type Req = Express.Request & express.Request;
type Res = Express.Response & express.Response;

const addons = [
    {
        "name": "keen:ip_to_geo",
        "input": {
            "ip": "ipAddress"
        },
        "output": "geo"
    },
    {
        "name": "keen:url_parser",
        "input": {
            "url": "page.url"
        },
        "output": "url.info"
    },
    {
        "name": "keen:url_parser",
        "input": {
            "url": "referrer.url"
        },
        "output": "referrer.info"
    },
    {
        "name": "keen:date_time_parser",
        "input": {
            "date_time": "keen.timestamp"
        },
        "output": "time.utc"
    },
    {
        "name": "keen:date_time_parser",
        "input": {
            "date_time": "localTime"
        },
        "output": "time.local"
    }
];

export function configureMetricsRoutes(app: express.Application) {
    const keenClient = new KeenTracking({
        projectId: keenProjectId,
        writeKey: keenWriteKey
    });

    app.post("/recordEvent/:eventName", (req: Req, res: Res) => {
        if (!keenProjectId || !keenWriteKey) {
            return res.status(501).send("No metrics pipeline configured.");
        }

        const eventName = req.params.eventName;
        const eventData = req.body || {};
        eventData.sessionId = req.session.id;
        eventData.userId = req.session.userId || null;
        eventData.ipAddress = req.ip;
        eventData.keen = { addons };
        keenClient.recordEvent(eventName, eventData);

        return res.sendStatus(200);
    });

    if (!keenProjectId || !keenWriteKey) {
        console.warn("Keen configuration variables not set.");
        return;
    }

    /*expressKeen.configure({ client: { projectId: keenProjectId, writeKey: keenWriteKey } });
    app.use(expressKeen.handleAll());*/
}