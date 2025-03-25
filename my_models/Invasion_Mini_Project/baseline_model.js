let sim;

const growth = 1
const deathP = 0.1
const deathN = 0.1
const prodP = 0.8
const benefit = 1
const cost = 0.1
const decay = 0.2

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

  sim.createDisplay("invasion", "species", "")
  sim.createDisplay("particles", "public_good", "")

  sim.createDisplay("invasion", "species", "(zoom in on top-left)", 50, 50, 10)

  // Deze space time plot doet t nog steeds niet, verneuk hier iets maar weet niet wat eigenlijk lol
  //sim.spaceTimePlot("invasion", "Invasion of non-cooperators", "Space-time plot", 10, 200)

  sim.invasion.nextState = function(i, j) {
    let random = this.rng.random();
    let species = this.grid[i][j].species;
    let randomNeighbor = this.randomMoore8(sim.invasion, i, j)
    let pubgNeighbors = this.countMoore9(sim.particles, i, j, 'public_good', 'public_good') / 9;

    if (species == 0) {
      if (randomNeighbor.species == 'P' && random < growth * benefit * pubgNeighbors - cost * prodP) {
        this.grid[i][j].species = 'P';
      }
      else if (randomNeighbor.species == 'N' && random < growth * benefit * pubgNeighbors) {
        this.grid[i][j].species = 'N';
      }
    }
    else if (species == "P") {
      if (random < deathP)
        this.grid[i][j].species = 0;
      else if (random < prodP)
        sim.particles.grid[i][j].public_good = 'public_good';
    }
    else if (species == "N") {
      if (random < deathN)
        this.grid[i][j].species = 0;
    }
  };
  // werkt letterlijk niet lol >>> nu wel sinds er synchronous update is in
  // onder de margolus diffusion functie
  sim.particles.nextState = function(i, j) {
    let random = this.rng.random();
    if (this.grid[i][j].public_good == 'public_good' && random < decay) {
      this.grid[i][j].public_good = 'nothing';
    };
  };

  sim.invasion.update = function() {
    this.asynchronous()
    this.updateGraphs()
  };

  sim.particles.update = function() {
    this.MargolusDiffusion()
    this.asynchronous()
  };

  sim.invasion.updateGraphs = function() {

    let sumP = 0;
    let sumN = 0;

    for (let i = 0; i < this.nc; i++) {
      for (let j = 0; j < this.nr; j++) {
        if (this.grid[i][j].species === 'P') sumP++;
        else if (this.grid[i][j].species === 'N') sumN++;
      }
    }

    this.plotPopsizes('species', ['P', 'N']);

    this.plotArray(["Ratio P/N"],
      [sumP / sumN],
      ["gold"],
      "Time plot of (P/N) ratio");
  };

  sim.addButton("pause/continue", function() { sim.toggle_play() })
  sim.addButton("well-mix", function() { sim.toggle_mix() })

  sim.addButton("Let N invade", function() {
    sim.initialSpot(sim.invasion, "species", 'N', 50, sim.invasion.nc / 2, sim.invasion.nr / 2)
  })

  sim.start()
}
