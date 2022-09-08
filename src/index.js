import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const main = "Apps.Demo";

const code = `
// Apps.Demo.State : Type
(Apps.Demo.State) = (Pair 0 (String))

// Apps.Demo.init : (Apps.Demo.State)
(Apps.Demo.init) = (Pair.new 0 "Loading.")

// Apps.Demo.draw (state: (Apps.Demo.State)) : (App.DOM)
(Apps.Demo.draw (Pair.new count text)) = let props = (List.nil); let style = (List.cons (Pair.new "background" "#F0F0F0") (List.cons (Pair.new "height" "100%") (List.cons (Pair.new "display" "flex") (List.cons (Pair.new "fontSize" "32px") (List.cons (Pair.new "fontFamily" "monaco") (List.cons (Pair.new "justifyContent" "center") (List.cons (Pair.new "alignItems" "center") (List.nil)))))))); (App.DOM.node "div" props style (List.cons (App.DOM.text (Show.to_string (Show.many (List.cons (String.show text) (List.nil))))) (List.nil)))

// Apps.Demo.when (event: (App.Event)) (state: (Apps.Demo.State)) : (IO (Apps.Demo.State))
(Apps.Demo.when (App.Event.init) (Pair.new count text)) = (IO.pure (Pair.new count "iniaat"))
(Apps.Demo.when event state) = (IO.pure state)

// Apps.Demo : (App (Apps.Demo.State))
(Apps.Demo) = (App.new (Apps.Demo.init) @state (Apps.Demo.draw state) @event @state (Apps.Demo.when event state))

// String.show (str: (String)) : (Show)
(String.show text) = @h (String.concat text h)

// Show : Type
(Show) = 0

// String.concat (xs: (String)) (ys: (String)) : (String)
(String.concat (String.cons x xs) ys) = (String.cons x (String.concat xs ys))
(String.concat "" ys) = ys

// Show.many (views: (List (Show))) : (Show)
(Show.many (List.nil)) = @h h
(Show.many (List.cons v vs)) = let v = v; let vs = (Show.many vs); @h (v (vs h))

// Show.to_string (show: (Show)) : (String)
(Show.to_string show) = (show "")

// IO.pure -(a: Type) (val: a) : (IO a)
(IO.pure val) = (IO.done val)

`;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App main={main} code={code} />);
