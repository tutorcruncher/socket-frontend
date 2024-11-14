TutorCruncher Socket frontend
=============================

[![Build Status](https://travis-ci.org/tutorcruncher/socket-frontend.svg?branch=master)](https://travis-ci.org/tutorcruncher/socket-frontend)
[![codecov](https://codecov.io/gh/tutorcruncher/socket-frontend/branch/master/graph/badge.svg)](https://codecov.io/gh/tutorcruncher/socket-frontend)
[![netlify](https://img.shields.io/website-up-down-green-red/https/tutorcruncher-socket-dev.netlify.com.svg?label=netlify-test)](https://tutorcruncher-socket-dev.netlify.com/)

Javascript application for [TutorCruncher's](https://tutorcruncher.com) web integration.
 
## How to use

Simply call Socket on your own website; your own CSS and other styling applies.

It defaults to use the TutorCruncher Socket backend, but you can use your own if you like.

Alternatively, you can just use TutorCruncher's API and build your own frontend.

[Help Article](https://help.tutorcruncher.com/en/articles/4843207-socket).


## Setup and Run locally

To set up and run this project, follow these steps:

1. **Install dependencies:**
   ```sh
    nvm install 14
    nvm use 14
    yarn install
   ```
2. **Run the application:**
   ```sh
    yarn start
   ```
3. **Set the environment variables:**
   ```sh
    REACT_APP_SOCKET_API_URL='http://localhost:8000'
   ```
4. **Set the company public api key:**

   in `public/index.html` set `public_key` with the company's public api key
   - dino tutors is = `9c79f14df986a1ec693c`

5. **Set api root:**

   in `public/index.html` set `api_root` to the root of the api
   - for local testing it is `http://localhost:8000`
   - to use socket-beta it is `https://socket-beta.tutorcruncher.com`
