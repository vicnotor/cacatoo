let sim;

var deathP = 0.1
var prodP = 0.8
var cost = 0.6
var benefit = 0.8

function cacatoo() {
  let config = {
    title: "Invasion of non-cooperators",
    description: "",
    maxtime: 1000000,
    ncol: 200,
    nrow: 200,
    wrap: [true, true],
    seed: 56,
    fps: 60,
    fastmode: false,
    scale: 3,
    graph_interval: 10,
    graph_update: 50,
    statecolours: {
      'species': {
        'P': "green",
        'N': "red",
        0: "black"
      },
      'public_good': {
        'nothing': 'black',
        'public_good': 'white'
      }
    }
  }

  sim = new Simulation(config)

  sim.makeGridmodel("invasion")
  sim.makeGridmodel("particles")
  sim.initialGrid("invasion", "species", 0) // Default all cells to 0
  sim.initialSpot(sim.invasion, "species", 'P', 16, sim.invasion.nc / 2, sim.invasion.nr / 2)
  sim.initialSpot(sim.particles, "public_good", 'public_good', 32, sim.invasion.nc / 2, sim.invasion.nr / 2)

  sim.createDisplay("invasion", "species", "")
  sim.createDisplay("particles", "public_good", "")

  sim.invasion.nextState = function(i, j) {
    let species = this.grid[i][j].species;
    let pNeighbors = this.countMoore8(sim.invasion, i, j, 'species', 'P')
    let nNeighbors = this.countMoore8(sim.invasion, i, j, 'species', 'N')
    let random = this.rng.random()

    if (species == 0) {
      if (sim.particles.grid[i][j].public_good == 'public_good' && nNeighbors > 0 && random < benefit) {
        sim.particles.grid[i][j].public_good = 'nothing'
        return this.grid[i][j].species = 'N'
      }
      if (random < cost)
        this.grid[i][j].species = 0
      else if (sim.particles.grid[i][j].public_good == 'public_good' && pNeighbors > 0 && random < benefit) {
        sim.particles.grid[i][j].public_good = 'nothing'
        this.grid[i][j].species = 'P'
      }
    }

    if (species == "P") {
      if (random < deathP)
        this.grid[i][j].species = 0
      else if (random < prodP)
        sim.particles.grid[i][j].public_good = 'public_good'
    }


  }
  sim.particles.nextState = function(i, j) { }

  sim.invasion.update = function() {
    this.synchronous()
  }
  sim.particles.update = function() {
    this.MargolusDiffusion()
  }

  sim.addButton("pause/continue", function() { sim.toggle_play() })
  sim.addButton("well-mix", function() { sim.toggle_mix() })

  sim.addButton("Let N invade", function() {
    sim.initialSpot(sim.invasion, "species", 'N', 16, sim.invasion.nc / 2, sim.invasion.nr / 2)
  })

  sim.start()
  sim.toggle_play()
}
