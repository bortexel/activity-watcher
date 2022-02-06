import fs from 'fs'

export default class ActivityWatcher {
    private readonly players: { [key: string]: number }
    private storage: { players: { [key: string]: number } }

    constructor(players: { [key: string]: number }) {
        this.players = players
        this.storage = { players: {} }
    }

    getActualTotalPlayed(username: string) {
        if (this.players.hasOwnProperty(username)) return this.players[username]
        return 0
    }

    getPreviousTotalPlayed(username: string) {
        if (this.storage.players.hasOwnProperty(username)) return this.storage.players[username]
        return 0
    }

    getRecentlyPlayed() {
        let recentlyPlayed: { [key: string]: number } = {}

        for (let username in this.players) {
            if (!this.players.hasOwnProperty(username)) continue
            let actualTotalPlayed = this.players[username]
            let previousTotalPlayed = this.getPreviousTotalPlayed(username)

            if (actualTotalPlayed < previousTotalPlayed) continue
            this.storage.players[username] = actualTotalPlayed
            recentlyPlayed[username] = actualTotalPlayed - previousTotalPlayed
        }

        return recentlyPlayed
    }

    async save() {
        try {
            fs.writeFileSync(this.getStoragePath(), JSON.stringify(this.storage))
            console.log(`Successfully saved data to ${ this.getStoragePath() }`)
        } catch (error) {
            console.error(`Failed saving data to ${ this.getStoragePath() }: ${ error }`)
        }
    }

    async load() {
        try {
            let data = fs.readFileSync(this.getStoragePath(), 'utf8')
            this.storage = JSON.parse(data)
            console.log(`Successfully loaded data from ${ this.getStoragePath() }`)

            if (typeof this.storage.players === 'undefined') {
                this.storage.players = {}
                console.warn('Field for player data was empty, using empty object for player storage')
            }
        } catch (error) {
            this.storage = { players: {} }
            console.error(`Failed loading data from ${ this.getStoragePath() }: ${ error }`)
            console.log('Using empty storage')
        }
    }

    getStoragePath(): string {
        return 'storage/storage.json'
    }
}