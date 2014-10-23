runExamples([

  [ 'get the documentation',
    { action: 'get', resource: [],
      accept: { meaning: 'document', encoding: 'text' }
    }
  ],

  // *** more examples go here
  [ 'add a number',
    { action: 'post', resource: ['nums'],
      body: '1', type: { meaning: 'number', encoding: 'csv' },
      accept: { meaning: 'number', encoding: 'csv' }
    }
  ],
  [ 'add another number',
    { action: 'post', resource: ['nums'],
      body: '2', type: { meaning: 'number', encoding: 'csv' },
      accept: { meaning: 'number', encoding: 'csv' }
    }
  ],
  [ 'get the list of the two numbers',
    { action: 'get', resource: ['nums'],
      accept: { meaning: 'number-list', encoding: 'csv' }
    }
  ],
  [ 'get the sum of the two numbers',
    { action: 'get', resource: ['nums', 'sum'],
      accept: { meaning: 'number', encoding: 'csv' }
    }
  ],
  [ "get a resource that doesn't exist",
    { action: 'get', resource: ['pants', 'shoes'],
      accept: { meaning: 'number', encoding: 'csv' }
    }
  ],
])

// ---

function appServer(request) {
  // init global state on this fn object on first request
  appServer.numbers = appServer.numbers || []
  // grab a local ref to it for typing convinence
  var numbers = appServer.numbers

  var response = {}

  // the root resource
  if (!request.resource[0] && 'get' === request.action) {
    response.status = 'ok'
    response.type = { meaning: 'document', encoding: 'text' },
    response.body = [
      'Addition as a service',
      '',
      'get  []              - this document',
      'post ["nums"]        - add number to list in storage',
      'get  ["nums"]        - retreive list of numbers from storage',
      'get  ["nums", "sum"] - retreive sum of numbers in said list',
    ].join('\n')
    return response
  } else if ('post' == request.action && 'nums' == request.resource[0]) {
    response.status = 'ok'
    response.type = { meaning: 'number', encoding: 'csv' }
    appServer.numbers.push(Number(request.body))
    response.body = Number(request.body)
    return response
  } else if ('get' == request.action && 'nums' == request.resource[0] && 'sum' == request.resource[1]) {
    response.status = 'ok'
    response.type = { meaning: 'number', encoding: 'csv' }
    response.body = appServer.numbers.reduce(function(memo, number) {
      return memo = sum(memo, number)
    })
    return response
  } else if ('get' == request.action && 'nums' == request.resource[0]) {
    response.status = 'ok'
    response.type = { meaning: 'numbers', encoding: 'csv' }
    response.body = appServer.numbers.join(',')
    return response
  } else if ('nums' != request.resource[0]) {
    response.status = 'not found'
    response.type = { meaning: 'document', encoding: 'text' }
    response.body = 'Nothing found, see root resource for documentation'
    return response
  }

  // *** solution code goes here

}

function sum(a,b) { return a + b }

// ---

function appClient(request) { return appServer(request) }

// ---

// Not part of the challenge, just driver support code to make
// visual testing easier

function runExamples(examples) {
  filterExamples(examples).forEach(function(args){
    var msg = args.shift()
    var req = args.shift()

    console.log()
    console.log(ansi(msg, 34))
    console.log()
    console.log(ansi('-->', 33), req)
    console.log()
    var res = appClient(req)
    if (!res) {
      console.error(ansi('server did not return response', 31))
      return
    }

    var body = res.body
    delete res.body
    console.log(ansi('<--', 33), res)
    console.log()
    console.log(ansi(body, 35))
    console.log()
    console.log('---')
  })
}

// http://en.wikipedia.org/wiki/ANSI_escape_code#Colors
function ansi(str, code) {
  if (!(isNode() && process.stdout.isTTY)) return str
  code = code || 10
  return "\u001b[" + code + "m" + str + "\u001b[m"
}

// in node, allow the user to run just one example by providing it as an arg on the
// command line
function filterExamples(examples) {
  if (!isNode()) return examples
  var arg = process.argv[2]
  if (!arg) return examples
  return examples.filter(function(example){ return example[0] === arg })
}

function isNode() { return 'undefined' !== typeof process }
