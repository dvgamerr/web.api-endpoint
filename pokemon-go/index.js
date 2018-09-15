import * as line from '@line/bot-sdk'
import express from 'express'

if (!process.env.LINE_TOKEN_POKEDEX || !process.env.LINE_SECRET_POKEDEX) {
  throw new Error('LINE token access environment not found')
}

const replyTest = [ '00000000000000000000000000000000', 'ffffffffffffffffffffffffffffffff' ]

const config = {
  channelAccessToken: process.env.LINE_TOKEN_POKEDEX,
  channelSecret: process.env.LINE_SECRET_POKEDEX
}

const client = new line.Client(config)
const router = express.Router()

const PokedexName = [ 
  "โรตอม",
  "โรโตมุ",
  "โรโตะมุ",
  "โระโตะมุ",
  "rotom",
  "rotomu",
  "ロトム",
  "poke",
  "pokedex",
  "โปเกเดก"
]

let RotomOnline = {}
const normalizeText = (text) => (text || '').toLowerCase().trim()
router.post('/', line.middleware(config), (req, res) => {
  if (!Array.isArray(req.body.events)) return res.status(500).end()

  Promise.all(req.body.events.map(async event => {
    const { source, message, replyToken, timestamp } = event
    if (replyTest.includes(replyToken)) return
    
    console.log('message:', normalizeText(message.text))
    if (PokedexName.includes(normalizeText(message.text))) {
      const profile = await client.getProfile(source.userId)
      if (RotomOnline[source.userId]) {
        await replyText(replyToken, `ครับ! ${profile.displayName}`)
      } else {
        await replyText(replyToken, `พร้อมใช้งานแล้วคับ! คุณ ${profile.displayName}`)
        RotomOnline[source.userId] = true
      }
    }

    // switch (message.type) {
    //   case 'text': return handleText(message, event.replyToken)
    //   case 'image':
    //     return handleImage(message, event.replyToken)
    //   case 'video':
    //     return handleVideo(message, event.replyToken)
    //   case 'audio':
    //     return handleAudio(message, event.replyToken)
    //   case 'location':
    //     return handleLocation(message, event.replyToken)
    //   case 'sticker':
    //     return handleSticker(message, event.replyToken)
    //   default:
    //     throw new Error(`Unknown message: ${JSON.stringify(message)}`)
    // }
    // getProfile(userId: string): Promise<Profile>

    // // Group
    // getGroupMemberProfile(groupId: string, userId: string): Promise<Profile>
    // getGroupMemberIds(groupId: string): Promise<string[]>
    // leaveGroup(groupId: string): Promise<any>
  
    // // Room
    // getRoomMemberProfile(roomId: string, userId: string): Promise<Profile>
    // getRoomMemberIds(roomId: string): Promise<string[]>
    // leaveRoom(roomId: string): Promise<any>

    console.log('event', event)
    // check verify webhook event
    // return handleEvent(event)

  })).then(() => {
    res.status(200).end()
  }).catch(ex => {
    console.log(ex)
    res.status(500).end()
  })
})


// simple reply function
const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts]
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
}

// callback function to handle a single event
function handleEvent(event) {
  if (event.source.type === 'group') {
    event.source.groupId
  }

  switch (event.type) {
    case 'message':
      const message = event.message
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken)
        case 'image':
          return handleImage(message, event.replyToken)
        case 'video':
          return handleVideo(message, event.replyToken)
        case 'audio':
          return handleAudio(message, event.replyToken)
        case 'location':
          return handleLocation(message, event.replyToken)
        case 'sticker':
          return handleSticker(message, event.replyToken)
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`)
      }

    case 'follow':
      return replyText(event.replyToken, 'Got followed event')

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`)

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`)

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`)

    case 'postback':
      let data = event.postback.data
      return replyText(event.replyToken, `Got postback: ${data}`)

    case 'beacon':
      const dm = `${Buffer.from(event.beacon.dm || '', 'hex').toString('utf8')}`
      return replyText(event.replyToken, `${event.beacon.type} beacon hwid : ${event.beacon.hwid} with device message = ${dm}`)

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`)
  }
}

function handleText(message, replyToken) {
  return replyText(replyToken, message.text)
}

function handleImage(message, replyToken) {
  return replyText(replyToken, 'Got Image')
}

function handleVideo(message, replyToken) {
  return replyText(replyToken, 'Got Video')
}

function handleAudio(message, replyToken) {
  return replyText(replyToken, 'Got Audio')
}

function handleLocation(message, replyToken) {
  return replyText(replyToken, 'Got Location')
}

function handleSticker(message, replyToken) {
  return replyText(replyToken, 'Got Sticker')
}


export default router
