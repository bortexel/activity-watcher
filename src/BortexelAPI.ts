import { default as Bortexel } from "@bortexel/bortexeljs/bortexel.js";
import User from "@bortexel/bortexeljs/models/users/user.js";

export default class BortexelAPI {
    private readonly users: User[]
    private readonly client: Bortexel
    private readonly requiredHours: number
    private readonly activeDays: number

    constructor(apiConfig: { url: string, token: string }, activityConfig: { requiredHours: number, activeDays: number }) {
        // @ts-ignore
        this.client = new Bortexel.default({
            token: apiConfig.token,
            url: apiConfig.url
        })

        this.requiredHours = activityConfig.requiredHours
        this.activeDays = activityConfig.activeDays

        this.users = []
    }

    now() {
        return new Date().getTime()
    }

    async fetchAllUsers() {
        if (this.users.length > 0) return this.users
        console.log("Fetching list of all users from API")
        let start = new Date().getTime()

        let currentPage = 1
        let totalPages = 99

        for (currentPage; currentPage < totalPages; currentPage++) {
            // @ts-ignore
            let response = await User.default.getAll(this.client, currentPage)
            this.users.push(...response.getResponse())
            totalPages = response.getResponseMeta().pagination.totalPages
        }

        console.log(`Successfully fetched ${ this.users.length } users in ${ new Date().getTime() - start }ms`)
    }

    async findInactive() {
        console.log("Searching for inactive users")
        let inactiveUsers = []

        for (let i in this.users) {
            if (!this.users.hasOwnProperty(i)) continue
            let user = this.users[i]
            // @ts-ignore
            let apiUser = new User.default(user)
            if (!apiUser.activeTill) continue
            let activeTill = new Date(apiUser.activeTill).getTime()
            if (activeTill < this.now()) inactiveUsers.push(user)
        }

        console.log(`Found ${ inactiveUsers.length } inactive users`)
        return inactiveUsers
    }

    async reportInactive() {
        console.log("Sending info about inactive users to API")
        let start = new Date().getTime()
        let inactiveUsers = await this.findInactive()

        for (let i in inactiveUsers) {
            if (!inactiveUsers.hasOwnProperty(i)) continue
            let user = inactiveUsers[i]
            // @ts-ignore
            await new User.default(user).reportInactivity(this.client)
        }

        console.log(`Successfully reported info about ${ inactiveUsers.length } inactive users in ${ new Date().getTime() - start }ms`)
    }

    async findActive(recentlyPlayed: { [key: string]: number }) {
        console.log("Searching for active users")
        let activeUsers = []
        let users = this.getUsersMap()

        for (let username in recentlyPlayed) {
            if (!recentlyPlayed.hasOwnProperty(username)) continue
            if (!users.hasOwnProperty(username)) continue
            if (recentlyPlayed[username] < this.requiredHours * 3600) continue
            activeUsers.push(users[username])
        }

        console.log(`Found ${ activeUsers.length } active users`)
        return activeUsers
    }

    async reportActive(recentlyPlayed: { [key: string]: number }) {
        console.log("Sending info about active users to API")
        let start = new Date().getTime()
        let activeUsers = await this.findActive(recentlyPlayed)

        for (let i in activeUsers) {
            if (!activeUsers.hasOwnProperty(i)) continue
            let user = activeUsers[i]
            // @ts-ignore
            let response = await new User.default(user).reportActivity(this.client, this.getActiveTill())
            console.log(response.getErrors());
        }

        console.log(`Successfully reported info about ${ activeUsers.length } active users in ${ new Date().getTime() - start }ms`)
    }

    getUsersMap() {
        let users: { [key: string]: User } = {}

        for (let i in this.users) {
            if (!this.users.hasOwnProperty(i)) continue
            // @ts-ignore
            let user = new User.default(this.users[i])
            users[user.username] = user
        }

        return users
    }

    getActiveTill() {
        return new Date(new Date().getTime() + this.activeDays * 24 * 3600 * 1000)
    }
}