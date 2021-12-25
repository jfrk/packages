import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 5050 });

function createBucket() {
  return { ops: [], state: {} };
}

let buckets = {
  publicBucket: {
    ops: [],
    state: {
      person: {
        person1: {
          name: "Jane",
        },
        person2: {
          name: "Adam",
        },
      },
    },
  },
  privateBucket1: {
    ops: [],
    state: {
      person: {
        person1: {
          alias: "Jane from school",
        },
      },
    },
  },
};

function applyOp(bucket, [, dataset, row, column, value]) {
  if (!bucket.state[dataset]) {
    return (bucket.state[dataset] = {});
  }
  if (!bucket.state[dataset][row]) {
    return (bucket.state[dataset][row] = {});
  }
  bucket.state[dataset][row][column] = value;
}

function set(bucket, timestamp, dataset, row, column, value) {
  if (!buckets[bucket]) {
    buckets[bucket] = createBucket();
  }
  let op = [timestamp, dataset, row, column, value];
  buckets[bucket].ops.push(op);
  applyOp(buckets[bucket], op);
  console.log(buckets[bucket]);
}

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    let [dataset, data] = JSON.parse(message);
    switch (dataset) {
      case "op":
        {
          let [bucket, timestamp, dataset, row, column, value] = data;
          set(bucket, timestamp, dataset, row, column, value);
          ws.send(JSON.stringify(buckets[bucket].state));
        }
        break;
    }
  });

  ws.send("something");
});
