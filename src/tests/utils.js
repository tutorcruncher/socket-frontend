const RESPONSES = {
  'GET:https://socket.tutorcruncher.com/good/subjects': () => ({
    status: 200,
    content: JSON.stringify([
      {'id': 29, 'name': 'English Language', 'category': 'English', 'link': '29-english-language'},
      {'id': 31, 'name': 'English Literature', 'category': 'English', 'link': '31-english-literature'},
      {'id': 61, 'name': 'Chinese', 'category': 'Languages', 'link': '61-chinese'}
    ])
  }),
  'GET:https://socket.tutorcruncher.com/good/contractors': () => ({
    status: 200,
    content: JSON.stringify({
      'results': [
        {
          'id': 213386,
          'url': 'https://socket.tutorcruncher.com/9c79f14df986a1ec693c/contractors/213386',
          'link': '213386-graham-w',
          'name': 'Graham W',
          'tag_line': null,
          'primary_description': 'I have experience tutoring students from a variety of backgrounds at all levels ....',
          'town': 'London',
          'country': 'United Kingdom',
          'photo': 'https://socket.tutorcruncher.com/media/9c79f14df986a1ec693c/213386.thumb.jpg',
          'distance': null
        },
        {
          'id': 213385,
          'url': 'https://socket.tutorcruncher.com/9c79f14df986a1ec693c/contractors/213385',
          'link': '213385-sandra-c',
          'name': 'Sandra C',
          'tag_line': null,
          'primary_description': 'Have taught in various schools for 10 years.If you want more information ...',
          'town': 'London',
          'country': 'United Kingdom',
          'photo': 'https://socket.tutorcruncher.com/media/9c79f14df986a1ec693c/213385.thumb.jpg',
          'distance': null
        }
      ]
    })
  }),
  'GET:https://socket.tutorcruncher.com/good/options': () => ({
    status: 200,
    content: JSON.stringify({
      name: 'Demo Branch',
      name_display: 'first_name_initial',
      show_stars: true,
      display_mode: 'list',
      router_mode: 'hash',
      show_hours_reviewed: true,
      show_labels: true,
      show_location_search: true,
      show_subject_filter: true,
      sort_on: 'name',
      pagination: 10,
    })
  })
}

function MockXMLHttpRequest () {
  let _method, _url
  const _headers = {}
  this.open = function (method, url) {
    // console.log('open', method, url)
    _method = method
    _url = url
  }
  this.setRequestHeader = function (name, value) {
    // console.log('setRequestHeader', name, value)
    _headers[name] = value
  }
  this.onload = null
  this.onerror = null
  this.responseText = null
  this.status = null
  this.statusText = null
  this.send = function (data) {
    let args = null
    if (_url.includes('?')) {
      args = _url.substr(_url.indexOf('?') + 1, _url.length)
      _url = _url.substr(0, _url.indexOf('?'))
    }
    // console.log(`XHR ${_method}: ${_url} args=${args}`)
    const f = RESPONSES[`${_method}:${_url}`]
    const req = {method: _method, url: _url, args}
    global.xhr_calls.push(req)
    if (f) {
      const response = f(req)
      this.status = response.status
      this.responseText = response.content
      this.onload && this.onload()
    } else {
      throw Error(`No response found for ${_method}:${_url}`)
    }
  }
}

export function tick () {
  return new Promise(resolve => setTimeout(resolve, 50))
}

export function xhr_setup () {
  global.xhr_calls = []
  global.XMLHttpRequest = MockXMLHttpRequest
}

// taken directly from index.js
export const STRINGS = {
  skills_label: 'Skills',
  contractor_enquiry: 'Please enter your details below to enquire about tutoring with {contractor_name}.',
  enquiry: 'Please enter your details below and we will get in touch with you shortly.',
  contractor_enquiry_button: 'Contact {contractor_name}',
  contractor_details_button: 'Show Profile',
  submit_enquiry: 'Submit Enquiry',
  enquiry_submitted_thanks: 'Enquiry submitted, thank you.',
  enquiry_modal_submitted_thanks: 'Enquiry submitted, thank you.\n\nYou can now close this window.',
  enquiry_button: 'Get in touch',
  enquiry_title: 'Enquiry',
  grecaptcha_missing: 'This captcha is required',
  required: ' (Required)',
  subject_filter_placeholder: 'Select a subject...',
  subject_filter_summary_single: '{subject}: showing 1 result',
  subject_filter_summary_plural: '{subject}: showing {count} results',
  location_input_placeholder: 'Enter your address or zip/postal code...',
  view_profile: 'View Profile',
  review_hours: '({hours} hours)',
  previous: 'Previous',
  next: 'Next',
  no_tutors_found: 'No more tutors found',
  no_tutors_found_loc: 'No more tutors found near this location',
  distance_away: '{distance}km away',
}
