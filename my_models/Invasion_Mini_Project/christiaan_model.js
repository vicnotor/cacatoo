let sim;

const decay = 0.2;

var mut = 0.05;		//mutation rate
var dmut = 0.05; //mutation step (percentage up or downwards)


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
        'non-producer': "red",
        'producer_parasite': "blue"
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
      cost: 0.08,
    },
    {
      species: 'non-producer',
      growth: 1,
      death: 0.1,
      production: 0,
      benefit: 1,
      cost: 0,
    },
    {
      species: 'producer_parasite',
      growth: 1,
      death: 0.1,
      production: 0.2,
      benefit: 1,
      cost: 0.02,
    }]

  sim.populateSpot(sim.invasion, species, [1, 0, 0], 16, config.ncol / 2, config.nrow / 2)

  sim.createDisplay("invasion", "species", "")

  sim.createDisplay_continuous({
    model: "particles",
    property: "public_good",
    label: "Public Good",
    minval: 0,
    maxval: 1,
    num_colours: 100,
    fill: "viridis",
    na_colour: "black",
    drawdots: false,
  })

  sim.createDisplay("invasion", "species", "(zoom in on top-left)", 50, 50, 10)

  // werkt nog steeds niet, snap niet waarom deze grafiek gwn alles breekt, miss ook /0 error?
  // sim.spaceTimePlot("invasion", "species", "Invasion of non-cooperators");

// DE PRODUCING PARASITE EVOLUEERT MEE MET DE PRODUCER, DIT WERKT NIET SINDS DE PRO-PARASITE
// EEN SUPER LAGE COST BLIJFT HOUDEN TEGENOVER DE PRODUCER. COST EN PRODUCTION MOETEN MET ELKAAR SCALEN
// IN EEN EVOLUTIONAIR MODEL, ANDERS NEEMT DE PRO-PARASITE ALTIJD OVER ALS JE T LAAT RUNNEN

