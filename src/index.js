import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const main = "Apps.Demo";

const code = `
// Apps.Demo.State : Type
(Apps.Demo.State) = (Pair 0 (String))

// Apps.Demo.init : (Apps.Demo.State)
(Apps.Demo.init) = (Pair.new 0 "Loading.")

// Apps.Demo.draw (state: (Apps.Demo.State)) : (App.DOM)
(Apps.Demo.draw (Pair.new count text)) = let props = (List.nil); let style = (List.cons (Pair.new "background" "#F0F0F0") (List.cons (Pair.new "height" "100%") (List.cons (Pair.new "display" "flex") (List.cons (Pair.new "fontSize" "32px") (List.cons (Pair.new "fontFamily" "monaco") (List.cons (Pair.new "justifyContent" "center") (List.cons (Pair.new "alignItems" "center") (List.nil)))))))); (App.DOM.node "div" props style (List.cons (App.DOM.text (Show.to_string (Show.many (List.cons (String.show "[#") (List.cons (U60.show count) (List.cons (String.show "] ") (List.cons (String.show text) (List.nil)))))))) (List.nil)))

// Apps.Demo.when (event: (App.Event)) (state: (Apps.Demo.State)) : (IO (Apps.Demo.State))
(Apps.Demo.when (App.Event.init) (Pair.new count text)) = (IO.pure (Pair.new count "init"))
(Apps.Demo.when (App.Event.frame) (Pair.new count text)) = (IO.pure (Pair.new (+ count 1) text))
(Apps.Demo.when (App.Event.key_down key_code) (Pair.new count text)) = (IO.pure (Pair.new count (Show.render (List.cons (String.show "key_down: ") (List.cons (U60.show key_code) (List.nil))))))
(Apps.Demo.when (App.Event.mouse_down button (Pair.new x y)) (Pair.new count text)) = (IO.pure (Pair.new count (Show.render (List.cons (String.show "mouse_down: ") (List.cons (U60.show x) (List.cons (String.show " ") (List.cons (U60.show y) (List.nil))))))))
(Apps.Demo.when (App.Event.input element input) (Pair.new count text)) = (IO.pure (Pair.new count "input"))
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

// U60.show (n: U60) : (Show)
(U60.show 0) = @str (String.cons 48 str)
(U60.show n) = @str let next = (String.cons (+ 48 (% n 10)) str); let func = (U60.if (< n 10) @h h @h ((U60.show (/ n 10)) h)); (func next)

// U60.if -(r: Type) (n: U60) (t: r) (f: r) : r
(U60.if 0 t f) = f
(U60.if x t f) = t

// Show.many (views: (List (Show))) : (Show)
(Show.many (List.nil)) = @h h
(Show.many (List.cons v vs)) = let v = v; let vs = (Show.many vs); @h (v (vs h))

// IO.pure -(a: Type) (val: a) : (IO a)
(IO.pure val) = (IO.done val)

// Show.to_string (show: (Show)) : (String)
(Show.to_string show) = (show "")

// Show : Type
(Show) = 0

// Show.render (views: (List (Show))) : (String)
(Show.render views) = (Show.to_string (Show.many views))
`;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App main={main} code={code} />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
