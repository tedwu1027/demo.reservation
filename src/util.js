const Firebase = require('firebase')
const debug = require('debug')('demo:util')

const enqueue = (ref, task) => {
  return new Promise((resolve, reject) => {
    ref.push(task).on('value', (ss) => {
      if (ss && ss.exists()) {
        const progress = ss.val()
        if (!progress) { return }
        debug('task progress %s', progress._state)
        if (/_done$/.test(progress._state)) {
          resolve(progress)
        } else if (progress._state === 'error') {
          reject(new Error(progress._error_details.error || progress._error_details))
        }
      }
    })
  })
}

module.exports = (uri) => {
  const rootRef = typeof uri === 'string' ? new Firebase(uri) : uri
  debug('connected to %s', rootRef.toString())
  const queueRef = rootRef.child('queue/tasks')

  const restaurant = {
    save (name) {
      const _state = 'save_restaurant_enqueued'
      return enqueue(queueRef, { _state, name })
    }
  }

  const table = {
    save (restaurantId, name) {
      const _state = 'save_table_enqueued'
      return enqueue(queueRef, { _state, restaurant_id: restaurantId, name })
    },
    query (restaurantId) {
      return rootRef.child('table').orderByChild('restaurant_id').equalTo(restaurantId)
    }
  }

  const reservation = {
    create (tableId, timerange) {
      const _state = 'create_reservation_enqueued'
      return enqueue(queueRef, { _state, table_id: tableId, timerange })
    },
    query (restaurantId, date) {
      // sample hexastore index see http://www.vldb.org/pvldb/1/1453965.pdf
      // [restaurantId]::[lower timerange]::[tableId]
      // "cifq8erh60003wirlbtlj1a6l::2015-01-01T03:00:00.000Z::cifq8erh60002wirlhpfkynxy"
      return rootRef.child('reservation')
                    .orderByChild('rlt_index')
                    .startAt(`${restaurantId}::${date}T00:00:00.000Z::c`)
                    .endAt(`${restaurantId}::${date}T23:59:59.999Z::\uf8ff`)
    }
  }

  // helpers
  const once = (ref, event = 'value') => {
    return new Promise((resolve) => {
      ref.once(event, (ss) => {
        if (ss && ss.exists()) {
          resolve(ss.val())
        } else {
          resolve(undefined)
        }
      })
    })
  }

  return { restaurant, table, reservation, once }
}
