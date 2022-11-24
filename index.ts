import Leaderboard from './src/Leaderboard.js'
import BortexelAPI from './src/BortexelAPI.js'
import ActivityWatcher from './src/ActivityWatcher.js'
import fs from 'fs'

async function start() {
    const token = process.env.BORTEXEL_TOKEN
    const url = process.env.BORTEXEL_URL
    if (typeof token === 'undefined' || typeof url === 'undefined') {
        console.error('BORTEXEL_TOKEN or BORTEXEL_URL is not set')
        return
    }

    const limitExpansionKey = process.env.STATS_LIMIT_EXPANSION_KEY
    if (typeof limitExpansionKey === 'undefined') {
        console.error('STATS_LIMIT_EXPANSION_KEY is not set')
        return
    }

    const servers = JSON.parse(fs.readFileSync('servers.json', 'utf-8'))

    const leaderboard = new Leaderboard('https://stats.bortexel.net/', limitExpansionKey)
    const playersActivity = await leaderboard.fetchTotalActivity(servers)

    if (!playersActivity) return
    const watcher = new ActivityWatcher(playersActivity)
    await watcher.load()
    const recentlyPlayed = watcher.getRecentlyPlayed()
    await watcher.save()

    const api = new BortexelAPI({
        token, url,
    }, {
        requiredHours: 3,
        activeDays: 3,
    })

    await api.fetchAllUsers()
    await api.reportInactive()
    await api.reportActive(recentlyPlayed)
}

start().then(() => {})
