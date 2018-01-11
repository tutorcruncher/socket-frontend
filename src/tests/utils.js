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
    content: JSON.stringify(
      [
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
      ])
  })
}

export function MockXMLHttpRequest () {
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
  return new Promise(resolve => setTimeout(resolve, 0))
}

export function xhr_setup () {
  global.xhr_calls = []
  global.XMLHttpRequest = MockXMLHttpRequest
}
