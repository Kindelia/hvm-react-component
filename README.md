# HVM React Component

This package allows you to run a Kind2 App as a React Component. Using it is
very simple:

```javascript
import "hvm-react-component" as HVM_Component;

const main = "Apps.MyApp";
const code = "code_here";

function MyApp() {
  return <HVM_Component main={main} code={code} />;
}
```

Make sure to replace `Apps.MyApp` by your app's name, and `code_here` by your
app's HVM code. This can be obtained running `kind2 to-hvm Apps/MyApp/_.kind2`.
For an example, check [src/index.js](src/index.js). The code of a demo app is
available on [Wikind/Apps/Demo](https://github.com/Kindelia/Wikind/blob/master/Apps/Demo/_.kind2).

[Live version!](https://kindelia.github.io/hvm-react-component)
