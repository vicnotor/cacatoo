let sim; // Declare a variable named "sim" globally, so that we can access our cacatoo-simulation from wherever we need. 


/* 
Which parameters do you need to make the simplest possible model of growth?
You can use:
var parameter_name = parameter_value;
*/



/**
 * function cacatoo() contains all the user-defined parts of a cacatoo-model. Configuration, update rules, what is displayed or plotted, etc. It's all here.
 */
function cacatoo() {
  /*
      1. SETUP. First, set up a configuration-object. Here we define how large the grid is, how long will it run, what colours will the critters be, etc. 
  */
  let config = {
    title: "Colony Growth", // The name of your cacatoo-simulation
    description: "Complete the next state function to model a bacterial colony growing", // And a description if you wish
    maxtime: 1000000, // How many time steps the model continues to run
    fastmode: false, // If possible, fast-mode will update the model more than once before displaying the grid    
    ncol: 200, // Number of columns (width of your grid)
    nrow: 200, // Number of rows (height of your grid)
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
  sim.makeGridmodel("colony") // Build a new Gridmodel within the simulation called "colony" 

  sim.initialSpot(sim.colony, "alive", 1, 2, sim.colony.nc / 2, sim.colony.nr / 2) //start with 

  sim.createDisplay("colony", "alive", "Bacterial colony growth (white=alive)") // Create a display so we can see our newly made gridmodel
  /*
      2. DEFINING THE RULES. Below, the user defines the nextState function. This function will be applied for each grid point when we will update the grid later. 
  */
  sim.colony.nextState = function(i, j) {

    /*
  Hints
    1. You can use sim.rng.genrand_real1() to draw a random number between (0, 1)
    2. You can use this.randomMoore8(this, i, j) to draw a random neighbour. (You might need to save it to a variable)
    3. this.grid[i][j].alive is 0 or 1 (dead or alive bacterium respectively)
    4. How can you model birth?
    5. How can you model death?
  */


  } // sim.colony.nextState end 

  /*
      3. MAIN SIMULATION LOOP. Finally, we need to set the update-function, which is the mainwill be applied to the whole grid each time step. For now, all we will do is call "synchronous", which
      applies the next-state function shown above to each grid point. All cells are updated at the same time, rather than in turn (for this, use the function "asynchonous")
  */
  sim.colony.update = function() {

    /*
    How can you plot the per capita growth rate?
    Hints:
    
    1. Use  let myPopSizes = sim.colony.getPopsizes("alive", [0, 1]) to get current population sizes. myPopSizes[0] == #empty spots. What is #bacteria?
   	
    2. Make the plot with: this.plotXY(["pop size", "p.c. growth rate"], [*VarX*, *VarY*], ["black"], "Per capita growth rate; linecolour: black", { drawPoints: true,
 strokeWidth: 1, pointSize: 2, strokePattern: [2, 2] }) 
    
    3. Should the command to make the plot be before or after the update command (this.asynchronous())? 
    */

    this.plotPopsizes("alive", [0, 1]);

    this.asynchronous() // Applied as many times as it can in 1/60th of a second



  } // sim.colony.update end 

  /*
      OPTIONAL: Now that we have everything setup, we can also add some interactive elements (buttons or sliders). See cheater.html for more examples of this. 
  */

  sim.addButton("run/pause", function() {
    sim.toggle_play()
  })


  sim.start()
  sim.toggle_play()
}
