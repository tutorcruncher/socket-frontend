TutorCruncher Socket frontend
=============================

[![Build Status](https://travis-ci.org/tutorcruncher/socket-frontend.svg?branch=master)](https://travis-ci.org/tutorcruncher/socket-frontend)
[![codecov](https://codecov.io/gh/tutorcruncher/socket-frontend/branch/master/graph/badge.svg)](https://codecov.io/gh/tutorcruncher/socket-frontend)

Javascript application for [TutorCruncher's](https://tutorcruncher.com) web integration.
 
## How in use

Simply call Socket on your own website; your own CSS and other styling applies. [Click here for more information about 
setting Socket up](https://help.tutorcruncher.com/socket/).

It defaults to use the TutorCruncher Socket backend, but you can use your own if you like. Feel free to fork this repo for help:smile:

Alternatively, you can just use TutorCruncher's API (documentation incoming) and build your own frontend.

Parameters:

| Name | Default | Description | 
|------|---------| ------------|
| `api_root` | TutorCruncher Socket Backend | The URL of the backend you wish to use. TutorCruncher Socket Backend |
| `element` | `#socket` | The id of the element created |
| `router_mode` | `hash` | The routing mode when clicking on a tutor's profile. |
| `mode` | `grid` | Which mode you want to use (explained below) |
| `url_root` | `/` | The root URL of the page you are using Socket from eg. '/our-tutors/'|

We use some strings within Socket that you may want to change by passing them as parameters also.

| Name | Default string |
| ---- | -------------- |
| `skills_label` | 'Skills' |
| `contractor_enquiry_message` | 'Please enter your details below to enquire about tutoring with {contractor_name}.' |
| `enquiry_message` | 'Please enter your details below and we will get in touch with you directly.' |
| `contractor_enquiry_button` | 'Contact {contractor_name}' |
| `contractor_details_button` | 'Show Profile' |
| `submit_enquiry` | 'Submit Enquiry' |
| `enquiry_submitted_thanks` | 'Enquiry submitted, thank you.\n\nYou can now close this window.` |
| `enquiry_button_text` | 'Get in touch' |

## Modes

### grid

Generates a div of your tutors in a grid format, as per the example [here](http://dinotutors.com/#our-tutors).

### enquiry

Generates an enquiry form inside the page using fields you customise within TutorCruncher.

### enquiry-modal

Generates a button inside the page which, when clicked, will load a modal of the enquiry form.
 [More about modals](http://getbootstrap.com/javascript/#live-demo).
