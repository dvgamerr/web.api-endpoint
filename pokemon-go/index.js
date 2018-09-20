import * as line from '@line/bot-sdk'
import FlexPokedex from './flex_pokedex'
import express from 'express'
import { debuger, Time } from 'touno.io'
import conn from 'touno.io/db-opensource'

if (!process.env.LINE_TOKEN_POKEDEX || !process.env.LINE_SECRET_POKEDEX) {
  throw new Error('LINE token access environment not found')
}

const replyTest = [ '00000000000000000000000000000000', 'ffffffffffffffffffffffffffffffff' ]

const config = {
  channelAccessToken: process.env.LINE_TOKEN_POKEDEX,
  channelSecret: process.env.LINE_SECRET_POKEDEX
}

const logger = debuger.scope('Rotomu')
const client = new line.Client(config)
const router = express.Router()

const PokedexName = [
  'โรตอม',
  'โรโตมุ',
  'โรโตะมุ',
  'โระโตะมุ',
  'rotom',
  'rotomu',
  'ロトム',
  'poke',
  'pokedex',
  'โปเกเดก'
]

const normalizeText = (text) => (text || '').toLowerCase().trim()
router.post('/:id', line.middleware(config), (req, res) => {
  if (!Array.isArray(req.body.events)) return res.status(500).end()
  if (!Array.isArray(req.body.events)) return res.status(500).end()

  let elasped = new Time()
  Promise.all(req.body.events.map(async event => {
    const { source, message, replyToken, timestamp } = event
    const msg = normalizeText(message.text)
    if (replyTest.includes(replyToken)) return
    const id = source.groupId || source.userId
    logger.log(`${timestamp} ${source.type}: ${id} message: ${msg}`)

    let { BotRotomuConfig, PokemonGo } = await conn.open()

    const IsOnline = await BotRotomuConfig.findOne({ id: id })
    if (PokedexName.includes(msg)) {
      const profile = await client.getProfile(source.userId)
      if (IsOnline) {
        await replyText(replyToken, `ครับ! ${profile.displayName}`)
      } else {
        await replyText(replyToken, `พร้อมใช้งานแล้วคับ! คุณ ${profile.displayName}`)
        const bot = await BotRotomuConfig.findOne({ id: id })
        if (!bot) {
          logger.info(`New register ${source.type} id: ${id}`)
          await new BotRotomuConfig({
            id: id,
            type: source.type,
            permission: { news: true, pokedex: true, event: true },
            created: new Date()
          }).save()
        }
      }
    } else if (IsOnline) {
      let pokedex = null
      let getNo = /pokemon[\W](?<no>\d+)/ig.exec(msg)
      let getSearch = /(search|find|get)[\W](?<msg>.*)/ig.exec(msg)
      if (getNo) {
        pokedex = await PokemonGo.findOne({ number: parseInt(getNo.groups.no) })
      } else if (msg.length > 3) {
        pokedex = await PokemonGo.find({ name: { $in: [ new RegExp(!getSearch ? `^${msg}$` : getSearch.groups.msg, 'ig') ] } })
        if (pokedex.length !== 1) return
        pokedex = pokedex[0]
      }
      if (pokedex) await client.replyMessage(replyToken, FlexPokedex(pokedex))
      logger.log(`Show pokemon ${pokedex.title_1} used`, elasped.nanoseconds())
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
  return client.replyMessage(token, texts.map((text) => ({ type: 'text', text })))
}

// // callback function to handle a single event
// function handleEvent(event) {
//   if (event.source.type === 'group') {
//     event.source.groupId
//   }

//   switch (event.type) {
//     case 'message':
//       const message = event.message
//       switch (message.type) {
//         case 'text':
//           return handleText(message, event.replyToken)
//         case 'image':
//           return handleImage(message, event.replyToken)
//         case 'video':
//           return handleVideo(message, event.replyToken)
//         case 'audio':
//           return handleAudio(message, event.replyToken)
//         case 'location':
//           return handleLocation(message, event.replyToken)
//         case 'sticker':
//           return handleSticker(message, event.replyToken)
//         default:
//           throw new Error(`Unknown message: ${JSON.stringify(message)}`)
//       }

//     case 'follow':
//       return replyText(event.replyToken, 'Got followed event')

//     case 'unfollow':
//       return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`)

//     case 'join':
//       return replyText(event.replyToken, `Joined ${event.source.type}`)

//     case 'leave':
//       return console.log(`Left: ${JSON.stringify(event)}`)

//     case 'postback':
//       let data = event.postback.data
//       return replyText(event.replyToken, `Got postback: ${data}`)

//     case 'beacon':
//       const dm = `${Buffer.from(event.beacon.dm || '', 'hex').toString('utf8')}`
//       return replyText(event.replyToken, `${event.beacon.type} beacon hwid : ${event.beacon.hwid} with device message = ${dm}`)

//     default:
//       throw new Error(`Unknown event: ${JSON.stringify(event)}`)
//   }
// }

// function handleText(message, replyToken) {
//   return replyText(replyToken, message.text)
// }

// function handleImage(message, replyToken) {
//   return replyText(replyToken, 'Got Image')
// }

// function handleVideo(message, replyToken) {
//   return replyText(replyToken, 'Got Video')
// }

// function handleAudio(message, replyToken) {
//   return replyText(replyToken, 'Got Audio')
// }

// function handleLocation(message, replyToken) {
//   return replyText(replyToken, 'Got Location')
// }

// function handleSticker(message, replyToken) {
//   return replyText(replyToken, 'Got Sticker')
// }

export default router
