# melody4arab.com downloader

This script downloads albums and songs from http://melody4arab.com and saves them to disk.

## Step 1

Install dependencies:

```
$ npm i axios jsdom
```

## Step 2

Genarate the metadata file:

```javascript
const downloadMetadata = require('./melody4arab').downloadMetadata

// Get the link for an artist from http://melody4arab.com (e.g Cheb Bilal)
const url = 'http://melody4arab.com/albums/en_view_albums_216.htm'

// Download metadata (albums + songs + download links) to a file
downloadMetadata(url) // creates file 'Cheb Bilal.metadata.json'
```

The metadata file will look something like this:

```json
{
  "artistName": "Cheb Bilal",
  "href": "http://melody4arab.com/albums/en_view_albums_216.htm",
  "albums": [
    {
      "name": "1 Milliard",
      "href": "http://melody4arab.com/songs/en_view_songs_4427.htm",
      "songs": [
        {
          "name": "1 Milliard",
          "href": "http://melody4arab.com/download/en_download_55442.htm",
          "downloadLink": "http://melody4arab.com/music/algeria/cheb_bilal/1_milliard/1_Milliard_melody4arab.com.mp3"
        },
        ...
      ]
    },
    ...
  ]
}
```

## Step 3

Use the metadata file to download the songs:

```javascript
const download = require('./melody4arab').download

download('Cheb Bilal.metadata.json')
```

This will results in the following structure:

```
Cheb Bilal
├─ 1 Milliard
│  ├─ 1 Milliard.mp3
│  └─ ...
└─ ...
   └── ...
```
> If the script fails, re-exute it and it will skip any downloaded files and continue from where it crashed.
