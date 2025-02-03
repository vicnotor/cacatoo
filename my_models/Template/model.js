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
    title: "Empty project",                        // The name of your cacatoo-simulation
    description: "",         // And a description if you wish
    maxtime: 1000000,                             // How many time steps the model continues to run            
    ncol: 60,                                   // Number of columns (width of your grid)
    nrow: 60,		                              // Number of rows (height of your grid)
    wrap: [true, true],                         // Wrapped boundary conditions? [COLS, ROWS]   
    scale: 5,				                      // Scale of the grid (nxn pixels per grid point)
    statecolours: { 'state': { 1: 'white' } },          // Colours for each state. Background (0) defaults to black. 
  }

  /*
      1. SETUP. (continued) Now, let's use that configuration-object to generate a new Cacatoo simulation
  */
  sim = new Simulation(config)                          // Initialise the Cacatoo simulation
  sim.makeGridmodel("model")                            // Build a new Gridmodel within the simulation called "model"
  sim.initialGrid(sim.model, 'state', 1, 0.5)           // Set half (50%) of the Gridmodel's grid points to 1 (alive)
  sim.createDisplay("model", "state", "")               // Create a display so we can see our newly made gridmodel

  /*
      2. DEFINING THE RULES. Below, the user defines the nextState function. This function will be applied for each grid point when we will update the grid later. 
  */
  sim.model.nextState = function(x, y) {
    // Empty
  }

  /*
      3. MAIN SIMULATION LOOP. Finally, we need to set the update-function, which is the mainwill be applied to the whole grid each time step. For now, all we will do is call "synchronous", which
      applies the next-state function shown above to each grid point. All cells are updated at the same time, rather than in turn (for this, use the function "asynchonous")
  */
  sim.model.update = function() {
    this.synchronous()         // Applied as many times as it can in 1/60th of a second
  }

  /*
      OPTIONAL: Now that we have everything setup, we can also add some interactive elements (buttons or sliders). See cheater.html for more examples of this. 
  */

  sim.start()

}
