import neo4j from 'neo4j-driver'

class Neo4jDriver {
  constructor ({ host, port, user, password }) {
    if (!host)
      throw new ReferenceError('Missing "host" parameter')

    const address = `bolt://${host}:${port}`
    const credentials = neo4j.auth.basic(user, password)

    this.driver = neo4j.driver(address, credentials, { encrypted: false })

    this.session = () => this.driver.session()

    this.run = async (query, params) => {
      const session = this.session()

      try {
        const result = await session.run(query, params)

        session.close()
        return result
      } catch (error) {
        session.close()
        throw error
      }
    }

    this.getRecords = async (query, params) => {
      const { records } = await this.run(query, params)

      return records.map(x => x.toObject())
    }

    this.getAllRelationships = async () => {
      const results = await this.getRecords('CALL db.relationshipTypes()')

      return results.map(({ relationshipType }) => relationshipType)
    }

    this.getAllNodeLabels = async () => {
      const results = await this.getRecords('CALL db.labels()')

      return results.map(({ label }) => label)
    }

    this.getNodeProperties = async node => {
      const results = await this.getRecords(`
        MATCH (n:${node}) WITH DISTINCT keys(n) AS keys
        UNWIND keys AS key WITH DISTINCT key
        RETURN key
      `)

      return results.map(({ key }) => key)
    }

    this.viewAllRelationships = async () => {
      const results = await this.getRecords(`
        MATCH (n)
        OPTIONAL MATCH (n)-[r]->(x)
        WITH DISTINCT {from: labels(n), relationship: type(r), to: labels(x)} AS relationships
        RETURN relationships;
      `)

      return results
        .map(({ relationships }) => relationships)
        .filter(({ from, to, relationship }) => from !== null && to !== null && relationship !== null)
        .filter(({ from, to }) => from.length && to.length)
    }
  }
}

export default Neo4jDriver
