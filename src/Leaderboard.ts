import unfetch from 'isomorphic-unfetch'

export default class Leaderboard {
    private readonly url: string

    constructor(url: string) {
        this.url = url
    }

    async fetchPlayersActivity() {
        console.log('Fetching activity of players from leaderboard')
        let start = new Date().getTime()

        let response = await unfetch(this.url)
        let data = await response.json()
        let players: { [key: string]: number } = {}

        for (let i in data.response) {
            if (!data.response.hasOwnProperty(i)) continue
            let entry = data.response[i]
            players[entry.player] = entry.total_played
        }

        console.log(`Successfully fetched activity for ${ Object.keys(players).length } players in ${ new Date().getTime() - start }ms`)
        return players
    }
}