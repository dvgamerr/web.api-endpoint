export default (poke) => {
  return {
    type: 'flex',
    altText: `Pokemon#${poke.filename} - ${poke.title_1}`,
    contents: {
      type: 'bubble',
      styles: { footer: { separator: true } },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `Pokemon#${poke.filename}`,
            weight: 'bold',
            color: '#1DB446',
            size: 'md'
          },
          {
            type: 'text',
            text: poke.title_1,
            weight: 'bold',
            size: 'xxl',
            margin: 'md'
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'xxl',
            contents: [
              {
                type: 'spacer'
              },
              {
                type: 'image',
                url: poke.image,
                aspectMode: 'cover',
                size: 'xl'
              }
            ]
          },
          {
            type: 'separator',
            margin: 'xxl'
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: `CP ${poke.cp_35}`,
                size: 'sm',
                flex: 3
              },
              {
                type: 'text',
                text: `${poke.pokemon_class ? poke.pokemon_class + ' - ' : ''}${poke.field_pokemon_type}`,
                color: '#aaaaaa',
                size: 'xs',
                align: 'end',
                flex: 0
              }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: 'HP',
                size: 'sm',
                color: '#aaaaaa',
                flex: 3
              },
              {
                type: 'text',
                text: poke.sta,
                size: 'sm',
                color: '#333333',
                flex: 8
              },
              {
                type: 'text',
                text: 'Atk',
                size: 'sm',
                color: '#aaaaaa',
                flex: 3
              },
              {
                type: 'text',
                text: poke.atk,
                color: '#333333',
                size: 'sm',
                flex: 8
              },
              {
                type: 'text',
                text: 'Def',
                size: 'sm',
                color: '#aaaaaa',
                flex: 3
              },
              {
                type: 'text',
                text: poke.def,
                color: '#333333',
                size: 'sm',
                flex: 5
              }
            ]
          }
        ]
      }
    }
  }
}
