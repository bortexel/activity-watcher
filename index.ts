import Leaderboard from "./src/Leaderboard.js";
import BortexelAPI from "./src/BortexelAPI.js";
import ActivityWatcher from "./src/ActivityWatcher.js";

async function start() {
    let leaderboard = new Leaderboard("https://api.bortexel.ru/method/leaderboard/get.php")
    let playersActivity = await leaderboard.fetchPlayersActivity()

    let watcher = new ActivityWatcher(playersActivity)
    await watcher.load()
    let recentlyPlayed = await watcher.getRecentlyPlayed()
    await watcher.save()

    let api = new BortexelAPI("https://api.bortexel.ru/v3", "") // TODO: Implement config
    await api.fetchAllUsers()
    await api.reportInactive()
    await api.reportActive(recentlyPlayed)
}

start().then(() => {})