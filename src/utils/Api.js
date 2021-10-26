import axios from "axios"
import crypto from "crypto"

export default class API {
  constructor(url) {
    this.url = url
  }

  signature(body) {
    return crypto
      .createHmac("sha256", `${process.env.API_SECRET}`)
      .update(body)
      .digest("hex")
  }
  setHMACHeaders(body) {
    const headers = {
      "Content-Type": "application/json",
      "Blog-Webhook-HMAC-SHA256": this.signature(body),
    }
    return headers
  }
  logURL() {
    console.log("URL IS: " + this.url)
    console.log("Secret is "+process.env.API_SECRET)
    console.log("REACT_APP_Secret is "+process.env.API_SECRET)
  }
  async recordPost(post) {
    const body = {
      name: post,
      category: post.split("/")[1],
      iat: Date.now(),
      blog: "caseywylie.io",
    }
    return await axios.post(`${this.url}/metrics/report`, body, {
      headers: this.setHMACHeaders(JSON.stringify(body)),
    })
  }
}
