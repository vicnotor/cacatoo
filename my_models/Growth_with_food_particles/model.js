/*-----------------------Start user-defined code ---------------------*/

let sim; // Declare a variable named "sim" globally, so that we can access our cacatoo-simulation from wherever we need. 

let previousPopSize;

/**
* function cacatoo() contains all the user-defined parts of a cacatoo-model. Configuration, update rules, what is displayed or plotted, etc. It's all here.
*/
function cacatoo() {
  /*
      1. SETUP. First, set up a configuration-object. Here we define how large the grid is, how long will it run, what colours will the critters be, etc. 
  */
  let config =
  {
    title: "Diffusion limited aggregation",                        // The name of your cacatoo-simulation
    description: "",         // And a description if you wish
    maxtime: 1000000,                             // How many time steps the model continues to run
    fastmode: true,                               // If possible, fast-mode will update the model more than once before displaying the grid
    // (note, the onscreen FPS may drop below 60 fps when using fast mode, although many more timesteps may be handled per second)
    ncol: 200,                                   // Number of columns (width of your grid)
    nrow: 200,		                              // Number of rows (height of your grid)
    wrap: [false, false],                         // Wrapped boundary conditions? [COLS, ROWS]   
    scale: 2,				                      // Scale of the grid (nxn pixels per grid point)
    statecolours: {
      'state': {
        'dead': 'black',
        'alive': 'white'
      },
      'food': { 'no food': 'black', 'food': 'white' },
      'colour': 'inferno'
    },          // Colours for each state. Background (0) defaults to black. 
  }

  /*
      1. SETUP. (continued) Now, let's use that configuration-object to generate a new Cacatoo simulation
  */
  sim = new Simulation(config)                          // Initialise the Cacatoo simulation
  sim.makeGridmodel("growth")
  sim.makeGridmodel("particles")
  sim.initialGrid(sim.growth, 'state', 0, 1.0)
  sim.initialGrid(sim.particles, 'food', 'no food', 'food', 0.25)
  sim.growth.grid[config.ncol / 2][config.nrow / 2].state = 'alive'
  sim.createDisplay("growth", "state", "Growing aggregate")                                       // Create a display so we can see our newly made gridmodel
  sim.createDisplay("growth", "colour", "Growing aggregate (coloured by time)")
  sim.createDisplay("particles", "food", "Available food particles")                                // Create a display so we can see our newly made gridmodel

  /*
      2. DEFINING THE RULES. Below, the user defines the nextState function. This function will be applied for each grid point when we will update the grid later. 
  */
  sim.growth.nextState = function(i, j) {
    if (this.grid[i][j].state == 0) {
      if (sim.particles.grid[i][j].food == 'food' && this.countMoore8(sim.growth, i, j, 'state', 'alive') > 0) {
        sim.particles.grid[i][j].food = 'no food'
        this.grid[i][j].state = 'alive'
        this.grid[i][j].colour = Math.min(18, 1 + Math.floor(this.time / 10))

      }
    }

  }
  sim.particles.nextState = function(i, j) { }

  /*
      3. MAIN SIMULATION LOOP. Finally, we need to set the update-function, which is the mainwill be applied to the whole grid each time step. For now, all we will do is call "synchronous", which
      applies the next-state function shown above to each grid point. All cells are updated at the same time, rather than in turn (for this, use the function "asynchonous")
  */
  sim.growth.update = function() {
    let currentPopSize = sim.growth.getPopsizes("state", ["alive"])[0]
    let growthRate;
    if (previousPopSize)
      growthRate = (currentPopSize - previousPopSize) / previousPopSize
    previousPopSize = currentPopSize
    this.plotXY(["pop size", "p.c. growth rate"], [currentPopSize, growthRate], ["red"], "Per capita growth rate", {})
    this.synchronous()         // Applied as many times as it can in 1/60th of a second

  }

  sim.particles.update = function() {
    this.MargolusDiffusion()
  }

  /*
      OPTIONAL: Now that we have everything setup, we can also add some interactive elements (buttons or sliders). See cheater.html for more examples of this. 
  */

  sim.start()

}


/*-------------------------End user-defined code ---------------------*/
