let simulation;

function cacatoo() {

  let config = {
    title: "Modulo prime",
    description: "Update rule: next_state = n_neighbours % n_states (here:2)",
    maxtime: 100000000,
    ncol: 200,
    nrow: 200, // dimensions of the grid to build
    sleep: 150,
    fastmode: true, // Ironically, to slow down the FPS, you have to be in fast mode :D            
    wrap: [true, true], // Wrap boundary [COLS, ROWS]
    scale: 2, // scale of the grid (nxn pixels per grid cell)
    statecolours: {
      'alive': {
        1: 'white'
      }},
      graph_interval: 5,
      graph_update: 5
  }

  sim = new Simulation(config) // Initialise a new sim instance with configuration given above

  sim.makeGridmodel("prime");
  sim.createDisplay("prime", "alive", "Modulo prime")

  // Note to user: initialPattern is disabled, as it requirs a webserver for security reasons. Use the pattern button instead. 
  sim.initialPattern(sim.prime, 'alive', 'https://raw.githubusercontent.com/bramvandijk88/cacatoo/master/patterns/elephant_cacatoo_small.png', 90, 90)
  //sim.prime.grid[150][150].alive = 1

  sim.prime.nextState = function(i, j) // Define the next-state function. This example is modulo prime
  {
    this.grid[i][j].alive = (this.countNeumann5(this, i, j, 'alive', 1) % 2 == 0 ? 0 : 1)
  }


  sim.prime.update = function() {
    this.synchronous()
    this.plotPopsizes("alive", [0,1])
  }

  // Adds a pattern load button
  sim.addButton("reset to initial pattern", function(){
  sim.initialPattern(sim.prime, 'alive', 'https://raw.githubusercontent.com/bramvandijk88/cacatoo/master/patterns/elephant_cacatoo_small.png', 90, 90)
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
  //document.getElementById('form_holder').innerHTML += "<br>"
  sim.modifysleep = function(newvalue) {
    this.sleep = newvalue
  }
  sim.addCustomSlider("Pause between updates (ms)", function(new_value) {
    sim.sleep = new_value
  }, 0, 1000, 1, 150) // addCustomSlider(function, minimal, maximal, step-size, default, label)
  sim.addCustomSlider("Random seed (sequence of numbers)", function(new_value) {
  let seedReadOut = new_value
  sim.config.seed = seedReadOut
    sim.rng = new MersenneTwister(new_value)
    sim.initialGrid(sim.prime, 'alive', 0, 1, 0.5)
    sim.display()
  }, 0, 10000, 42, 42) // addCustomSlider(function, minimal, maximal, step-size, default, label)
  //document.getElementById('form_holder').innerHTML += "<br> <br>"
  //document.getElementById('form_holder').innerHTML += "Paint brush controls <br>"
  
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
  //document.getElementById('form_holder').innerHTML += "<br>"
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
            coords = sim.getCursorPosition(sim.canvases[0],e,config.scale) 
        })

        sim.canvases[0].elem.addEventListener('mousedown', (e) => {    
                interval = setInterval(function() {
                    if(mouseDown){
                        sim.putSpot(sim.prime, 'alive', sim.place_value, sim.place_size, coords.x, coords.y)            
                        sim.display()
                    }
                }, 10)
            })
     sim.canvases[0].elem.addEventListener('mousedown', (e) => { mouseDown = true })
        sim.canvases[0].elem.addEventListener('mouseup', (e) => { mouseDown = false })
  
  
  sim.start()
  sim.toggle_play()
}
