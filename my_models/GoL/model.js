let sim; // Declare a variable named "sim" globally, so that we can access our cacatoo-simulation from wherever we need. 

/**
 * function cacatoo() contains all the user-defined parts of a cacatoo-model. Configuration, update rules, what is displayed or plotted, etc. It's all here.
 */
function cacatoo() {
  /*
      1. SETUP. First, set up a configuration-object. Here we define how large the grid is, how long will it run, what colours will the critters be, etc. 
  */
  let config = {
    title: "Game of Life", // The name of your cacatoo-simulation
    description: "Conway's Game of Life. Play around with different initial seeds (dragging the slider initialises 50% of the field as 1 and 50% as 0, with random chance depending on this seed number) or your own patterns and describe what you see. You can draw on the canvas by clicking a button below and clicking and dragging the cursor.", // And a description if you wish
    maxtime: 1000000, // How many time steps the model continues to run
    fastmode: false, // If possible, fast-mode will update the model more than once before displaying the grid    
    ncol: 250, // Number of columns (width of your grid)
    nrow: 250, // Number of rows (height of your grid)
    wrap: [true, true], // Wrapped boundary conditions? [COLS, ROWS]   
    scale: 2, // Scale of the grid (nxn pixels per grid point)
    statecolours: {
      'alive': {
        1: 'white'
      }
    }, // Colours for each state. Background (0) defaults to black. 
  }

  /*
      1. SETUP. (continued) Now, let's use that configuration-object to generate a new Cacatoo simulation
  */
  sim = new Simulation(config) // Initialise the Cacatoo simulation
  sim.makeGridmodel("gol") // Build a new Gridmodel within the simulation called "gol" (Game Of Life)
  //sim.initialGrid(sim.gol, 'alive', 1, 0.5) // Set half (50%) of the Gridmodel's grid points to 1 (alive)
  sim.initialPattern(sim.gol, 'alive', 'https://raw.githubusercontent.com/bramvandijk88/cacatoo/master/patterns/glider.png', 80, 80)

  sim.createDisplay("gol", "alive", "Game of life (white=alive)") // Create a display so we can see our newly made gridmodel
  /*
      2. DEFINING THE RULES. Below, the user defines the nextState function. This function will be applied for each grid point when we will update the grid later. 
  */
  sim.gol.nextState = function(i, j) {

    // This example uses the rules of game of life, which has the following three rules:
    // i) A living cell surrounded by two or three living cells, stays alive. 
    // ii) A living cell surrounded by any other number of cells, dies.
    // iii) A dead cell surrounded by exactly three living cells, becomes alive. 

    // Variable that refers to the current gridpoint ('this' is a way to refer to the current class, which in the nextState is the current 'Gridmodel'). 
    // You don't have to do this, you can also keep referring to this.grid[i][j] every time you need the grid point, but this is more readible. :)
    let gridpoint = this.grid[i][j]

    // So, first we need to know how many cells are alive around a grid point
    let neighbours = sim.gol.countMoore8(this, i, j, 'alive', 1) // In the Moore8 neighbourhood of this GridModel (CA) count # of 1's for the 'alive' property        
    // Then, let's see if this cell is dead or alive
    let state = gridpoint.alive

    // Then, apply the rules of game of life shown above
    if (state == 0 && neighbours == 3)
      gridpoint.alive = 1
    else if (state == 1 && (neighbours < 2 || neighbours > 3))
      gridpoint.alive = 0
    else
      gridpoint.alive = state
  }

  /*
      3. MAIN SIMULATION LOOP. Finally, we need to set the update-function, which is the mainwill be applied to the whole grid each time step. For now, all we will do is call "synchronous", which
      applies the next-state function shown above to each grid point. All cells are updated at the same time, rather than in turn (for this, use the function "asynchonous")
  */
  sim.gol.update = function() {
    this.synchronous() // Applied as many times as it can in 1/60th of a second
  }

  /*
      OPTIONAL: Now that we have everything setup, we can also add some interactive elements (buttons or sliders). See cheater.html for more examples of this. 
  */
  //sim.addPatternButton(sim.gol, 'alive') // Note, for security reasons, this needs a local server to be run (try VSC's 'live server' plugin!)


  sim.addButton("reset to initial pattern", function() {
    sim.initialPattern(sim.gol, 'alive', 'https://raw.githubusercontent.com/bramvandijk88/cacatoo/master/patterns/glider.png', 80, 80)
    sim.display()
    //sim.start()
  })
  sim.addButton("run/pause", function() {
    sim.toggle_play()
  })
  sim.addButton("update 1 step", function() {
    sim.step();
    sim.display()
  })
  //document.getElementById('form-holder').innerHTML = document.getElementById('form-holder').innerHTML + "\n";
  sim.modifysleep = function(newvalue) {
    this.sleep = newvalue
  }
  sim.addCustomSlider("Pause between updates (ms)", function(new_value) {
    sim.sleep = new_value
  }, 0, 1000, 1, 0) // addCustomSlider(function, minimal, maximal, step-size, default, label)
  sim.addCustomSlider("Random seed (sequence of numbers)", function(new_value) {
    let seedReadOut = new_value
    sim.config.seed = seedReadOut
    sim.rng = new MersenneTwister(new_value)
    sim.initialGrid(sim.gol, 'alive', 0, 1, 0.5)
    sim.display()
  }, 0, 10000, 42, 42) // addCustomSlider(function, minimal, maximal, step-size, default, label)

  //
  //Code for being able to draw with the mouse.
  //
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

  //sim.place_value = 1
  //sim.place_size = 1

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
        sim.putSpot(sim.gol, 'alive', sim.place_value, sim.place_size, coords.x, coords.y)
        sim.display()
      }
    }, 10)
  })
  sim.canvases[0].elem.addEventListener('mousedown', (e) => { mouseDown = true })
  sim.canvases[0].elem.addEventListener('mouseup', (e) => { mouseDown = false })


  sim.start()
  sim.toggle_play()
}
