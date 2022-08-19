const express = require('express')
const socket = require('socket.io')

var PORT = process.env.PORT || 3000;
var app = express()
var server = app.listen(PORT, function() {
    console.log('Listening on port ' + PORT)
})

app.use(express.static('public'))
var io = socket(server)
var users = {}
const citizen = [
    20,
    25,
    27,
    38,
    40,
    42,
    44,
    50,
    69,
    70,
    120,
    350,
    170,
    200,
    100,
    150,
    154,
]

const global = {
    citizens: citizen[Math.floor(Math.random() * citizen.length)],
    economy: 1000,
    buildings: 25,
    upgrades: {
        gems: {
            unlocked: true,
            bought: false,
            price: 2000
        },
        office_lean: {
            unlocked: true,
            bought: false,
            price: 4000
        },
        enchanted_cat: {
            unlocked: false,
            bought: false,
            price: 7800
        },
        worker_steroids: {
            unlocked: true,
            bought: false,
            price: 180
        },
    },
    workers: 0,
    income: 0,
    level: 0,
    laidoff: 0,
    xp: 0,
    cats: 0,
    maxxp: 100,
    news: 'Society is in-balance! News news news!'
}

const achievements = {
    firststart: false,
    firstmine: false,
    war: false,
    firstcat: false,
    enoughmoney: false,
    stableeconomy: false,
    firstlayoff: false,
    bankrupt: false,
    firstmayhem: false,
    helloworld: false
}

const adata = {
    firstlayoff: {
        title: 'Lets make that final',
        description: 'Lay off your first worker.'
    },
    helloworld: {
        title: 'Hello world!',
        description: 'Hire a worker!'
    },
    bankrupt: {
        title: 'How did we get here?',
        description: 'Achieve bankruptcy.'
    },
    war: {
        title: 'LAY OFF WORKER, LAY OFF SOCIETY!',
        description: 'Achieve "Worker War".'
    },
    firstmayhem: {
        title: 'Uh oh',
        description: 'Start the first mayhem.'
    },
    firststart: {
        title: 'New Beginnings',
        description: 'Achieve the start of society.'
    },
    firstcat: {
        title: 'Meow!',
        description: 'Buy our first cat.'
    },
    firstmine: {
        title: 'Clicker Game',
        description: 'Mine money for the first time.'
    },
    enoughmoney: {
        title: 'That is enough MONEY.',
        description: 'Achieve 1 million cash.'
    },
    stableeconomy: {
        title: 'Capital City',
        description: 'Achieve a stable economy.'
    }
}

const begin = Math.floor(global.citizens / 2.5)
global.workers = begin

console.log(`Selected citizens: ${global.citizens}`)
console.log(`Selected workers: ${global.workers}`)

