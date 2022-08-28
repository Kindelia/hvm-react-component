# HVM React Component

Renders an interactive Kind2 App as a React Component.

Here is a [live version](https://kindelia.github.io/hvm-react-component) of a Demo App made with Kind2, running on the browser.

Check the Kind2 source on [Wikind/Apps/Demo](https://github.com/Kindelia/Wikind/blob/master/Apps/Demo/_.kind2), and the React usage on [src/index.js](src/index.js).

## Usage

1. Install:

```
npm i --save hvm-react-component
```

2. Compile your Kind2 app to HVM:

```
kind2 to-hvm Apps/MyApp/_.kind2
```

3. Include it on your React app:

```javascript
import HVM_Component from "hvm-react-component";

const main = "Apps.MyApp";
const code = "code_here";

function MyApp() {
  return <HVM_Component main={main} code={code} />;
}
```
