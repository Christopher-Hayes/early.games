# [early.games](https://early.games)

This website currently The Game of Ur. This is an ancient game from early human civilization. In the future this website will feature additional very old games made freely accessible online with no ads.

## Tech (Game of Ur)

The [3D 4-sided dice model](https://www.tinkercad.com/things/jPyYxV4fJEu) were built using [TinkerCAD](https://exercism.io/profiles/Christopher-Hayes)

These dice were rendered with [THREE.JS](). I initially was planning to use Babylon.JS as an easy to set up rendering engine; however, I ran into [trouble adapting the code to Angular](https://stackoverflow.com/questions/58472701/babylonjs-canvas-is-blank-in-angular-6). Thank you to [@raanan-w](https://stackoverflow.com/users/729146/raanan-w) for figuring the issue out. I quickly switched to THREE.JS because it was early in the project, but I'll come back to Babylon.JS in another project.

The web app runs on Angular 6. Styling is done with Bootstrap 4 and Angular Material. Bootstrap is used for all of the premade utility classes, Angular Material is used for the permade Angular-centric components. Specifically, the dialog and the snackbar are from Angular Material.

The bot is not at all smart. That still needs to be done at this point (10/30/19). The first step is to develop an algorithm to give a value to each cell. At some point, I may mess with ML to see how good I can make the bots.

## Hosting

The [early.games website](https://early.games) is hosted with [surge.sh](https://surge.sh) at no cost. This project was partly to experiment with surge. Surge is extremely convenient for making any project publically available with a domain. However, when it comes to domain + SSL fine tuning and additional capabilities, I definitely still prefer [Netlify](https://netlify.com).
