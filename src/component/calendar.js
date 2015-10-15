const d3 = require('d3')
const R = require('ramda')
const React = require('react')
const { decode } = require('isodate-convert')

const pluckId = R.pluck('id')

// a logic-less view that renders chart
module.exports = React.createClass({
  propTypes: {
    date: React.PropTypes.string.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    margin: React.PropTypes.object,
    tables: React.PropTypes.array,
    reservations: React.PropTypes.array
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
    this.xAxis = d3.svg.axis().scale(this.x).orient('bottom')
    this.yAxis = d3.svg.axis().scale(this.y).orient('left')
  },
  render () {
    // rendering chart using D3.js
    const { date, width, height, margin, tables, reservations } = this.props

    this.x.domain([new Date(`${date}T00:00Z`), new Date(`${date}T23:59:59Z`)])
    this.y.domain(pluckId(this.props.tables))

    let rect = []
    if (tables.length > 0) {
      rect = decode(reservations).map(({ id, table_id, timerange }) => {
        const x = this.x(timerange.lower)
        const width = this.x(timerange.upper) - x
        const y = this.y(table_id)
        return <rect key={id} className='rect' x={x} width={width} y={y} height={this.y.rangeBand()} />
      })
    }

    this.xAxis.scale(this.x)
    this.yAxis.scale(this.y)
    d3.select(this.refs.xAxis).call(this.xAxis)
    d3.select(this.refs.yAxis).call(this.yAxis)

    return (
      <svg ref='svg' width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          <g ref='xAxis' className='x axis' transform={`translate(0,${height})`} />
          <g ref='yAxis' className='y axis'>
            <text transform='rotate(-90)' y={6} dy='.71em' textAnchor='end'>table</text>
          </g>
          {rect}
        </g>
      </svg>
    )
  }
})
