import fetch from 'node-fetch'

const playTimeField = {
    groupName: 'bortexel:totals',
    fieldName: 'bortexel:play_time'
}

export default class Leaderboard {
    private readonly url: string
    private readonly key: string

    constructor(url: string, key: string) {
        this.url = url
        this.key = key
    }

    async fetchTotalActivity(servers: {
        season: number,
        serverName: string,
    }[]): Promise<{ [key: string]: number } | null> {
        const totalActivity : { [key: string]: number } = {}

        for (const server of servers) {
            const serverActivity = await this.fetchServerActivity(server)
            if (serverActivity == null) {
                console.error(`Skipping handling of activity of ${ server.serverName } #${ server.season }`)
                continue
            }

            for (const playerID of Object.keys(serverActivity)) {
                if (totalActivity.hasOwnProperty(playerID)) {
                    totalActivity[playerID] += serverActivity[playerID]
                } else totalActivity[playerID] = serverActivity[playerID]
            }
        }

        return totalActivity
    }

    async fetchServerActivity(server: {
        season: number,
        serverName: string,
    }): Promise<{ [key: string]: number } | null> {
        console.log(`Fetching activity for server ${ server.serverName } #${ server.season } from stats server`)
        let start = new Date().getTime()

        let response = await fetch(this.url, {
            method: 'POST',
            body: JSON.stringify({
                server,
                filter: [ playTimeField ],
                sort: {
                    field: playTimeField,
                    direction: 'descending',
                },
                limitExpansionKey: this.key,
            })
        })

        let data = await response.json()
        let players: { [key: string]: number } = {}

        // @ts-ignore
        for (const player of data) {
            players[player.uuid] = player.stats['bortexel:totals']['bortexel:play_time']
        }

        console.log(`Successfully fetched activity for ${ Object.keys(players).length } players in ${ new Date().getTime() - start }ms`)
        return players
    }
}
