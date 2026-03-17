import { Hono } from "hono";
import { cors } from "hono/cors";
import { SitesDAO } from "./sites.dao";
import { WeatherDAO } from "./wheather.dao";
import { OpenMeteoService } from "./open-meteo.service";
import { D1Database } from "@cloudflare/workers-types";

type Env = {
    DB: D1Database
};

const app = new Hono<{ Bindings: Env }>();

app.use(cors());

app.get("/", (c) => c.text("Cron Worker is alive!"));

// Retourne les prévisions horaires d'un site pour une plage de dates
app.get("/forecast/:siteId", async (c) => {
    const siteId = c.req.param("siteId");
    const startDate = c.req.query("start_date") ?? new Date().toISOString().slice(0, 10);
    const endDate = c.req.query("end_date") ?? startDate;

    const weatherDAO = new WeatherDAO(c.env.DB);
    const rows = await weatherDAO.getForSite(siteId, startDate, endDate);
    return c.json(rows);
});

// Export pour Worker + cron
export default {
    fetch: app.fetch,

    // Cron Handler appelé toutes les 3h
    async scheduled(event: ScheduledEvent, env: Env) {
        console.log('🔥 Cron triggered:', new Date().toISOString());

        const sitesDAO = new SitesDAO(env.DB);
        const weatherDAO = new WeatherDAO(env.DB);
        const openMeteoService = new OpenMeteoService();

        const sites = await sitesDAO.getAll();

        for (const site of sites) {
            try {
                const forecast = await openMeteoService.fetchForecast(site);
                await weatherDAO.insertForecast(site.id, forecast);
                console.log(`✅ Updated site ${site.id}`);
            } catch (err) {
                console.error(`❌ Error fetching site ${site.id}:`, err);
            }
        }

        console.log('🔥 Cron finished:', new Date().toISOString());
    }
};