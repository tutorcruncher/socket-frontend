import Vue from 'vue'
import VueRouter from 'vue-router'
import grid from 'src/components/grid'
import {tick} from './_shared'

describe('grid.vue', () => {
  it('should render contractors', () => {
    Vue.use(VueRouter)
    const router = new VueRouter({routes: [
        {path: '/:link', name: 'con-modal', component: {render: h => '-'}},
    ]})
    const vm = new Vue({
      el: document.createElement('div'),
      router: router,
      render: (h) => h(grid),
      data: {
        contractors: [{name: 'Fred Bloggs', link: '123-fred-bloggs', photo: 'http://path/to/img.jpg'}],
        subjects: [],
        config: {subject_filter: false},
      },
      methods: {
        get_contractor_list: () => null,
        get_subject_list: () => null,
        get_selected_subject: () => null,
        get_text: () => null,
      }
    })
    expect(vm.$el.querySelector('h3').textContent).to.equal('Fred Bloggs')
    expect(vm.$el.querySelector('a').attributes['href'].value).to.equal('#/123-fred-bloggs')
    expect(vm.$el.querySelector('img').attributes['src'].value).to.equal('http://path/to/img.jpg')
    expect(vm.$el.querySelectorAll('.tcs-select-container')).to.have.lengthOf(0)
  })
})

describe('grid.vue', () => {
  it('should filter contractors', async () => {
    Vue.use(VueRouter)
    const router = new VueRouter({routes: [
        {path: '/:type(s|q)?/:link(\\d+-[\\w-]+)?', name: 'index', component: {render: h => '-'}},
        {path: '/:link', name: 'con-modal', component: {render: h => '-'}},
    ]})
    const routes_visited = []
    const vm = new Vue({
      el: document.createElement('div'),
      router: router,
      render: (h) => h(grid),
      data: {
        contractors: [{name: 'Fred Bloggs', link: '123-fred-bloggs', photo: 'http://path/to/img.jpg'}],
        subjects: [],
        config: {subject_filter: true},
      },
      watch: {
        '$route' (to) {
          routes_visited.push(to.path)
        }
      },
      methods: {
        get_contractor_list: () => null,
        get_subject_list () {
          this.subjects.push({id: 1, name: 'Maths', link: '1-maths'})
          this.subjects.push({id: 2, name: 'English', link: '2-english'})
          this.subjects.push({id: 3, name: 'Science', link: '3-science'})
        },
        get_selected_subject: () => null,
        get_text: () => null,
      }
    })
    expect(routes_visited).to.deep.equal([])
    expect(vm.$el.querySelector('h3').textContent).to.equal('Fred Bloggs')
    expect(vm.$el.querySelectorAll('.tcs-select-container')).to.have.lengthOf(1)
    expect(vm.$el.querySelectorAll('input')).to.have.lengthOf(1)

    vm.$el.querySelector('.multiselect').dispatchEvent(new window.Event('focus'))
    await tick()
    const s = vm.$el.querySelectorAll('.multiselect__element')[2].querySelector('span')
    expect(s.innerText).to.equal('Science')
    s.dispatchEvent(new window.Event('mousedown'))
    await tick()
    expect(routes_visited).to.deep.equal(['/s/3-science'])

    vm.$el.querySelector('.cross').click()
    await tick()
    expect(routes_visited).to.deep.equal(['/s/3-science', '/'])
  })
})
