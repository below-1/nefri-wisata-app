import Multer from 'fastify-multer'
import { pick, values, sum, range, flatten, sortBy, reverse } from 'lodash-es'
import { Wisata } from '../../models/wisata.model.js'
import { Kriteria } from '../../models/kritsch.model.js'

const upload = Multer({ dest: 'uploads/' })

export default async fastify => {
  fastify.get('/', {
    handler: async (request, reply)  => {
      const kriteria_list = await Kriteria.find()
      reply.xview('app/rekomendasi/form', {
        kriteria_list
      })
    }
  })

  fastify.post('/', {
    preHandler: upload.none(),
    handler: async (request, reply) => {
      let payload = {...request.body}
      const kriteria_list = await Kriteria.find()
      console.log(kriteria_list.map(it => it.nama))
      const keys = kriteria_list.map(it => it._id.toString())
      const original_weights = kriteria_list.map(it => it.weight)
      const weights = original_weights.map(w => w / 100.0)
      // const original_weights = values(pick(payload, keys)).map(it => parseInt(it))
      const total_weights = sum(original_weights)
      // const weights = original_weights.map(it => it * 1.0 / total_weights)
      const types = kriteria_list.map(k => k.benefit ? 'benefit' : 'cost')
      let filter = {}
      if (payload.jenis !== 'all') {
        filter['jenis'] = payload.jenis
      }
      console.log(payload.jenis)
      console.log('payload.jenis')
      // Processing the filter based on jenis
      let items = await Wisata
        .find(filter)
        .populate({
          path: 'kriterias',
          populate: {
            path: 'kriteria',
            model: 'Kriteria'
          }
        })
        .sort({ order: 1 })
      console.log(items.map(it => it.nama));
      console.log('items');
      items = items.filter(it => it.kriterias.length && it.kriterias.every(kv => kv.value && kv.kriteria));
      if (!items.length) {
        return reply.view('app/rekomendasi/result', {
          error: 'belum ada satupun data kriteria yang diisi!'
        })
      }
      // console.log(weights)
      // throw new Error()
     
      const Xs = items.map(it => 
        it.kriterias.map(kv => {
          const v = kv.value
          const ktype = kv.kriteria.type
          if (ktype == 'NUMBER') {
            throw new Error('not_implemented')
          } else if (ktype == 'OPTIONS') {
            const options = kv.kriteria.text_options
            if (kv.kriteria.multiple) {
              const selected = options
                .filter(opt => v.includes(opt.label))
                .map(opt => opt.value)
              return selected.reduce((a, b) => a + b, 0)
            } else {
              const selected = options.find(opt => opt.label == kv.value)
              if (!selected) {
                console.log(it)
                throw new Error('KV_INVALID')
              }
              return selected.value
            }
          }
        })
      )
      // console.log('Xs')
      // console.log(Xs.map(row =>  row[1]))
      // console.log(items.map(it => it.nama))
      const N_KRITERIA = kriteria_list.length

      const cols = range(N_KRITERIA).map(i => {
        const sum = Xs
          .map(row => {
            return Math.pow( row[i], 2 )
          })
          .reduce((a, b) => a + b, 0)
        return Math.sqrt(sum)
      })

      // console.log(cols)
      // throw new Error('stop')

      const Xij = Xs.map(row => {
        return row.map((x, i) => {
          return x / cols[i]
        })
      })

      const XW = Xij.map(row => {
        return row.map((x, j) => {
          return x * weights[j]
        })
      })

      // Initialize concordance matrix
      const N_ALTERNATIF = XW.length;
      const concordances = range(N_ALTERNATIF).map(i => range(N_ALTERNATIF).map(j => new Set()));
      const discordances = range(N_ALTERNATIF).map(i => range(N_ALTERNATIF).map(j => new Set()));
      
      for (let i = 0; i < N_ALTERNATIF; i++) {
        for (let j = 0; j < N_ALTERNATIF; j++) {
          if (i == j) {
            continue;
          }
          const row_i = XW[i];
          const row_j = XW[j];
          const key = `${i}-${j}`;
          for (let i_col = 0; i_col < N_KRITERIA; i_col++) {
            if (row_i[i_col] >= row_j[i_col]) {
              concordances[i][j].add(i_col);
            } else {
              discordances[i][j].add(i_col);
            }
          }
        }
      }

      const concordance_index = concordances.map((row, i) => {
        return row.map((set, j) => {
          if (i == j) return NaN;
          return [ ...set ]
            .map(col_index => {
              return weights[col_index]
            })
            .reduce((a, b) => a + b, 0)
        })
      })

      const discordance_index = discordances.map((row, i) => {
        return row.map((set, j) => {
          if (i == j) return NaN;
          const col_indices = [ ...set ];
          if (col_indices.length == 0) return NaN; 
          let numerator = 0;
          const numerator_candidates = col_indices.map(ci => {
            return Math.abs( XW[i][ci] - XW[j][ci] );
          })
          // console.log(numerator_candidates);
          numerator = numerator_candidates.length > 0 ? Math.max( ...numerator_candidates ) : 0;
          // if (isNaN(numerator)) {
          //   console.log('i = ', i)
          //   console.log('numerator_candidates')
          //   console.log(col_indices)
          //   console.log('col_indices')
          //   console.log(col_indices)
          //   throw new Error('stop')
          // }
          let denumerator_candidates = [];
          range(N_KRITERIA).forEach(kriteria_index => {
            denumerator_candidates.push( Math.abs( XW[i][kriteria_index] - XW[j][kriteria_index] ) )
          })
          // console.log(denumerator_candidates);
          // console.log('denumerator_candidates');
          const denumerator = Math.max( ...denumerator_candidates );
          const result = numerator / denumerator
          // if (i == 2 && j == 14) {
          //   console.log('numerator');
          //   console.log(numerator);
          //   console.log('denumerator');
          //   console.log(denumerator);
          //   console.log('denumerator_candidates')
          //   console.log(denumerator_candidates)
          //   console.log('numerator_candidates')
          //   console.log(numerator_candidates)
          // }
          // throw new Error('stop');
          return result;
        })
      })
      const sum_cols = range(N_ALTERNATIF).map(i => {
        return sum( discordance_index.map(r => r[i]).filter(x => !isNaN(x)) )
      })
      console.log('discordances sums')
      console.log(sum_cols)
      // throw new Error('stop')

      const concordance_sum = sum( 
        flatten(
          concordance_index
            .map(row => {
              return sum( row.filter(c => !isNaN(c) ) )
            })
        )
      )
      const discordance_sum = sum(
        flatten(
          discordance_index
            .map(row => {
              return sum( row.filter(c => !isNaN(c) ) )
            })
        )
      )
      const threeshold_concordance = concordance_sum / (N_ALTERNATIF * (N_ALTERNATIF - 1))
      const threeshold_discordance = discordance_sum / (N_ALTERNATIF * (N_ALTERNATIF - 1))
      const dominance_concordance = concordance_index.map((row, i) => {
        return row.map((x, j) => {
          if (i == j) return NaN;
          if (x >= threeshold_concordance) return 1;
          return 0;
        })
      })
      const dominance_discordance = discordance_index.map((row, i) => {
        return row.map((x, j) => {
          if (i == j) return NaN;
          if (x >= threeshold_discordance) return 1;
          return 0;
        })
      })

      const E = range(N_ALTERNATIF).map(i => {
        return range(N_ALTERNATIF).map(j => {
          if (i == j) return NaN;
          return dominance_concordance[i][j] * dominance_discordance[i][j];  
        })
      })
      
      let result = E.map((row, i) => {
        const total = sum( row.filter(x => !isNaN(x)) )
        const index = i
        return {
          total,
          index
        }
      })
      const sorted = reverse( sortBy(result, it => it.total) )
      const results = sorted.map(s => {
        const rekomendasi = items[s.index]
        return rekomendasi
      })
      // const rekomendasi = items[sorted[0].index]
      // console.log(sorted)
      // console.log(items[sorted[0].index].nama)     
      // console.log(items[sorted[1].index].nama)

      function printMatrix(title, XS) {
        console.log(title)
        for (let row of XS) {
          console.log(row.map(x => x.toFixed(5)).join('\t'))
        }
        console.log('----')
        console.log()
      }

      function printAltKrit(items, Xs, headers) {
        console.log(' ', '\t', ''.padEnd(30) ,headers.map(it => it.padEnd(' ', 30)).join('\t'))
        for (let i = 0; i < items.length; i++) {
          console.log(i, '\t', items[i].nama.padEnd('.', 30), '\t', Xs[i].map(x => `${x}`.padEnd(' ', 20)).join('\t'))
        }
        console.log('----')
        console.log()
      }
      
      printMatrix('Xs', Xs)
      printMatrix('Xij', Xij)
      printMatrix('XW', XW)
      printAltKrit(items, Xs, kriteria_list.map(it => it.nama))
      printMatrix('concordance index', concordance_index)
      printMatrix('discordance index', discordance_index)
      console.log('threeshold concordance = ', threeshold_concordance)
      printMatrix('dominance concordance', dominance_concordance)
      console.log('threeshold discordance = ', threeshold_discordance)
      printMatrix('dominance discordance', dominance_discordance)
      printMatrix('Matriks E', E)
      throw new Error('stop')

      // let rekomendasi = topsis(Xs, weights, types)
      // rekomendasi.item = items[rekomendasi.biggest_index]
      reply.view('app/rekomendasi/result', {
        results
      })
    }
  })
}