let sim;

const decay = 0.4
const mut = 0.05;		//mutation rate
const dmut = 0.05; //mutation step (percentage up or downwards)
const mutNP = 0.00; // Probeer 0.01 misschien
const dmutNP = 0.00; // Probeer 0.01 misschien

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
        'non-producer': "red",
        'low-producer': "blue"
      },
    }
  }

  var spawnX = config.ncol / 2;
  var spawnY = config.ncol / 2;

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
      cost: 0.1,
    },
    {
      species: 'low-producer',
      growth: 1,
      death: 0.1,
      production: 0.2,
      benefit: 1,
      cost: 0.1,
    }]

  sim.populateSpot(sim.invasion, species, [1, 0, 0], 16, spawnX, spawnY)

  sim.createDisplay("invasion", "species", "CA")
  sim.createDisplay_continuous({
    model: "invasion",
    property: "production",
    label: "Production",
    minval: 0,
    maxval: 1,
    fill: "viridis",
  })
  sim.createDisplay_continuous({
    model: "particles",
    property: "public_good",
    label: "Public_Good",
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

    //To determine the new born's kget rate, check if mutation occurs
    mutstep = 0;										// if no mutation occurs, mutstep will be zero.
    if (randNeigh.species == "producer" || randNeigh.species == "low-producer") {
      if (this.rng.random() < mut) {		// check if mutation occurs
        if (this.rng.random() < 0.5) {	//check if mutation is up or down
          mutstep = dmut;							//mutation will increase property
        } else {
          mutstep = -dmut;						//mutation will decrease property
        }
      };
    } else if (randNeigh.species == "non-producer") {
      if (this.rng.random() < mutNP) {		// check if mutation occurs
        if (this.rng.random() < 0.5) {	//check if mutation is up or down
          mutstep = dmutNP;							//mutation will increase property
        } else {
          mutstep = -dmutNP;						//mutation will decrease property
        }
      };
    };

    if (!gridpoint.species) {
      if (random < randNeigh.growth * randNeigh.benefit * public_good - randNeigh.cost * randNeigh.production) {
        gridpoint.species = randNeigh.species;
        gridpoint.growth = randNeigh.growth;
        gridpoint.death = randNeigh.death;
        gridpoint.production = Math.max(0, randNeigh.production * (1 + mutstep));
        gridpoint.benefit = randNeigh.benefit;
        gridpoint.cost = randNeigh.cost;
        particleGridpoint.public_good_ode.pars = [gridpoint.production, decay]
      }
    }
    else {
      particleGridpoint.public_good_ode.pars = [gridpoint.production, decay]
      if (random < gridpoint.death) {
        gridpoint.species = 0
        gridpoint.growth = 0
        gridpoint.death = 0
        gridpoint.production = 0
        gridpoint.benefit = 0
        gridpoint.cost = 0
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
    let sumNP = 0;

    for (let i = 0; i < this.nc; i++) {
      for (let j = 0; j < this.nr; j++) {
        if (this.grid[i][j].species === 'producer') sumP++;
        else if (this.grid[i][j].species === 'non-producer') sumN++;
        else if (this.grid[i][j].species === 'low-producer') sumNP++;
      };
    };

    this.plotPopsizes('species', ['producer', 'non-producer', 'low-producer']);

    // TODO: fix this
    // Ensure the ratio calculation accounts for sumP always producing and divisions by 0
    // let ratio = sumN === 0 && sumNP === 0 ? sumP : (sumP + sumNP) / (sumN > 0 ? sumN : 1);
    // this.plotArray(["Ratio prod + prod_par / Non-prod"],
    //   [ratio],
    //   ["gold"],
    //   "Time plot of (producer/non-producer) ratio");

    let avgProd = 0;
    let avgProdParasite = 0;
    let countNonProd = 0;
    let avgNonProducer = 0;
    let countProd = 0;
    let countProdParasite = 0;

    for (let i = 0; i < this.nc; i++) {
      for (let j = 0; j < this.nr; j++) {
        let gridpoint = this.grid[i][j]
        if (gridpoint.species === 'producer') {
          avgProd += gridpoint.production;
          countProd++;
        } else if (gridpoint.species === 'non-producer') {
          avgNonProducer += gridpoint.production;
          countNonProd++;
        } else if (gridpoint.species === 'low-producer') {
          avgProdParasite += gridpoint.production;
          countProdParasite++;
        };
      };
    };

    avgProd = countProd > 0 ? avgProd / countProd : 0;
    avgProdParasite = countProdParasite > 0 ? avgProdParasite / countProdParasite : 0;

    this.plotArray(
      ["Avg Production (Producer)", "Avg Production (Producer Parasite)"],
      [avgProd, avgNonProducer, avgProdParasite],
      ["green", "red", "blue"],
      "Time plot of average production levels (mutates)"
    );
  };

  sim.addButton("pause/continue", function() { sim.toggle_play() })
  sim.addButton("well-mix", function() { sim.toggle_mix() })

  sim.addButton("Let non-producer invade", function() {
    sim.populateSpot(sim.invasion, species, [0, 1, 0], 50, spawnX, spawnY)
  })

  sim.addButton("Let producing invader invade", function() {
    sim.populateSpot(sim.invasion, species, [0, 0, 1], 50, spawnX, spawnY)
  })

  sim.addCustomSlider("Random seed and intial position producer", function(new_value) {
    let seedReadOut = new_value;
    sim.config.seed = seedReadOut;
    sim.rng = new MersenneTwister(new_value);

    // Clear the grid before adding a new spot
    for (let i = 0; i < sim.invasion.nc; i++) {
      for (let j = 0; j < sim.invasion.nr; j++) {
        sim.invasion.grid[i][j].species = null;
        sim.particles.grid[i][j].public_good_ode.state[0] = null;
      }
    }

    // Randomize the population spot
    spawnX = Math.floor(sim.config.ncol * sim.rng.random());
    spawnY = Math.floor(sim.config.nrow * sim.rng.random());

    sim.populateSpot(sim.invasion, species, [1, 0, 0], 16, spawnX, spawnY);
    sim.display();
  }, 0, 10000, 42, 42); // addCustomSlider(function, minimal, maximal, step-size, default, label)

  // Drawing
  sim.place_value = [0, 0, 0]
  sim.place_size = 10

  sim.addButton("Draw producer", function() {
    sim.place_value = [1, 0, 0];
  })
  sim.addButton("Draw non-producer", function() {
    sim.place_value = [0, 1, 0];
  })
  sim.addButton("Draw producer parasite", function() {
    sim.place_value = [0, 0, 1];
  })
  sim.addCustomSlider("Brush size", function(new_value) {
    sim.place_size = new_value
  }, 1, 100, 1, 10) // addCustomSlider(function, minimal, maximal, step-size, default, label)

  var mouseDown = false

  var coords
  var interval

  sim.canvases[0].elem.addEventListener('mousemove', (e) => {
    coords = sim.getCursorPosition(sim.canvases[0], e, config.scale)
  })

  sim.canvases[0].elem.addEventListener('mousedown', (_) => {
    interval = setInterval(function() {
      if (mouseDown) {
        sim.populateSpot(sim.invasion, species, sim.place_value, sim.place_size, coords.x, coords.y)
        sim.display()
      }
    }, 10)
  })
  sim.canvases[0].elem.addEventListener('mousedown', (_) => { mouseDown = true })
  sim.canvases[0].elem.addEventListener('mouseup', (_) => { mouseDown = false })

  sim.start()
  sim.toggle_play()
};
