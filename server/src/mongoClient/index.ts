import { MongoClient, Db } from "mongodb"

const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017"
const DATABASE = process.env.MONGO_DB ?? "gqis"

let _db: Db | null = null
let _client: MongoClient | null = null

export async function initMongo(): Promise<void> {
	if (_db) return

	const client = new MongoClient(MONGO_URI, {
		connectTimeoutMS: 30000,
		socketTimeoutMS: 45000,
		maxPoolSize: 50,
		minPoolSize: 5,
		retryWrites: true,
		retryReads: true,
	})

	try {
		await client.connect()
		_client = client
		_db = client.db(DATABASE)

		await _db.collection("messages").createIndex({ url: 1, createdAt: 1 })
		await _db.collection("messages").createIndex({ "message.id": 1 }, { unique: true })

		console.log(`Connected to MongoDB at ${MONGO_URI}, database: ${DATABASE}`)
	} catch (error) {
		console.error("Failed to connect to MongoDB:", error)
		throw error
	}
}

export function getDb(): Db {
	if (!_db) {
		throw new Error("MongoDB not initialized. Did you call initMongo()?")
	}
	return _db
}

export function getClient(): MongoClient {
	if (!_client) {
		throw new Error("MongoDB client not initialized. Did you call initMongo()?")
	}
	return _client
}

export async function closeMongo(): Promise<void> {
	if (_client) {
		await _client.close()
		_client = null
		_db = null
		console.log("MongoDB connection closed")
	}
}
