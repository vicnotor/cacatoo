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
    title: "Lotka Volterra",                 // The name of your cacatoo-simulation
    description: "Lotka Volterra",           // And a description if you wish
    maxtime: 1000000,                     // How many time steps the model continues to run            
    ncol: 200,                             // Number of columns (width of your grid)
    nrow: 200,		                          // Number of rows (height of your grid)
    wrap: [true, true],                   // Wrapped boundary conditions? [COLS, ROWS]   
    scale: 2,				                      // Scale of the grid (nxn pixels per grid point)
    statecolours: {                       // Colours for each species. Background (0) defaults to black. 
      'species': {
        'M': 'blue',
        'S': 'red',
      },
    },
  }

  /*
      1. SETUP. (continued) Now, let's use that configuration-object to generate a new Cacatoo simulation
  */
  sim = new Simulation(config)                          // Initialise the Cacatoo simulation
  sim.makeGridmodel("lotka")                            // Build a new Gridmodel within the simulation called "model"
  sim.initialGrid(sim.lotka, "species", 0, 'M', 0.7, 'S', 0.01) //start with 
  sim.createDisplay("lotka", "species", "Full CA")               // Create a display so we can see our newly made gridmodel
  sim.createDisplay("lotka", "species", "Close-up of top-left", 40, 40, 10)
  sim.spaceTimePlot("lotka", "Full CA", "Space-time plot", 100, 200)

  /*
      2. DEFINING THE RULES. Below, the user defines the nextState function. This function will be applied for each grid point when we will update the grid later. 
  */
  sim.lotka.nextState = function(i, j) {
    let gridpoint = this.grid[i][j]
    let state = gridpoint.species
    let randomNeighbor = this.randomMoore8(this, i, j)
    let otherRandomNeighbor = this.randomMoore8(this, i, j)
    let sNeighbors = this.countNeighbours8(this, i, j, "species", "S")
    let propSNeighbors = sNeighbors / 8

    let randomNumber = this.rng.random()

    let birthM = 0.1
    let killRate = 2
    let deathS = 0.7

    if (state == 'S')
      if (randomNumber < deathS)
        gridpoint.species = 0
      else
        gridpoint.species = state
    else if (state == 'M')
      // if (randomNeighbor.species == 'S' || otherRandomNeighbor.species == 'S') // or if (sNeighbors > 0)
      if (randomNumber < propSNeighbors * killRate)
        if (randomNumber <= killRate)
          gridpoint.species = 'S'
        else
          gridpoint.species = state
      else
        gridpoint.species = state
    else
      if (randomNumber < birthM)
        gridpoint.species = 'M'
      else
        gridpoint.species = state
  }

  /*
      3. MAIN SIMULATION LOOP. Finally, we need to set the update-function, which is the mainwill be applied to the whole grid each time step. For now, all we will do is call "synchronous", which
      applies the next-species function shown above to each grid point. All cells are updated at the same time, rather than in turn (for this, use the function "asynchonous")
  */
  sim.lotka.update = function() {
    this.plotPopsizes("species", ['M', 'S']);
    this.synchronous()         // Applied as many times as it can in 1/60th of a second
  }
  /*
      OPTIONAL: Now that we have everything setup, we can also add some interactive elements (buttons or sliders). See cheater.html for more examples of this. 
  */

  sim.addButton("reset to initial pattern", function() {
    sim.initialGrid(sim.lotka, "species", 0, 'M', 0.7, 'S', 0.01) //start with 
    sim.display()
  })
  sim.addButton("run/pause", function() {
    sim.toggle_play()
  })
  sim.addCustomSlider("Pause between updates (ms)", function(new_value) {
    sim.sleep = new_value
  }, 0, 100, 1, 0) // addCustomSlider(function, minimal, maximal, step-size, default, label)

  sim.lotka.killSpiders = function(frac) {
    for (let i = 0; i < this.nc; i++) {
      for (let j = 0; j < this.nr; j++) {
        if (this.grid[i][j].species == 'S')
          if (this.rng.random() <= frac)
            this.grid[i][j].species = 0
      }
    }
  }

  sim.addButton("kill a large proportion of spiders", function() {
    sim.lotka.killSpiders(0.95)
  })

  sim.start()
}
