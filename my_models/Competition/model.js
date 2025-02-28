let sim; // Declare a variable named "sim" globally, so that we can access our cacatoo-simulation from wherever we need. 

/**
* function cacatoo() contains all the user-defined parts of a cacatoo-model. Configuration, update rules, what is displayed or plotted, etc. It's all here.
*/
function cacatoo() {
  /*
      1. SETUP. First, set up a configuration-object. Here we define how large the grid is, how long will it run, what colours will the critters be, etc. 
  */
  let config =
  {
    title: "Competition",                 // The name of your cacatoo-simulation
    description: "Competition",           // And a description if you wish
    maxtime: 1000000,                     // How many time steps the model continues to run            
    ncol: 200,                             // Number of columns (width of your grid)
    nrow: 200,		                          // Number of rows (height of your grid)
    wrap: [true, true],                   // Wrapped boundary conditions? [COLS, ROWS]   
    scale: 2,				                      // Scale of the grid (nxn pixels per grid point)
    statecolours: {                       // Colours for each state. Background (0) defaults to black. 
      'state': {
        'x': 'red',
        'y': 'yellow',
      },
    },
  }

  /*
      1. SETUP. (continued) Now, let's use that configuration-object to generate a new Cacatoo simulation
  */
  sim = new Simulation(config)                          // Initialise the Cacatoo simulation
  sim.makeGridmodel("competition")                            // Build a new Gridmodel within the simulation called "model"
  sim.initialSpot(sim.competition, "state", 'x', 4, sim.competition.nc / 2 - 3, sim.competition.nr / 2) //start with 
  sim.initialSpot(sim.competition, "state", 'y', 4, sim.competition.nc / 2 + 3, sim.competition.nr / 2) //start with 
  sim.createDisplay("competition", "state", "")               // Create a display so we can see our newly made gridmodel

  /*
      2. DEFINING THE RULES. Below, the user defines the nextState function. This function will be applied for each grid point when we will update the grid later. 
  */
  sim.competition.nextState = function(x, y) {
    // // 3a
    // let gridpoint = this.grid[x][y]
    // let state = gridpoint.state
    // let randomNeighbor = this.randomMoore8(this, x, y)
    //
    // let deathX = this.rng.random() < 0.2
    // let birthX = this.rng.random() < 0.8
    //
    // let deathY = this.rng.random() < 0.2
    // let birthY = this.rng.random() < 0.8
    //
    // // Then, apply the rules of game of life shown above
    // if (state == 'x' && deathX)
    //   gridpoint.state = 0
    // else if (state == 'y' && deathY)
    //   gridpoint.state = 0
    // else if (randomNeighbor.state == 'x' && birthX) // && state == 0
    //   gridpoint.state = 'x'
    // else if (randomNeighbor.state == 'y' && birthY) // && state == 0
    //   gridpoint.state = 'y'
    // else
    //   gridpoint.state = state

    // 3c
    let gridpoint = this.grid[x][y]
    let state = gridpoint.state
    let randomNeighbor = this.randomMoore8(this, x, y)
    let xNeighbors = this.countMoore8(this, x, y, 'state', 'x')
    let propXNeighbors = xNeighbors / 8
    let yNeighbors = this.countMoore8(this, x, y, 'state', 'y')
    let propYNeighbors = yNeighbors / 8

    let randomNumber = this.rng.random()

    let birthX = 0.5
    let deathX = 0.1
    let compX = 0.25

    let birthY = 0.5
    let deathY = 0.1
    let compY = 0.8 // When much larger than compX, invasion of small number of X into system of only Y's can occur

    if (state == 'x')
      if (randomNumber < deathX)
        gridpoint.state = 0
      else
        gridpoint.state = state
    else if (state == 'y')
      if (randomNumber < deathY)
        gridpoint.state = 0
      else
        gridpoint.state = state
    else
      // if (randomNeighbor.state == 'x' && randomNumber < birthX - propXNeighbors * compX) // Intraspecific competition
      if (randomNeighbor.state == 'x' && randomNumber < birthX - propYNeighbors * compX) // Interspecific competition
        gridpoint.state = 'x'
      // else if (randomNeighbor.state == 'y' && randomNumber < birthY - propYNeighbors * compY) // Intraspecific competition
      else if (randomNeighbor.state == 'y' && randomNumber < birthY - propXNeighbors * compY) // Interspecific competition
        gridpoint.state = 'y'
      else
        gridpoint.state = state
  }

  /*
      3. MAIN SIMULATION LOOP. Finally, we need to set the update-function, which is the mainwill be applied to the whole grid each time step. For now, all we will do is call "synchronous", which
      applies the next-state function shown above to each grid point. All cells are updated at the same time, rather than in turn (for this, use the function "asynchonous")
  */
  sim.competition.update = function() {
    this.asynchronous()         // Applied as many times as it can in 1/60th of a second
  }
  /*
      OPTIONAL: Now that we have everything setup, we can also add some interactive elements (buttons or sliders). See cheater.html for more examples of this. 
  */

  sim.addButton("reset to initial pattern", function() {
    sim.initialGrid(sim.competition, 'state', 0, 1)
    sim.initialSpot(sim.competition, "state", 'x', 4, sim.competition.nc / 2 - 3, sim.competition.nr / 2) //start with 
    sim.initialSpot(sim.competition, "state", 'y', 4, sim.competition.nc / 2 + 3, sim.competition.nr / 2) //start with 
    sim.display()
  })
  sim.addButton("run/pause", function() {
    sim.toggle_play()
  })
  sim.addCustomSlider("Pause between updates (ms)", function(new_value) {
    sim.sleep = new_value
  }, 0, 1000, 1, 0) // addCustomSlider(function, minimal, maximal, step-size, default, label)
  sim.addCustomSlider("Random seed (sequence of numbers)", function(new_value) {
    let seedReadOut = new_value
    sim.config.seed = seedReadOut
    sim.rng = new MersenneTwister(new_value)
    sim.initialGrid(sim.competition, 'state', 'x', 'y', 0.5)
    sim.display()
  }, 0, 10000, 0, 0) // addCustomSlider(function, minimal, maximal, step-size, default, label)
  sim.addButton("Set an invasion pattern (X is the invader)", function(new_value) {
    sim.initialGrid(sim.competition, 'state', 'y', 1)
    sim.initialSpot(sim.competition, "state", 'x', 8, sim.competition.nc / 2, sim.competition.nr / 2) //start with 
    sim.display()
  })

  sim.start()
}
