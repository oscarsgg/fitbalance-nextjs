import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Mensaje de confirmación en consola
if (!global._mongoClientConnected) {
  clientPromise
    .then(() => {
      console.log("Conexion exitosa a la base de datos!")
      global._mongoClientConnected = true
    })
    .catch((err) => {
      console.error("Error de conexión a la base de datos:", err)
    })
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise
