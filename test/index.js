/* global MouseEvent, describe, before, beforeEach, it */
const React = require('react')
const sinon = require('sinon')
const Emitter = require('events')
const ReactDOM = require('react-dom')
const assert = require('power-assert')
const connect = require('../src/util')
const Main = require('../src/component/main')
const testUtils = require('react-addons-test-utils')
const Calendar = require('../src/component/calendar')
const CreateReservation = require('../src/component/createReservation')

describe('component', () => {
  let sandbox
  beforeEach(() => {
    sandbox = document.createElement('div')
  })

  describe('Calendar', () => {
    const fixture = {
      tables: [
        { id: 'cifqjz69w0000klrl85dbgsxv' },
        { id: 'cifqjz71c0001klrluy6ffqgz' },
        { id: 'cifqjz7eg0002klrlxlo3yp92' }
      ],
      reservations: [
        { id: '111111', table_id: 'cifqjz69w0000klrl85dbgsxv', timerange: { lower: '2015-11-01T10:00Z', upper: '2015-11-01T11:00Z', bounds: '(]' } },
        { id: '222222', table_id: 'cifqjz7eg0002klrlxlo3yp92', timerange: { lower: '2015-11-01T13:00Z', upper: '2015-11-01T15:00Z', bounds: '(]' } }
      ]
    }

    const raise = (el, type, options) => {
      const e = new MouseEvent(type, options)
      el.dispatchEvent(e)
    }

    it('should render without reservation', () => {
      ReactDOM.render(<Calendar date='2015-01-01' />, sandbox)
      const rects = sandbox.querySelectorAll('rect')
      assert(rects)
      assert(rects.length === 0)
    })

    it('should render reservations', () => {
      ReactDOM.render(<Calendar date='2015-01-01' />, sandbox)
      // update props to render chart
      ReactDOM.render(<Calendar date='2015-01-01' tables={fixture.tables} reservations={fixture.reservations} />, sandbox)
      const rects = sandbox.querySelectorAll('rect')
      assert(rects)
      assert(rects.length === 2)
    })

    // FIXME remove the `.skip` flag to run the test case
    it.skip('should respond to drag events', () => {
      const callback = () => { console.log('called') }
      ReactDOM.render(<Calendar date='2015-01-01' onDrag={callback} />, sandbox)
      // update props to render chart
      ReactDOM.render(<Calendar date='2015-01-01' tables={fixture.tables} reservations={fixture.reservations} onDrag={callback} />, sandbox)
      const rects = sandbox.querySelectorAll('rect')

      // drag is quite tricky to simulate
      raise(rects[0], 'mousedown')
      raise(window, 'mousemove')
      raise(window, 'mouseup')

      // FIXME how do we test if the callback is called once?
      // hint, see http://sinonjs.org
    })
  })

  describe('CreateReservation', () => {
    const fixture = {
      tables: [
        { id: 'cifqjz69w0000klrl85dbgsxv' },
        { id: 'cifqjz71c0001klrluy6ffqgz' },
        { id: 'cifqjz7eg0002klrlxlo3yp92' }
      ]
    }

    it('should render form', () => {
      const callback = sinon.spy()
      const component = testUtils.renderIntoDocument(<CreateReservation tables={fixture.tables} onSubmit={callback} />)
      const submitButton = testUtils.findRenderedDOMComponentWithTag(component, 'button')

      // simulate dropdown selection
      component.setTable('cifqjz69w0000klrl85dbgsxv')

      assert(callback.called === false)
      testUtils.Simulate.click(submitButton)
      assert(callback.calledOnce)

      const { args } = callback.getCall(0)
      assert(args[0].tableId === 'cifqjz69w0000klrl85dbgsxv')
      assert(args[0].timerange.lower === '2015-11-01T11:00')
      assert(args[0].timerange.upper === '2015-11-01T12:00')
    })

    it('should render disabled form', () => {
      const callback = sinon.spy()
      const component = testUtils.renderIntoDocument(<CreateReservation disabled tables={fixture.tables} onSubmit={callback} />)
      const submitButton = testUtils.findRenderedDOMComponentWithTag(component, 'button')

      // simulate dropdown selection
      component.setTable('cifqjz69w0000klrl85dbgsxv')

      assert(callback.called === false)
      testUtils.Simulate.click(submitButton)
      assert(callback.called === false)

      assert(submitButton.disabled)
    })

    it('should respond to inputs', () => {
      const callback = sinon.spy()
      const component = testUtils.renderIntoDocument(<CreateReservation tables={fixture.tables} onSubmit={callback} />)
      const [lower, upper] = testUtils.scryRenderedDOMComponentsWithTag(component, 'input')
      const submitButton = testUtils.findRenderedDOMComponentWithTag(component, 'button')

      // simulate dropdown selection
      component.setTable('cifqjz69w0000klrl85dbgsxv')

      // simulate time selection
      testUtils.Simulate.change(lower, { target: { name: 'ui-reservation-timerange-lower', value: '2015-12-01T11:00' } })
      testUtils.Simulate.change(upper, { target: { name: 'ui-reservation-timerange-upper', value: '2015-12-01T12:00' } })

      assert(callback.called === false)
      testUtils.Simulate.click(submitButton)
      assert(callback.calledOnce)

      const { args } = callback.getCall(0)
      assert(args[0].tableId === 'cifqjz69w0000klrl85dbgsxv')
      assert(args[0].timerange.lower === '2015-12-01T11:00')
      assert(args[0].timerange.upper === '2015-12-01T12:00')
    })

    // FIXME remove the `.skip` flag to run the test case
    it.skip('should validate inputs', () => {
      const callback = sinon.spy()
      // note that the timerange is invalid i.e. the lower value is higher than the uuper value
      const component = testUtils.renderIntoDocument(<CreateReservation lower='2015-11-01T12:00' upper='2015-11-01T11:00' tables={fixture.tables} onSubmit={callback} />)
      const submitButton = testUtils.findRenderedDOMComponentWithTag(component, 'button')

      // simulate dropdown selection
      component.setTable('cifqjz69w0000klrl85dbgsxv')

      assert(callback.called === false)
      testUtils.Simulate.click(submitButton)
      assert(callback.called === false)
    })
  })

  describe('Main', () => {
    const restaurantId = 'cig1nudn6000081rljv6aexe3'

    let util
    beforeEach(() => {
      util = connect('https://lambda.firebaseio.com/')
    })

    it('should set date')

    it('should create reservation', (done) => {
      const stub = sinon.stub(util.reservation, 'create', () => {
        return Promise.resolve({ reservation_id: 'cig1o5gn9000091rlfcfghgvz', ref: 'https://lambda.firebaseio.com/reservation/cig1o5gn9000091rlfcfghgvz' })
      })
      const tree = ReactDOM.render(<Main util={util} restaurantId={restaurantId} />, sandbox)
      const form = testUtils.findRenderedComponentWithType(tree, CreateReservation)
      const [lower, upper] = testUtils.scryRenderedDOMComponentsWithTag(form, 'input')
      const submitButton = testUtils.findRenderedDOMComponentWithTag(form, 'button')

      // simulate dropdown selection
      form.setTable('cifqjz69w0000klrl85dbgsxv')

      // simulate time selection
      testUtils.Simulate.change(lower, { target: { name: 'ui-reservation-timerange-lower', value: '2015-12-01T11:00' } })
      testUtils.Simulate.change(upper, { target: { name: 'ui-reservation-timerange-upper', value: '2015-12-01T12:00' } })
      testUtils.Simulate.click(submitButton)

      // check if the form is locked
      assert(submitButton.disabled)

      // asynchronously test UI response
      process.nextTick(() => {
        assert(stub.calledOnce)

        // FIXME test callback arguments
        // const { args } = stub.getCall(0)

        // FIXME check if the form is unlocked
        done()
      })
    })

    it('should modify reservation', (done) => {
      const reservationId = 'cig1o5gn9000091rlfcfghgvz'
      const tableId = 'cig1pi5vb000191rl2vuprmlp'
      const timerange = { lower: '2015-12-01T11:00', upper: '2015-12-01T12:00' }
      const ref = 'https://lambda.firebaseio.com/reservation/cig1o5gn9000091rlfcfghgvz'

      const stub = sinon.stub(util.reservation, 'modify', () => {
        return Promise.resolve({ reservation_id: reservationId, ref })
      })

      const tree = ReactDOM.render(<Main util={util} restaurantId={restaurantId} />, sandbox)
      const chart = testUtils.findRenderedComponentWithType(tree, Calendar)

      // since drag event is tested elsewhere, lets skip drag simulation and invoke onDrag directly
      chart.props.onDrag({ reservationId, tableId, timerange })

      process.nextTick(() => {
        assert(stub.calledOnce)

        // FIXME test callback arguments

        done()
      })
    })
  })
})

