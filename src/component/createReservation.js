const R = require('ramda')
const React = require('react')
const elemental = require('elemental')

// ignore this, not suitable for production
const { Button, Form, FormField, FormInput, FormSelect, Spinner } = elemental
const pluckId = R.pluck('id')

// a logic-less view that renders reservation form
module.exports = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool,
    lower: React.PropTypes.string,
    upper: React.PropTypes.string,
    tables: React.PropTypes.array
  },
  getDefaultProps () {
    return {
      disabled: false,
      lower: '2015-11-01T11:00',
      upper: '2015-11-01T12:00',
      tables: []
    }
  },
  getInitialState () {
    return {
      lower: this.props.lower,
      upper: this.props.upper
    }
  },
  setDate (event) {
    const change = {}
    const { name, value } = event.target
    switch (name) {
      case 'ui-reservation-timerange-lower':
        change.lower = value
        break
      case 'ui-reservation-timerange-upper':
        change.upper = value
        break
    }
    this.setState(change)
  },
  setTable (tableId) {
    this.setState({ tableId })
  },
  handleSubmit () {
    const { tableId, lower, upper } = this.state
    if (tableId) {
      this.props.onSubmit({ tableId, timerange: { lower, upper } })
    }
  },
  render () {
    const options = pluckId(this.props.tables).map((d) => {
      return { label: d, value: d }
    })

    var spinner
    if (this.props.disabled) {
      spinner = <Spinner type='primary' />
    }

    return (
      <Form type='horizontal'>
        <FormField label='Start (UTC)' htmlFor='ui-reservation-timerange-lower'>
          <FormInput type='datetime-local' name='ui-reservation-timerange-lower' value={this.state.lower} onChange={this.setDate} />
        </FormField>
        <FormField label='End (UTC)' htmlFor='ui-reservation-timerange-upper'>
          <FormInput type='datetime-local' name='ui-reservation-timerange-upper' value={this.state.upper} onChange={this.setDate} />
        </FormField>
        <FormField label='Table ID' htmlFor='ui-reservation-table-id'>
          <FormSelect options={options} firstOption='Table ID' name='ui-reservation-table-id' onChange={this.setTable} />
        </FormField>
        <Button type='default' onClick={this.handleSubmit} disabled={this.props.disabled}>{spinner}Submit</Button>
      </Form>
    )
  }
})