io.on('connection', function(client) {
    client.on('user-connection', (data) => {
        console.log(`Identified User ${data}, adding to user list.`)

        users[client.id] = {
            username: data,
            mayhemcaused: 0,
            left: false
        }
        
        if(achievements.firststart == false){
            achievements.firststart = true

            io.emit('achievement', adata.firststart)
        }
        io.emit('user-connection', users, global)
    })

    client.on('mine', () => {
        if(achievements.firstmine == false){
            achievements.firstmine = true
            global.news = 'The government has learnt how to mine money.'

            io.emit('achievement', adata.firstmine)
            io.emit('updateglobal', global)
        }
        if(global.upgrades.gems.bought){
            global.economy += 2
            global.xp += 4
        }else{
            global.economy += 1
            global.xp += 2
        }

        if (global.xp >= global.maxxp){
            global.xp = 0
            global.level += 1
            global.maxxp = Math.round(100 * (global.level / 1.423))
        }

        io.emit('updateglobal', global)
    })

    client.on('upgrade', (data) => {
        if(global.upgrades[data].unlocked && global.upgrades[data].bought == false){
            global.upgrades[data].bought = true

            global.economy -= global.upgrades[data].price

            io.emit('updateglobal', global)
        }
    })

    client.on('mayhem', (data) => {
        if(data.type == 'mayhem'){
            if(data.action == 'lay'){
                if(achievements.war == false){
                    global.workers -= 1
                    users[client.id].mayhemcaused += 1
                    io.emit('user-connection', users, global)
                    if (achievements.firstlayoff == false){
                        achievements.firstlayoff = true
                        global.news = 'Worker is laid off!'
                        
                        io.emit('achievement', adata.firstlayoff)
                    }

                    global.xp += 15
                    if (global.xp >= global.maxxp){
                        global.xp = 0
                        global.level += 1
            	        global.maxxp = Math.round(100 * (global.level / 1.423))
        	        }
                    io.emit('updateglobal', global)
                }
                if (global.workers <= 0 && achievements.war == false){
                    achievements.war = true
                    client.emit('message', 'war')
                    global.news = 'Workers are going into war.'
                
                    io.emit('achievement', adata.war)
                    io.emit('updateglobal', global)
                    War()
                }
            }else if(data.action == 'destroy'){
                if (global.buildings > 0){
                    global.buildings -= 1
                    global.xp += 35
                    if (global.xp >= global.maxxp){
                        global.xp = 0
                        global.level += 1
            	        global.maxxp = Math.round(100 * (global.level / 1.423))
        	        }
                    users[client.id].mayhemcaused += 1
                    io.emit('user-connection', users, global)

                    global.economy += 2500
                    io.emit('updateglobal', global)
                }
            }
        }else if(data.type == 'normal'){
            if (data.action == 'buy'){
                if(data.thing == 'cat'){
                    global.economy -= 5000
                    global.cats += 1
		            global.xp += 5

                    if (global.cats >= 5 && global.upgrades.enchanted_cat.unlocked == false){
                        global.upgrades.enchanted_cat.unlocked = true

                        io.emit('message', {message: 'The enchanted cat is now unlocked!'})
                    }
                    if (global.xp >= global.maxxp){
                        global.xp = 0
                        global.level += 1
            	        global.maxxp = Math.round(100 * (global.level / 1.423))
        	    }
                    if (global.economy < 0 && achievements.bankrupt == false){
                        achievements.bankrupt = true
                        global.news = 'Bankruptcy.'
                        io.emit('message', {message: 'You are now bankrupt! No way out!'})
                    
                        io.emit('achievement', adata.bankrupt)
                        io.emit('updateglobal', global)
                    }
                    if(achievements.firstcat == false){
                        achievements.firstcat = true
                        
                        io.emit('achievement', adata.firstcat)
                    }

                    io.emit('updateglobal', global)
                }
            }else if(data.action == 'hire'){
                if(data.thing == 'worker'){
                    if(achievements.war == true){
                        client.emit('message', {message: 'The war is on.'})
                    }else {
                        if (global.workers >= global.citizens) {
                            global.workers = global.citizens
                        }else {
                            global.workers += 1
                            global.economy -= 50
                            if(achievements.helloworld == false){
                                achievements.helloworld = true

                                io.emit('achievement', adata.helloworld)
                            }

                            io.emit('updateglobal', global)
                        }
                    }
                }
            }
        }
    })
})

function War(){

}

function Profits(){
    const EconomicsProfit = {
        cats: 50,
        workers: 20,
        buildings: 175
    }

    setTimeout(() => {
        const cats = EconomicsProfit.cats * global.cats
        const buildings = EconomicsProfit.buildings * global.buildings
        var workers 
        if(achievements.war){
            workers = -EconomicsProfit.workers * (begin * 2)
        }else {
            workers = EconomicsProfit.workers * global.workers
        }
        const Tally = cats + buildings + workers
        
        global.income = Tally
        global.economy += Tally
        if (global.economy < 0 && achievements.bankrupt == false){
            achievements.bankrupt = true
            global.news = 'Bankruptcy.'
            io.emit('message', {message: 'You are now bankrupt! No way out!'})
        
            io.emit('achievement', adata.bankrupt)
            io.emit('updateglobal', global)
        }else {
            io.emit('updateglobal', global)
        }

        Profits()
    }, 10000)
}

Profits()