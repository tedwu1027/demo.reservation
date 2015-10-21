const d3 = require('d3')
const R = require('ramda')
const React = require('react')
const { decode } = require('isodate-convert')
const debug = require('debug')('demo:calendar')

const pluckId = R.pluck('id')

// a logic-less view that renders chart
module.exports = React.createClass({
  propTypes: {
    date: React.PropTypes.string.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    margin: React.PropTypes.object,
    tables: React.PropTypes.array,
    reservations: React.PropTypes.array,
    onDrag: React.PropTypes.func
  },
  getDefaultProps () {
    return {
      width: 960,
      height: 400,
      margin: { top: 20, bottom: 20, left: 80, right: 20 },
      tables: [],
      reservations: []
    }
  },
  componentWillMount () {
    this.x = d3.time.scale().range([0, this.props.width])
    this.y = d3.scale.ordinal().rangeRoundBands([this.props.height, 0])

    const formatter = d3.time.format.utc.multi([
      ['.%L', d => d.getUTCMilliseconds()],
      [':%S', d => d.getUTCSeconds()],
      ['%I:%M', d => d.getUTCMinutes()],
      ['%I %p', d => d.getUTCHours()],
      ['%a %d', d => d.getUTCDay() && d.getUTCDate() !== 1],
      ['%b %d', d => d.getUTCDate() !== 1],
      ['%B', d => d.getUTCMonth()],
      ['%Y', () => true]
    ])

    this.xAxis = d3.svg.axis().scale(this.x).orient('bottom').tickFormat(formatter)
    this.yAxis = d3.svg.axis().scale(this.y).orient('left')

    // Draggable behavior
    this.iy = d3.scale.quantize().domain([this.props.height, 0])

    function dragstarted () {
      debug('dragstarted')
      d3.event.sourceEvent.stopPropagation()
      d3.select(this).classed('dragging', true)
    }

    const component = this
    function dragged (d) {
      debug('dragged')
      const x = d3.event.x || d3.event.sourceEvent.x
      const y = d3.event.y || d3.event.sourceEvent.y
      d3.select(this).attr('x', x).attr('y', component.y(component.iy(y)))
    }

    function dragended (d) {
      debug('dragended')
      d3.select(this).classed('dragging', false)
      if (component.props.onDrag) {
        const el = d3.select(this)
        const x = ~~el.attr('x')
        const y = ~~el.attr('y')
        const width = ~~el.attr('width')
        const timerange = {
          lower: component.x.invert(x).toISOString(),
          upper: component.x.invert(x + width).toISOString()
        }
        component.props.onDrag({ reservationId: d.id, tableId: component.iy(y), timerange })
      }
    }

    this.drag = d3.behavior.drag()
                    .on('dragstart', dragstarted)
                    .on('drag', dragged)
                    .on('dragend', dragended)
  },
  componentDidUpdate () {
    this.xAxis.scale(this.x)
    this.yAxis.scale(this.y)
    d3.select(this.refs.xAxis).call(this.xAxis)
    d3.select(this.refs.yAxis).call(this.yAxis)

    if (this.props.tables.length > 0 && this.refs.rects) {
      d3.select(this.refs.rects).selectAll('rect').data(decode(this.props.reservations))
        .enter().append('rect')
        .attr('class', 'rect')
        .attr('x', d => this.x(d.timerange.lower))
        .attr('y', d => this.y(d.table_id))
        .attr('width', d => this.x(d.timerange.upper) - this.x(d.timerange.lower))
        .attr('height', this.y.rangeBand())
        .call(this.drag)
    }
  },
  render () {
    // rendering chart using D3.js
    const { date, width, height, margin, tables } = this.props

    this.x.domain([new Date(`${date}T00:00Z`), new Date(`${date}T23:59:59Z`)])
    this.y.domain(pluckId(this.props.tables))
    this.iy.range(this.y.domain())

    let grid = []
    if (tables.length > 0) {
      grid = this.y.range().map((h, idx) => {
        return (<line key={idx} x1='0' y1={h} x2={this.props.width} y2={h} />)
      })
    }

    return (
      <svg ref='svg' width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          <g ref='xAxis' className='x axis' transform={`translate(0,${height})`} />
          <g ref='yAxis' className='y axis'>
            <text transform='rotate(-90)' y={6} dy='.71em' textAnchor='end'>table</text>
          </g>
          <g className='y axis'>{grid}</g>
          <g ref='rects' />
        </g>
      </svg>
    )
  }
})
