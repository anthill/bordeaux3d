# bordeaux3d.ants.builders

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/anthill/bordeaux3d.ants.builders?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A project running on top of city-core to visualize Bordeaux in 3D. 

# Running locally

1. Clone the project:  `git clone https://github.com/anthill/bordeaux3d.ants.builders` 
1. Install NPM dependencies: `npm install`
1. Install Browserify
```bash
npm install -g browserify
```
1. Build: `npm run build` 
1. Start: `npm start` 

The project will now be accessible via `localhost:9100`

![ScreenShot](/public/img/demo.png)

# Running locally with Docker

```bash
npm run build-docker
npm run run-docker
```

# Dev

```bash
npm run watch
```


# Licence

[MIT](LICENCE)
