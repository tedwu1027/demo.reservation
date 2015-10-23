/* global localStorage */
const React = require('react')
const connect = require('./util')
const ReactDOM = require('react-dom')
const Main = require('./component/main')
const debug = require('debug')('demo:index')

// debug configurations
// see https://github.com/visionmedia/debug#browser-support
localStorage.debug = 'demo:*'

// fixtures, things that is not important for this demo

const util = connect('https://lambda.firebaseio.com/')
const restaurantId = 'cifp8gz1300001krlxtl74ygf'
debug('using restaurantId %s', restaurantId)

ReactDOM.render(<Main util={util} restaurantId={restaurantId} />, document.getElementById('app'))
