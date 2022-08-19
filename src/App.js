import logo from './logo.svg';
import './App.css';
import React from "react";
import { useEffect, useState } from "react";

import hvm from "hvm-js";

const DEFAULT_CODE = `
  // Main : (App U60)
  (Main) =
    let init = 0;
    let draw = @s
      let style = [
        (Pair.new "background" "#F0F0F0")
        (Pair.new "height" "100%")
        (Pair.new "display" "flex")
        (Pair.new "fontSize" "32px")
        (Pair.new "fontFamily" "monaco")
        (Pair.new "justifyContent" "center")
        (Pair.new "alignItems" "center")
      ]
      (App.DOM.node "div" (List.nil) style
        (List.cons (Bool.if (U60.equal s 0) (App.DOM.text "tic") (App.DOM.text "tac"))
        (List.nil)));
    let when = @event @state
      //(IO.do_input @name
      //(IO.do_output name @cont
      (IO.pure (- 1 state))
      //));
    (App.new init draw when)

  // U60.equal (a: U60) (b: U60) : (Bool)
  (U60.equal a b) = (U60.to_bool (== a b))

  // U60.to_bool (n: U60) : (Bool)
  (U60.to_bool 0) = (Bool.false)
  (U60.to_bool n) = (Bool.true)

  // IO.pure -(a: Type) (val: a) : (IO a)
  (IO.pure val) = (IO.done val)

  // Bool.if -(a: Type) (b: (Bool)) (t: a) (f: a) : a
  (Bool.if (Bool.true) t f)  = t
  (Bool.if (Bool.false) t f) = f
`;

const EXTRA_CODE = `
  // Accessors
  (App.init (App.new i d w)) = i
  (App.draw (App.new i d w)) = d
  (App.when (App.new i d w)) = w
  (Main.init)                = (App.init Main)
  (Main.draw s)              = (Pair.new s ((App.draw Main) s))
  (Main.when e s)            = ((App.when Main) e s)

  // Must refer all possible events, so that their ids are allocated
  // Alternative: pre-set their id on HVM, like IO actions
  // Alternative: make HVM create a new id if user asks an undefined name
  Load = (App.Event.frame) 
`;

// Renders a JSON term to a React element
// render (rt: Runtime) (term: JSON) : ReactElement
function render(rt, term) {
  switch (term.$) {
    case "Ctr": {
      if (term.name === "App.DOM.node") {
        var tag = rt.string(term.args[0]);
        var props = {};
        for (var prop of rt.list(term.args[1])) {
          props[rt.string(prop.args[0])] = rt.string(prop.args[1]);
        }
        props.style = {};
        for (var style of rt.list(term.args[2])) {
          props.style[rt.string(style.args[0])] = rt.string(style.args[1]);
        }
        var children = [];
        for (var child of rt.list(term.args[3])) {
          children.push(render(rt, child));
        }
        return React.createElement(tag, props, children);
      }
      if (term.name === "App.DOM.text") {
        return rt.string(term.args[0]);
      }
    }
  }
}

// Creates the 'Main.init' function on HVM. Returns the pointer.
function init(rt) {
  return rt.create_fun(rt.get_id("Main.init"), []);
}

// Creates and runs the `Main.draw` function, applied to the app's state (a
// Ptr), on HVM. Returns the new state pointer (since the old one was consumed
// and cloned) and the resulting renderized React element.
function draw(rt, state) {
  var host = rt.alloc_fun(rt.get_id("Main.draw"), [state]);
  rt.reduce(host);
  var term = rt.at(host);
  if ( rt.get_tag(term) === rt.CTR
    && rt.get_ext(term) === rt.get_id("Pair.new")) {
    var state = rt.get_loc(term, 0n);
    var elems = rt.get_loc(term, 1n);
    rt.normalize(elems);
    var nodes = rt.readback(elems);
    rt.clear(host, 1n);
    return [rt.at(state), render(rt, nodes)];
  }
  throw "App draw function didn't return the expected type.";
};

// Creates and runs the `Main.when` function, applied to an event and the app's
// state (both Ptrs). Runs the resulting IO. Returns the next state (a Ptr).
async function when(rt, Event, state) {
  var host = rt.alloc_fun(rt.get_id("Main.when"), [Event, state])
  //console.log("when", host, rt.show(host));
  var next_state = await rt.run_io(host);
  //console.log("next_state", rt.get_tag(next_state), rt.NUM, rt.readback(next_state));
  return next_state;
}

function App({code}) {
  // HVM's runtime is loaded here
  const [rt, setRt] = useState(null);

  // Stores this App's state as a ptr to an HVM node
  const stateTuple = useState(null);

  // Initializes the HVM runtime with the given app code
  useEffect(() => {
    async function init_runtime() {
      var rt = await hvm((code || DEFAULT_CODE) + EXTRA_CODE);
      setRt(rt);
      stateTuple[1](init(rt));
    };
    init_runtime();
  }, []);

  // Frame event
  useEffect(() => {
    var timer = setInterval(async () => {
      if (stateTuple[0]) {
        let Event = rt.build_term({
          $: "Ctr",
          name: "App.Event.frame",
          args: [],
        });
        stateTuple[1](await when(rt, Event, stateTuple[0]));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [stateTuple[0]]);

  if (stateTuple[0] === null) {
    return <div></div>;
  }

  // The draw function clones the state, so it
  // gets a new pointer. We update it here.
  let [new_state, drawn] = draw(rt, stateTuple[0]);
  stateTuple[0] = new_state;

  return (
    <div className="App">
      {drawn}
    </div>
  );
      //{draw(rt, state)}
}

export default App;
