let sim;

const decay = 0.4

function cacatoo() {
  let config = {
    title: "Invasion of non-cooperators",
    description: "",
    maxtime: 1000000,
    ncol: 100,
    nrow: 100,
    wrap: [true, true],
    seed: 56,
    fastmode: false,
    scale: 4,
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
    fill: "inferno",
    drawdots: true
  })

  let public_good_dynamics = function(production, decay) {
    return function(x, y) {
      let public_good = y[0]
      return [
        production - decay * public_good
      ]
    }
  }
  let ode_config = {
    ode_name: "public_good_ode",
    init_states: [0],
    parameters: [0.0, decay],
    diffusion_rates: [0.2]
  }

  sim.particles.attachODE(public_good_dynamics, ode_config);

  sim.invasion.nextState = function(i, j) {
    let random = this.rng.random();
    let gridpoint = this.grid[i][j];
    let particleGridpoint = sim.particles.grid[i][j];
    let randNeigh = this.randomMoore8(this, i, j)

    particleGridpoint.public_good_ode.state[0] = Math.min(1, particleGridpoint.public_good_ode.state[0])

    let public_good = particleGridpoint.public_good_ode.state[0]

    if (!gridpoint.species) {
      if (random < randNeigh.growth * randNeigh.benefit * public_good - randNeigh.cost * randNeigh.production) {
        gridpoint.species = randNeigh.species;
        gridpoint.growth = randNeigh.growth;
        gridpoint.death = randNeigh.death;
        gridpoint.production = randNeigh.production;
        gridpoint.benefit = randNeigh.benefit;
        gridpoint.cost = randNeigh.cost;
      }
    }
    else {
      particleGridpoint.public_good_ode.pars = [gridpoint.production, decay]
      if (random < gridpoint.death) {
        gridpoint.species = 0
        particleGridpoint.public_good_ode.pars = [0.0, decay]
      }
    }

  };
  sim.particles.nextState = function(i, j) { }

  sim.invasion.update = function() {
    this.asynchronous()
    this.updateGraphs()
  };
  sim.particles.update = function() {
    this.diffuseODEstates()

    for (let i = 0; i < this.nc; i++) {
      for (let j = 0; j < this.nr; j++) {
        if (!sim.invasion.grid[i][j].species) {
          this.grid[i][j].public_good_ode.pars[0] = 0.0;
        }
        this.grid[i][j].public_good_ode.solveTimestep(0.1);
        this.grid[i][j].public_good = this.grid[i][j].public_good_ode.state[0];
      }
    }
    this.plotODEstates("public_good_ode", [1], [[0, 0, 0], [255, 0, 0]])
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
  // sim.toggle_play()
}
