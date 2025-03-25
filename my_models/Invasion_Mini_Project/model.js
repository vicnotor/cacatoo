let sim;

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
    fastmode: false,
    scale: 3,
    graph_interval: 5,
    graph_update: 10,
    statecolours: {
      'species': {
        'producer': "green",
        'non-producer': "red"
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

  let species = [
    {
      species: 'producer',
      growth: 1,
      death: 0.1,
      production: 0.8,
      benefit: 1,
      cost: 0.1,
    },
    {
      species: 'non-producer',
      growth: 1,
      death: 0.1,
      production: 0,
      benefit: 1,
      cost: 0,
    }]

  sim.populateSpot(sim.invasion, species, [1, 0], 16, config.ncol / 2, config.nrow / 2)

  sim.createDisplay("invasion", "species", "")
  sim.createDisplay_continuous({
    model: "particles",
    property: "public_good",
    label: "Public Good",
    minval: 0,
    maxval: 1,
    num_colours: 100,
    decimals: 2,
    minval: 0,
    maxval: 1,
    fill: "viridis",
  })

  sim.createDisplay("invasion", "species", "(zoom in on top-left)", 50, 50, 10)

  // Deze space time plot doet t nog steeds niet, verneuk hier iets maar weet niet wat eigenlijk lol
  //sim.spaceTimePlot("invasion", "Invasion of non-cooperators", "Space-time plot", 10, 200)

  sim.invasion.nextState = function(i, j) {
    let random = this.rng.random();
    let gridpoint = this.grid[i][j];
    let randNeigh = this.randomMoore8(this, i, j)
    let pubgNeighbors = this.countMoore9(sim.particles, i, j, 'public_good', 'public_good') / 9;

    if (!gridpoint.species) {
      if (random < randNeigh.growth * randNeigh.benefit * pubgNeighbors - randNeigh.cost * randNeigh.production) {
        gridpoint.species = randNeigh.species;
        gridpoint.growth = randNeigh.growth;
        gridpoint.death = randNeigh.death;
        gridpoint.production = randNeigh.production;
        gridpoint.benefit = randNeigh.benefit;
        gridpoint.cost = randNeigh.cost;
      }
    }
    else {
      if (random < gridpoint.death)
        gridpoint.species = 0
      else if (random < gridpoint.production)
        sim.particles.grid[i][j].public_good = 'public_good';
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
        if (this.grid[i][j].species === 'producer') sumP++;
        else if (this.grid[i][j].species === 'non-producer') sumN++;
      }
    }

    this.plotPopsizes('species', ['producer', 'non-producer']);

    this.plotArray(["Ratio producer/non-producer"],
      [sumP / sumN],
      ["gold"],
      "Time plot of (producer/non-producer) ratio");
  };

  sim.addButton("pause/continue", function() { sim.toggle_play() })
  sim.addButton("well-mix", function() { sim.toggle_mix() })

  sim.addButton("Let non-producer invade", function() {
    sim.populateSpot(sim.invasion, species, [0, 1], 50, config.ncol / 2, config.nrow / 2)
  })

  sim.start()
}
