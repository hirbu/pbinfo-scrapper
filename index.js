require('dotenv').config()

const axios = require('axios').default
const Downloader = require('nodejs-file-downloader')
const fs = require('fs').promises

const puppeteer = require('puppeteer-extra')
const stealth = require('puppeteer-extra-plugin-stealth')
puppeteer.use(stealth())
puppeteer.use(
    require('puppeteer-extra-plugin-block-resources')({
        blockedTypes: new Set(['image', 'stylesheet', 'font', 'media']),
    }),
)

puppeteer
    .launch({ headless: true })
    .then(async (browser) => {
        const page = await browser.newPage()

        await page.setUserAgent(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4182.0 Safari/537.36',
        )

        await page.goto('https://www.pbinfo.ro/')

        await page.$eval('#user', (el) => (el.value = 'YOUR USERNAME HERE'))
        await page.$eval('#parola', (el) => (el.value = 'YOUR PASSWORD HERE'))

        await page.$eval('#form-login', (el) =>
            el.querySelector('button').click(),
        )

        await page.waitForNavigation({ waitUntil: 'networkidle2' })

        const username = await page.$eval(
            '.pbi-widget-user a',
            (a) => a.href.split('/').slice(-1)[0],
        )

        const problems = await axios
            .get(
                `https://www.pbinfo.ro/ajx-module/profil/json-jurnal.php?user=${username}`,
            )
            .then((response) => response.data)

        const solved_problems = await problems.content.filter(
            (problem) => problem.scor === '100',
        )

        const unique_solved_problems = await solved_problems.reduce(
            (unique, item) =>
                unique
                    .map((element) => element.denumire)
                    .includes(item.denumire)
                    ? unique
                    : [...unique, item],
            [],
        )

        const cookies = await page.cookies()

        await browser.close()

        return [username, cookies, unique_solved_problems]
    })
    .then(async ([username, cookies, solved_problems]) => {
        await solved_problems.forEach(async (solved_problem) => {
            const response = await axios.get(
                `https://www.pbinfo.ro/solutii/user/${username}/problema/${
                    solved_problem.id
                }/${no_ăîâțș(solved_problem.denumire)}`,
                {
                    headers: {
                        Cookie: `SSID=${cookies[0].value}; vizitator_track=${cookies[5].value};`,
                    },
                },
            )
            const html = await response.data
            const begin_of_td =
                await html.search(`<td style="background:#BDFF7C">
												<a href="/detalii-evaluare/`)
            let begin_of_id = (await begin_of_td) + 71
            let end_of_id = await begin_of_id

            while ((await html[end_of_id]) !== '"') end_of_id++

            const id = html.slice(begin_of_id, end_of_id)

            const downloader = new Downloader({
                url: `https://www.pbinfo.ro/php/descarca-sursa.php?id=${id}`,
                directory: './solutii',
                headers: {
                    Cookie: `SSID=${cookies[0].value}; vizitator_track=${cookies[5].value};`,
                },
                maxAttempts: 10,
                cloneFiles: false,
            })

            await downloader.download()
        })
    })

const no_ăîâțș = (str) => {
    return [...str]
        .map((ch) => {
            switch (ch) {
                case 'ă':
                case 'â':
                    return 'a'
                case 'î':
                    return 'i'
                case 'ș':
                    return 's'
                case 'ț':
                    return 't'
                default:
                    return ch
            }
        })
        .join('')
}
