import logo from './logo.svg';
import './App.css';
import React from "react";

import hvm from "hvm-js";

// We're using React.Component, because pure components are terrible for state
// management, and `useEffect()` is called more than once in ill-specified ways.
class App extends React.Component {
  
  constructor(props) {
    super(props);
    this.runtime = null;
    this.state = {
      root: null,
    }
  }

  async componentDidMount() {
    if (!this.props.code || !this.props.main) {
      throw "Requires 'main' a 'code' props."
    }

    // Starts HVM's runtime with the given code
    this.runtime    = await hvm(this.props.code + EXTRA_CODE(this.props.main));
    this.MAIN_INIT  = this.runtime.get_id("Main.init");
    this.MAIN_DRAW  = this.runtime.get_id("Main.draw");
    this.MAIN_WHEN  = this.runtime.get_id("Main.when");
    this.PAIR_NEW   = this.runtime.get_id("Pair.new");
    this.MAYBE_SOME = this.runtime.get_id("Maybe.some");
    this.MAYBE_NONE = this.runtime.get_id("Maybe.none");
    this.state.root = this.runtime.create_fun(this.MAIN_INIT, [])
    this.forceUpdate();

    // krame event
    this.run_event("init", []);
    this.timer = setInterval(() => this.run_event("frame", []), 1000);

    // key_down event
    document.body.addEventListener("keydown", e => {
      var key_code = {$: "Num", numb: BigInt(e.keyCode)};
      this.run_event("key_down", [key_code]);
    });

    // key_up event
    document.body.addEventListener("keyup", e => {
      var key_code = {$: "Num", numb: BigInt(e.keyCode)};
      this.run_event("key_up", [key_code]);
    });

    // mouse_down event
    document.body.addEventListener("mousedown", e => {
      var button = {$: "Num", numb: BigInt(e.button)};
      var mouse_pos = {$: "Ctr", name: "Pair.new", args: [
        {$: "Num", numb: BigInt(e.offsetX)},
        {$: "Num", numb: BigInt(e.offsetY)},
      ]};
      this.run_event("mouse_down", [button, mouse_pos]);
    });
    
    // mouse_up event
    document.body.addEventListener("mouseup", e => {
      var button = {$: "Num", numb: BigInt(e.button)};
      var mouse_pos = {$: "Ctr", name: "Pair.new", args: [
        {$: "Num", numb: BigInt(e.offsetX)},
        {$: "Num", numb: BigInt(e.offsetY)},
      ]};
      this.run_event("mouse_up", [button, mouse_pos]);
    });

    // mouse_move event
    document.body.addEventListener("mousemove", e => {
      var element = this.runtime.unstring(e.target.id || "");
      var mouse_pos = {$: "Ctr", name: "Pair.new", args: [
        {$: "Num", numb: BigInt(e.offsetX)},
        {$: "Num", numb: BigInt(e.offsetY)},
      ]};
      //this.run_event("mouse_move", [element, mouse_pos]);
    });

    // mouse_click event
    document.body.addEventListener("click", e => {
      var element = this.runtime.unstring(e.target.id || "");
      this.run_event("mouse_click", [element]);
    });

  }

  async componentWillUnmount() {
    clearInterval(this.timer);
  }

  // Runs the app's draw() function on the Runtime
  draw() {
    if (!this.runtime) {
      return <div>Loading...</div>;
    }
    var host = this.runtime.alloc_fun(this.MAIN_DRAW, [this.state.root]);
    this.runtime.reduce(host);
    var term = this.runtime.at(host);
    if ( this.runtime.get_tag(term) === this.runtime.CTR
      && this.runtime.get_ext(term) === this.PAIR_NEW) {
      var state = this.runtime.get_loc(term, 0n);
      var elems = this.runtime.get_loc(term, 1n);
      this.runtime.normalize(elems);
      var nodes = this.runtime.readback(elems);
      this.state.root = this.runtime.at(state);
      this.runtime.clear(host, 1n);
      this.runtime.clear(this.runtime.get_loc(term, 0n), 2n);
      return this.render_term(nodes);
    }
    throw "App draw function didn't return the expected type.";
  };

  // Renders a JSON term to a React element
  // render (term: JSON) : ReactElement
  render_term(term) {
    switch (term.$) {
      case "Ctr": {
        if (term.name === "App.DOM.node") {
          var tag = this.runtime.string(term.args[0]);
          var props = {};
          for (var prop of this.runtime.list(term.args[1])) {
            props[this.runtime.string(prop.args[0])] = this.runtime.string(prop.args[1]);
          }
          props.style = {};
          for (var style of this.runtime.list(term.args[2])) {
            props.style[this.runtime.string(style.args[0])] = this.runtime.string(style.args[1]);
          }
          var children = [];
          for (var child of this.runtime.list(term.args[3])) {
            children.push(this.render_term(child));
          }
          if (term.tag === "input" || term.tag === "textarea") {
            props.onInput = e => {
              var elem = this.runtime.unstring(e.target.id || "");
              var text = this.runtime.unstring(e.target.value || "");
              this.run_event("input", [elem, text]);
            };
          }
          return React.createElement(tag, props, children);
        }
        if (term.name === "App.DOM.text") {
          return this.runtime.string(term.args[0]);
        }
      }
    }
  }

  // Runs an App.Event on HVM, updates the state root.
  async run_event(name, args) {
    if (!this.runtime) {
      return;
    }
    var evnt = this.runtime.build_term({$: "Ctr", name: "App.Event." + name, args: args});
    var host = this.runtime.alloc_fun(this.MAIN_WHEN, [evnt, this.state.root])
    this.state.root = await this.runtime.run_io(host);
    this.forceUpdate();
  }

  render() {
    return (
      <div className="App">
        {this.draw()}
      </div>
    );
  }
}

const EXTRA_CODE = APP_MAIN => `
  // App.new accessors
  (App.init (App.new i d w)) = i
  (App.draw (App.new i d w)) = d
  (App.when (App.new i d w)) = w

  // Main app methods
  (Main.init) = (App.init ${APP_MAIN})
  (Main.draw s) = (Pair.new s ((App.draw ${APP_MAIN}) s))
  (Main.when e s) = ((App.when ${APP_MAIN}) e s)

  // HVM needs this to define arities
  Load = 
    let lib = End
    let lib = (Import lib App.Event.init)
    let lib = (Import lib App.Event.frame)
    let lib = (Import lib λcode (App.Event.key_down code))
    let lib = (Import lib λcode (App.Event.key_up code))
    let lib = (Import lib λbutton λmouse_pos (App.Event.mouse_down button mouse_pos))
    let lib = (Import lib λbutton λmouse_pos (App.Event.mouse_up button mouse_pos))
    let lib = (Import lib λelement λmouse_pos (App.Event.move element mouse_pos))
    let lib = (Import lib λelement (App.Event.mouse_click element))
    let lib = (Import lib λelement λtext (App.Event.input element text))
    let lib = (Import lib λvalue (Maybe.some value))
    let lib = (Import lib Maybe.none)
    let lib = (Import lib λfst λsnd (Pair.new fst snd))
    let lib = (Import lib String.nil)
    let lib = (Import lib λhead λtail (String.cons head tail))
    lib
`;

export default App;
