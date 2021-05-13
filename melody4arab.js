const axios = require('axios').default;
const JSDOM = require('jsdom').JSDOM;
const fs = require('fs');
const path = require('path');

async function getDownloadLink(songUrl) {
    const downloadPageDom = new JSDOM((await axios.get(songUrl)).data)
    return downloadPageDom.window.document.getElementsByTagName('table')[12].firstElementChild.firstElementChild.firstElementChild.firstElementChild.children[1].href
}

async function getSongs(albumUrl) {
    const songs = []
    const songsDom = new JSDOM((await axios.get(albumUrl)).data)
    const songsEls = songsDom.window.document.getElementsByClassName('song')
    for (let s of songsEls)
        songs.push({
            name: s.children[1].firstElementChild.firstElementChild.textContent,
            href: s.children[4].firstElementChild.firstElementChild.href,
            downloadLink: await getDownloadLink(s.children[4].firstElementChild.firstElementChild.href)
        })
    return songs
}

async function getAlbums(url) {
    const albums = []
    const albumsDom = new JSDOM((await axios.get(url)).data)
    console.info(`[*] Downloading metadata for '${albumsDom.window.document.getElementsByClassName('style5')[0].textContent}'...`)
    const albumsEls = albumsDom.window.document.getElementsByTagName('table')[10].firstElementChild.children
    for (i = 1; i < albumsEls.length; i++) {
        albums.push({
            name: albumsEls[i].firstElementChild.firstElementChild.firstElementChild.textContent,
            href: albumsEls[i].firstElementChild.firstElementChild.firstElementChild.href,
            songs: await getSongs(albumsEls[i].firstElementChild.firstElementChild.firstElementChild.href)
        })
        console.info(`[+] ${i}- ${albumsEls[i].firstElementChild.firstElementChild.firstElementChild.textContent}`)
    }
    console.info(`[+] Completed, ${albums.length} albums' metadata downloaded`)
    return {
        artistName: albumsDom.window.document.getElementsByClassName('style5')[0].textContent,
        href: url,
        albums
    }
}

async function downloadMetadata(url) {
    const metadata = await getAlbums(url)
    fs.writeFileSync(`${metadata.artistName}.metadata.json`, JSON.stringify(metadata, null, 2))
    console.info(`[+] Saved metadata to file '${metadata.artistName}.metadata.json'`)
}

async function download(fileName) {
    const metadata = JSON.parse(fs.readFileSync(fileName, 'utf8'))
    if (!fs.existsSync(metadata.artistName))
        fs.mkdirSync(metadata.artistName)
    console.info(`[*] Downloading ${metadata.albums.length} albums for '${metadata.artistName}'...`)
    for (let [i, album] of metadata.albums.entries()) {
        if (!fs.existsSync(path.join(metadata.artistName, album.name)))
            fs.mkdirSync(path.join(metadata.artistName, album.name))
        for (let s of album.songs) {
            if (!fs.existsSync(path.join(metadata.artistName, album.name, `${s.name}.mp3`))) {
                const r = await axios.get(s.downloadLink, { responseType: 'stream' })
                await r.data.pipe(fs.createWriteStream(path.join(metadata.artistName, album.name, `${s.name}.mp3`)))
            }
        }
        console.info(`[+] ${i + 1}- ${album.name} (${album.songs.length} songs)`)
    }
    console.info(`[+] Completed, ${metadata.albums.length} albums downloaded`)
}

module.exports = { downloadMetadata, download }
