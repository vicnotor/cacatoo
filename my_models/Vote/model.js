/*-----------------------Start user-defined code ---------------------*/

//It is easiest to click on settings in the top right and select tabs (columns) as the layout.

// First, we declare a variable named "sim" globally, so that we can access our cacatoo-simulation from wherever we need. 
let sim;

/**
 * function cacatoo() contains all the user-defined parts of a cacatoo-model. 
     Configuration, update rules, what is displayed or plotted, etc. It's all here.
 */
function cacatoo() {
  /*
      1. SETUP. First, set up a configuration-object. Here we define how large the grid is, how long will it run, what colours will the critters be, etc. 
  */
  let config = {
    title: "Voting rule", // The name of your cacatoo-simulation
    description: "State (0 or 1) is determined by the majority in the local neighbourhood. <br/> You can paint squares that are 0 or 1 by pressing the appropriate buttons and dragging the mouse across the field!", // And a description if you wish
    maxtime: 1000000, // How many time steps the model continues to run
    seed: 42, //random seed for initialisation
    fastmode: true, // If possible, fast-mode will update the model more than once before displaying the grid
    // (note, the onscreen FPS may drop below 60 fps when using fast mode, although many more timesteps may be handled per second)
    ncol: 500, // Number of columns (width of your grid)
    nrow: 300, // Number of rows (height of your grid)
    wrap: [true, true], // Wrapped boundary conditions? [COLS, ROWS]   
    fpsmeter: false,
    scale: 1, // Scale of the grid (nxn pixels per grid point)
    statecolours: {
      'vote': {
        0: 'black',
        1: 'white'
      }
    }, // Colours for each state. Background (0) defaults to black. 
  }

  /*
      1. SETUP. (continued) Now, let's use that configuration-object to generate a new Cacatoo simulation
  */
  sim = new Simulation(config) // Initialise the Cacatoo simulation
  sim.makeGridmodel("model") // Build a new Gridmodel within the simulation called "model"
  sim.initialGrid(sim.model, 'vote', 0, 1, 0.5) // Set half (50%) of the Gridmodel's grid points to 1 (white)
  sim.createDisplay("model", "vote", "state") // Create a display so we can see our newly made gridmodel
  sim.spaceTimePlot("model", "state", "Space-time plot", 250, 500) // Make a space-time plot based on the canvas "state" called "Space-time plot". Draw the center column's state over time, from left to right (so you take a vertical slice through the screen and draw it at each time point).

  /*
      2. DEFINING THE RULES. Below, the user defines the nextState function. This function will be applied for each grid point when we will update the grid later. 
  */
  sim.model.nextState = function(i, j) {
    let neighbours = this.countMoore9(this, i, j, 'vote', 1);

    // // Original
    // if (neighbours >= 5)
    //   this.grid[i][j].vote = 1
    // else
    //   this.grid[i][j].vote = 0

    // Randomness added
    // if (neighbours >= 5)
    //   if (this.rng.random() < 0.1) // Rare chance of not following the majority
    //     this.grid[i][j].vote = 0
    //   else
    //     this.grid[i][j].vote = 1 // Happens in most of the cases
    // else
    //   if (this.rng.random() < 0.1) // Rare chance of not following the majority
    //     this.grid[i][j].vote = 1
    //   else
    //     this.grid[i][j].vote = 0 // Happens in most of the cases

    // Next experimentation
    // // One approach (Kind of like modulo prime)
    // if (neighbours % 2 == 0)
    //   this.grid[i][j].vote = 1;
    // else
    //   this.grid[i][j].vote = 0;
    // Another approach
    if (neighbours == 4)
      this.grid[i][j].vote = 1;
    else if (neighbours == 5)
      this.grid[i][j].vote = 0;
    else if (neighbours < 4)
      this.grid[i][j].vote = 0;
    else
      this.grid[i][j].vote = 1;

  }

  /*
      3. MAIN SIMULATION LOOP. Finally, we need to set the update-function, which is the mainwill be applied to the whole grid each time step. For now, all we will do is call "synchronous", which
      applies the next-state function shown above to each grid point. All cells are updated at the same time, rather than in turn (for this, use the function "asynchonous")
  */
  sim.model.update = function() {
    this.perfectMix()
    this.synchronous() // Applied as many times as it can in 1/60th of a second
    //if (this.time % 2 == 0) {sim.log(`Current seed ${sim.config.seed}`,"output")}//Not necessary, just for checking the seed was being set correctly.
    //this.plotPopsizes("vote", [0,1]) would plot, but not necessary here
  }

  /*
      OPTIONAL: Now that we have everything setup, we can also add some interactive elements (buttons or sliders). See cheater.html for more examples of this. 
  */
  sim.addButton("run/pause", function() {
    sim.toggle_play()
  })
  sim.addButton("update 1 step", function() {
    sim.step();
    sim.display()
  })
  sim.addCustomSlider("Random seed (sequence of numbers)", function(new_value) {
    let seedReadOut = new_value
    sim.config.seed = seedReadOut
    sim.rng = new MersenneTwister(new_value)
    sim.initialGrid(sim.model, 'vote', 0, 1, 0.5)
    sim.display()
  }, 0, 10000, 42, 42) // addCustomSlider(function, minimal, maximal, step-size, default, label)

  //code for drawing
  sim.place_value = 1
  sim.place_size = 10

  sim.addButton("Draw black (0)", function() {
    sim.place_value = 0;
  })
  sim.addButton("Draw white (1)", function() {
    sim.place_value = 1;
  })
  sim.addCustomSlider("Brush size", function(new_value) {
    sim.place_size = new_value
  }, 1, 100, 1, 10) // addCustomSlider(function, minimal, maximal, step-size, default, label)





  var mouseDown = false


  let drawing_canvas = sim.canvases[0] // the first (and only) canvas in this model 

  var coords
  var interval

  sim.canvases[0].elem.addEventListener('mousemove', (e) => {
    coords = sim.getCursorPosition(sim.canvases[0], e, config.scale)
  })

  sim.canvases[0].elem.addEventListener('mousedown', (e) => {
    interval = setInterval(function() {
      if (mouseDown) {
        sim.putSpot(sim.model, 'vote', sim.place_value, sim.place_size, coords.x, coords.y)
        sim.display()
      }
    }, 20)
  })
  sim.canvases[0].elem.addEventListener('mousedown', (e) => { mouseDown = true })
  sim.canvases[0].elem.addEventListener('mouseup', (e) => { mouseDown = false })

  sim.start()
  sim.toggle_play() //start paused


}
