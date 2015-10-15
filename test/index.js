/* global describe, before, beforeEach, it */
const React = require('react')
const sinon = require('sinon')
const Emitter = require('events')
const assert = require('power-assert')
const connect = require('../src/util')
const testUtils = require('react-addons-test-utils')
const Calendar = require('../src/component/calendar')
const CreateReservation = require('../src/component/createReservation')

describe('component', () => {
  describe('Calendar', () => {
    let sandbox
    beforeEach(() => {
      sandbox = testUtils.createRenderer()
    })

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

    it('should render without reservation', () => {
      sandbox.render(<Calendar date='2015-01-01' />)
      const svg = sandbox.getRenderOutput()
      assert(svg)
      assert(svg.type === 'svg')
      const g = svg.props.children
      assert(g)
      assert(g.type === 'g')

      const [xAxis, yAxis, rects] = g.props.children
      assert(xAxis)
      assert(yAxis)
      assert(rects)
      assert(rects.length === 0)
    })

    it('should render reservations', () => {
      sandbox.render(<Calendar date='2015-01-01' tables={fixture.tables} reservations={fixture.reservations} />)
      const svg = sandbox.getRenderOutput()
      assert(svg)
      assert(svg.type === 'svg')
      const g = svg.props.children
      assert(g)
      assert(g.type === 'g')

      const [xAxis, yAxis, rects] = g.props.children
      assert(xAxis)
      assert(yAxis)
      assert(rects)
      assert(rects.length === 2)
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

    // FIXME write some tests
    it('should validate inputs')
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
