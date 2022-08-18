import logo from './logo.svg';
import './App.css';
import React from "react";
import { useEffect, useState } from "react";

import hvm from "hvm-js";

// render (rt: Runtime) (term: Term) : ReactElement
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

function init(rt) {
  return rt.eval_term({$: "Fun", name: "Main.init", args: []});
}

function draw(rt, state) {
  if (rt) {
    return render(rt, rt.eval_term({$: "Fun", name: "Main.draw", args: [state]}));
  } else {
    return React.createElement("div", null, ["loading..."]);
  }
}

function when(rt, ev, st) {
  // todo
}

function App() {

  const [rt, setRt] = useState(null);
  const [state, setState] = useState(0);

  useEffect(() => {
    async function init_runtime() {
      var rt = await hvm(`
        // Main : (App U60)
        (Main) =
          let init = 0;
          let draw = @s
            let style =
              (List.cons (Pair.new "background" "#F0F0F0")
              (List.cons (Pair.new "color" "blue")
              (List.nil)));
            (App.DOM.node "div" (List.nil) style
              (List.cons (Bool.if (U60.equal s 0) (App.DOM.text "foo") (App.DOM.text "bar"))
              (List.nil)));
          let when = @event @state
            (IO.pure (Unit.new));
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

        // Accessors
        (App.init (App.new i d w)) = i
        (App.draw (App.new i d w)) = d
        (App.when (App.new i d w)) = w
        (Main.init)                = (App.init Main)
        (Main.draw s)              = ((App.draw Main) s)
        (Main.when e s)            = ((App.when Main) e s)
      `);

      setRt(rt);
      setState(init(rt));
    };
    init_runtime();
  }, []);

  useEffect(() => {
    var timer = setInterval(() => {
      if (state) {
        setState({$: "Num", numb: 1n - state.numb});
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [state]);

  console.log("state: ", state);

  return (
    <div className="App">
      {draw(rt, state)}
    </div>
  );
}

export default App;