describe('util', function () {
  this.timeout(8 * 1000) // 8 seconds
  let util

  before(() => {
    util = connect('https://lambda.firebaseio.com/')
  })

  let restaurantId, tableId, reservationId

  it('connect', () => {
    assert(typeof connect === 'function')
    assert(typeof util === 'object')
  })

  it('once value', () => {
    const ee = new Emitter()
    const promise = util.once(ee)
    setTimeout(() => { ee.emit('value') }, 10)
    return promise
  })

  it('once event', () => {
    const ee = new Emitter()
    const promise = util.once(ee, 'foobar')
    setTimeout(() => { ee.emit('foobar') }, 10)
    return promise
  })

  it('should save restaurant', () => {
    return util.restaurant.save('foobar').then(({ restaurant_id }) => {
      assert(restaurant_id)
      restaurantId = restaurant_id
    })
  })

  it('should save table', () => {
    return util.table.save(restaurantId, 'foobar').then(({ table_id }) => {
      assert(table_id)
      tableId = table_id
    })
  })

  it('should query table', () => {
    const query = util.table.query(restaurantId)
    return util.once(query).then((obj) => {
      assert(typeof obj === 'object')

      const ids = Object.keys(obj)
      assert(ids.length === 1)
      assert(ids[0] === tableId)
    })
  })

  it('should create reservation', () => {
    const timerange = {
      lower: '2015-01-01T00:00Z',
      upper: '2015-01-01T01:00Z'
    }
    return util.reservation.create(tableId, timerange).then(({ reservation_id }) => {
      assert(reservation_id)
      reservationId = reservation_id
    })
  })

  it('should query reservation', () => {
    const query = util.reservation.query(restaurantId, '2015-01-01')
    return util.once(query).then((obj) => {
      assert(typeof obj === 'object')

      const ids = Object.keys(obj)
      assert(ids.length === 1)
      assert(ids[0] === reservationId)
    })
  })
})
