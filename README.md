TutorCruncher Socket frontend
=============================

[![Build Status](https://travis-ci.org/tutorcruncher/socket-frontend.svg?branch=master)](https://travis-ci.org/tutorcruncher/socket-frontend)
[![codecov](https://codecov.io/gh/tutorcruncher/socket-frontend/branch/master/graph/badge.svg)](https://codecov.io/gh/tutorcruncher/socket-frontend)

Javascript application for [TutorCruncher's](https://tutorcruncher.com) web integration.
 
**Work in progress, not ready for use in the wild**

Some notes on how it will work:

You'll be able to embed the javascript in your own page, so your own CSS and other styling applies.

Defaults to use the TutorCruncher Socket backend, but you can use your own if you like.

Alternatively, you can just use TutorCruncher's API (documentation incoming) and build your own frontend. Feel free to fork this repo for help:smile:.

Parameters:

| Name | Description |
|------|-------------|
| `api_root` | TutorCruncher Socket Backend |
| `element` | The id of the element created |
| `router_mode` | The routing mode when clicking on a tutor's profile. |
| `contact_html` | Text displayed as the `<a href={contact_link}>`'Click here to contact X tutor'`<\a>` |
| `contact_link` | The link included in the above text |
| `skills_label` | The label for a tutor's skills |