//LOL MOTHERFUCKER NEEMT ZO IS ZO OVER > zie comments beneden

  sim.invasion.nextState = function(i, j) {
    let random = this.rng.random();
    let gridpoint = this.grid[i][j];
    let randNeigh = this.randomMoore8(this, i, j)
    let pubgNeighbors = this.countMoore9(sim.particles, i, j, 'public_good', 'public_good') / 9;

    //To determine the new born's kget rate, check if mutation occurs
    mutstep = 0;										// if no mutation occurs, mutstep will be zero.
    if(this.rng.random() < mut){		// check if mutation occurs
      if(this.rng.random() < 0.5){	//check if mutation is up or down
        mutstep = dmut;							//mutation will increase property
      } else{
        mutstep = -dmut;						//mutation will decrease property
      }
    };

    // moet wel een originele prod parameter aanmaken die gecalled wordt voordat deze wordt aangepast door mutatiestap
    // dit is voor een oplossing met de hierboven caps comment (ALS DAT NODIG IS, we kunnen ook gwn concluderen dat 
    // ons model gwn hiertoe leidt)

    const scaling_cost = 0.1;
    ori_prod = randNeigh.production;

    if (!gridpoint.species) {
      if (random < randNeigh.growth * randNeigh.benefit * pubgNeighbors - randNeigh.cost * randNeigh.production) {
        gridpoint.species = randNeigh.species;
        gridpoint.growth = randNeigh.growth;
        gridpoint.death = randNeigh.death;
        gridpoint.production = randNeigh.production * (1 + mutstep)
        gridpoint.benefit = randNeigh.benefit;
        gridpoint.cost = randNeigh.cost + scaling_cost * (gridpoint.production - ori_prod);
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
    let sumNP = 0;

    for (let i = 0; i < this.nc; i++) {
      for (let j = 0; j < this.nr; j++) {
        if (this.grid[i][j].species === 'producer') sumP++;
        else if (this.grid[i][j].species === 'non-producer') sumN++;
        else if (this.grid[i][j].species === 'producer_parasite') sumNP++;
      };
    };

    this.plotPopsizes('species', ['producer', 'non-producer', 'producer_parasite']);

    // Ensure the ratio calculation accounts for sumP always producing and divisions by 0
    let ratio = sumN === 0 && sumNP === 0 ? sumP : (sumP + sumNP) / (sumN > 0 ? sumN : 1);
    this.plotArray(["Ratio prod + prod_par / Non-prod"],
      [ratio],
      ["gold"],
      "Time plot of (producer/non-producer) ratio");
  
  let avgProd = 0;
  let avgProdParasite = 0;
  let countProd = 0;
  let countProdParasite = 0;

  for (let i = 0; i < this.nc; i++) {
    for (let j = 0; j < this.nr; j++) {
      if (this.grid[i][j].species === 'producer') {
        avgProd += this.grid[i][j].production;
        countProd++;
      } else if (this.grid[i][j].species === 'producer_parasite') {
        avgProdParasite += this.grid[i][j].production;
        countProdParasite++;
      };
    };
  };

  avgProd = countProd > 0 ? avgProd / countProd : 0;
  avgProdParasite = countProdParasite > 0 ? avgProdParasite / countProdParasite : 0;

  this.plotArray(
    ["Avg Production (Producer)", "Avg Production (Producer Parasite)"],
    [avgProd, avgProdParasite],
    ["green", "blue"],
    "Time plot of average production levels (mutates)"
  );

  let avgCostPro = 0;
  let avgCostParasite = 0;
  let countCostPro = 0;
  let countCostParasite = 0;

  for (let i = 0; i < this.nc; i++) {
    for (let j = 0; j < this.nr; j++) {
      if (this.grid[i][j].species === 'producer') {
        avgCostPro += this.grid[i][j].cost;
        countCostPro++;
      } else if (this.grid[i][j].species === 'producer_parasite') {
        avgCostParasite += this.grid[i][j].cost;
        countCostParasite++;
      };
    };
  };

  avgCostPro = countCostPro > 0 ? avgCostPro / countCostPro : 0;
  avgCostParasite = countCostParasite > 0 ? avgCostParasite / countCostParasite : 0;

  this.plotArray(
    ["Avg Cost (Producer)", "Avg Cost (Producer Parasite)"],
    [avgCostPro, avgCostParasite],
    ["green", "blue"],
    "Time plot of average Cost levels (Scales with production)"
  );
  };

  sim.addButton("pause/continue", function() { sim.toggle_play() })
  sim.addButton("well-mix", function() { sim.toggle_mix() })

  sim.addButton("Let non-producer invade", function() {
    sim.populateSpot(sim.invasion, species, [0, 1, 0], 50, config.ncol / 2, config.nrow / 2)
  })

  sim.addButton("Let producing invader invade", function() {
    sim.populateSpot(sim.invasion, species, [0, 0, 1], 50, config.ncol / 2, config.nrow / 2)
  })

  sim.addCustomSlider("Random seed and intial position producer", function(new_value) {
    let seedReadOut = new_value;
    sim.config.seed = seedReadOut;
    sim.rng = new MersenneTwister(new_value);

    // Clear the grid before adding a new spot
    for (let i = 0; i < sim.invasion.nc; i++) {
      for (let j = 0; j < sim.invasion.nr; j++) {
        sim.invasion.grid[i][j].species = null;
      }
    }

    // Randomize the population spot
    let randomX = Math.floor(sim.config.ncol * sim.rng.random());
    let randomY = Math.floor(sim.config.nrow * sim.rng.random());

    sim.populateSpot(sim.invasion, species, [1, 0, 0], 16, randomX, randomY);
    sim.display();
  }, 0, 10000, 42, 42); // addCustomSlider(function, minimal, maximal, step-size, default, label)

  sim.start()
};
