import 'dotenv/config'

import Neo4jDriver from './helpers/neo4j'

const { NEO4J_HOST, NEO4J_PASSWORD, NEO4J_PORT, NEO4J_USER } = process.env

const main = async () => {
  const neo4j = new Neo4jDriver({
    host: NEO4J_HOST,
    port: NEO4J_PORT,
    user: NEO4J_USER,
    password: NEO4J_PASSWORD,
  })

  const relationships = await neo4j.viewAllRelationships()

  console.log(relationships)

  process.exit(0)
}

main()
