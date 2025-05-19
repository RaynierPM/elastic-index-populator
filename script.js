import {readFileSync, writeFileSync} from 'node:fs'
import { join } from 'node:path'
import readline from 'node:readline'

/* Errors */
class NotValidItemError extends Error {
  constructor(message) {
    super(message)
  }
}

process.loadEnvFile(join(process.cwd(), '.env'))

const config = {
  filePath: process.env.FILE,
  host: process.env.HOST,
  indexName: process.env.INDEX_NAME,
  apiKey: process.env.API_KEY,
  packagesSize: process.env.PACKAGES_SIZE ?? 500
} 

class Script {
  #ERRORS = []
  item_packages = []

  constructor() {
    this.#mapItems()
  }

  #mapItems() {
    const dataString = readFileSync(config.filePath).toString()
    const data = JSON.parse(dataString)

    console.log(" === Creating packages === ")
    if (data && Array.isArray(data)) {
      const size = config.packagesSize
      for (let i = 0; i < Math.ceil(data.length/size); i++) {
        this.item_packages.push(data.slice(i*size, (i+1)*size))
      }
    }else {
      throw new NotValidItemError()
    }
    console.log(" === Packages created === ")
    console.log(`Packages created: ${this.item_packages.length} \n packages size: ${config.packagesSize} \n\n`)
  }

  uploadPackage(...items) {
    const promises = []

    for (const item of items) {
      const promise = fetch(`${config.host}/${config.indexName}/_doc`, {
        body: JSON.stringify(item),
        headers: {
          'Authorization': `ApiKey ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        method: 'POST'
      })

      promise.then((response) => {
        if (!response.ok) {
          this.#ERRORS.push(item)
        }
      })

      promise.catch(() => {
        this.#ERRORS.push(item)
      })

      promises.push(promise)
    }
    
    return Promise.all(promises)
  }

  async sendPackages() {
    let packageNumber = 1
    for (const item_package of this.item_packages) {
      console.log(` === Initializating to transfer package #${packageNumber} === `)
      await this.uploadPackage(...item_package)
      packageNumber++
    }
  }

  #errorsToFile() {
    writeFileSync(join(process.cwd(), 'not_uploaded.json'),
    JSON.stringify({
      count: this.#ERRORS.length,
      items: this.#ERRORS,
    }, null, 2)
  )
  }

  init() {
    const startDate = new Date()
    this.sendPackages()
    .then(() => {
      console.log(" === Process ended === ")
      this.#errorsToFile()
      console.log(" === All not uploaded items will be on: not_uploaded.json === ")
    })
    .catch(err => {
      "Has been occured something wrong. Check the errors here below.\n\nError:"
      console.log(err)
    })
    .finally(() => {
      const endDate = new Date()
      console.log(` === Process ended after ${(endDate - startDate).toFixed(2)} seconds === `)
      process.exit(1)
    })
  }
}

async function main() {
  console.log(" === Initializating script === ")
  const script = new Script()
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  console.log(" === Config === ")
  console.log({
    config
  })
  rl.question("Do you want to initializate the process knowing this config? [yes/y]: ", (answer) => {
    if (answer.match(/(^yes)|(^y$)/gi)) {
      script.init()
    } else {
      console.log("Good bye!")
      process.exit(1)
    }
  })
  


}

main().catch((err) => {
  if (err instanceof NotValidItemError) {
    console.log(`====== Error: File path not valid`)
  }else {
    throw err
  }
})