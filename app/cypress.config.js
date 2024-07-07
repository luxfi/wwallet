/* eslint-disable @typescript-eslint/no-unused-vars */
const { defineConfig } = require('cypress')

module.exports = defineConfig({
    chromeWebSecurity: false,
    fixturesFolder: false,

    e2e: {
        supportFile: false,
        baseUrl: 'http://localhost:5000', // 修改为你实际的应用地址
    },
})
