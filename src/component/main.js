const React = require('react')
const elemental = require('elemental')
const ReactFireMixin = require('reactfire')
const debug = require('debug')('demo:main')

const Calendar = require('./calendar')
const CreateReservation = require('./createReservation')

// ignore this, not suitable for production
const { Container, Row, Col, Form, FormField, FormInput } = elemental

// business logic & main view
module.exports = React.createClass({
  mixins: [ReactFireMixin],
  propTypes: {
    util: React.PropTypes.object,
    restaurantId: React.PropTypes.string
  },
  getInitialState () {
    return {
      date: '2015-11-01',
      tables: [],
      reservations: [],
      working: false
    }
  },
  setDate (event) {
    const { value } = event.target
    if (value) {
      this.setState({ date: value })
      this.bindReservations(value, true)
    }
  },
  createReservation ({ tableId, timerange }) {
    const { util } = this.props
    debug('creating reservation for %s from %s to %s', tableId, timerange.lower, timerange.upper)

    // FIXME validate timerange e.g. timerange.upper > timerange.lower

    this.setState({ working: true })
    util.reservation.create(tableId, timerange)
                    .then(() => debug('successful reservation'))
                    .catch(e => debug('failed creating reservation', e.message || e))
                    .then(() => this.setState({ working: false }))
  },
  modifyReservation (obj) {
    this.props.util.reservation.modify(obj.reservationId, obj.tableId, obj.timerange)
    // FIXME Error handling. It should reset chart upon error.
  },
  bindReservations (date = this.state.date, unbind = false) {
    debug('bindReservations %s', date)
    if (unbind) {
      this.unbind('reservations')
    }

    const { util, restaurantId } = this.props
    this.bindAsArray(util.reservation.query(restaurantId, date), 'reservations')
  },
  componentWillMount () {
    const { util, restaurantId } = this.props
    this.bindAsArray(util.table.query(restaurantId), 'tables')
    this.bindReservations()
  },
  render () {
    const { date, tables, reservations, working } = this.state
    debug('tables', tables)
    debug('reservations', reservations)
    debug('task in progress %s', working)
    return (
      <Container maxWidth={1000}>
        <Row>
          <Col sm='1/2'>
            <Form type='horizontal'>
              <FormField label='Date (UTC)' htmlFor='ui-reservation-date'>
                <FormInput type='date' name='ui-reservation-date' value={date} onChange={this.setDate} />
              </FormField>
            </Form>
          </Col>
          <Col sm='1/2'>
            <CreateReservation disabled={working} tables={tables} onSubmit={this.createReservation} />
          </Col>
        </Row>
        <Row>
          <Calendar date={date} tables={tables} reservations={reservations} onDrag={this.modifyReservation}/>
        </Row>
      </Container>
    )
  }
})
