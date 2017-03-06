import Vue from 'vue'

const dft_response = [200, {'Content-Type': 'application/json'}, '[{"name": "Foobars", "link": "foobar"}]']

class TestConsole {
  log_ = []
  warning_ = []
  error_ = []

  log () {
    this.log_.push(Array.from(arguments).join())
  }

  warning () {
    this.warning_.push(Array.from(arguments).join())
  }

  error () {
    this.error_.push(Array.from(arguments).join())
  }
}

const vm_data = {
  contractors: [{name: 'Fred Bloggs', link: 'fred-bloggs', tag_line: 'hello'}],
  config: {contact_html: 'name is: {name}'},
  contractors_extra: {'fred-bloggs': {'extra_attributes': [{'name': 'Bio', 'value': 'I am great'}]}},
  enquiry_form_info: {
    visible: [
      {field: 'first_field', type: 'text', label: 'Foobar'}
    ]
  },
  enquiry_data: {},
}

const generate_vm = (router, vm_data_) => new Vue({
  el: document.createElement('div'),
  router: router,
  render: h => h('router-view'),
  data: vm_data_ || vm_data,
  methods: {
    get_details: () => null,
    get_enquiry: () => null,
    get_text: (name, replacements) => null,
  }
})

export {dft_response, TestConsole, vm_data, generate_vm}
