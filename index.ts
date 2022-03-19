import Leaderboard from './src/Leaderboard.js'
import BortexelAPI from './src/BortexelAPI.js'
import ActivityWatcher from './src/ActivityWatcher.js'

async function start() {
    let token = process.env.BORTEXEL_TOKEN
    let url = process.env.BORTEXEL_URL
    if (typeof token === 'undefined' || typeof url === 'undefined') {
        console.error('BORTEXEL_TOKEN or BORTEXEL_URL is not set')
        return
    }

    let leaderboard = new Leaderboard('https://api.bortexel.net/method/leaderboard/get.php?extended=true')
    let playersActivity = await leaderboard.fetchPlayersActivity()

    let watcher = new ActivityWatcher(playersActivity)
    await watcher.load()
    let recentlyPlayed = watcher.getRecentlyPlayed()
    await watcher.save()

    let api = new BortexelAPI({
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
