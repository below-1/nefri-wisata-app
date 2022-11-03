import { sum, zip, range, max, min } from 'lodash-es'

function column(Xs, i) {
  return Xs.map(row => row[i])
}

function norm_column(Xs, i) {
  return Math.sqrt(sum(Xs.map(row => Math.pow(row[i], 2))))
}

export function topsis(Xs, weights, types) {
  const N_KRITERIA = weights.length
  // console.log('Xs')
  // console.log(Xs)
  let Rs = []
  for (let i = 0; i < N_KRITERIA; i++) {
    const norm = norm_column(Xs, i);
    // console.log(column(Xs, i))
    // throw new Error('stop')
    const Ri = column(Xs, i).map(x => x / norm)
    Rs.push(Ri) 
  }
  // throw new Error('stop')
  // console.log('Rs')
  // console.log(Rs)
  const ideal_pos = types.map((c, i) => {
    if (c == 'benefit') {
      return max(Rs[i])
    } else {
      return min(Rs[i])
    }
  })
  const ideal_neg = types.map((c, i) => {
    if (c == 'benefit') {
      return min(Rs[i])
    } else {
      return max(Rs[i])
    }
  })

  // Transpose Rs matrix
  Xs = zip(...Rs)

  // Calculate distance to ideal positive
  const D_pos = Xs.map(row => {
    const t1 = row.map((x, i) => x - ideal_pos[i])
    const t2 = t1.map(x => Math.pow(x, 2))
    const t3 = sum(t2)
    const t4 = Math.sqrt(t3)
    return t4
  })
  const D_neg = Xs.map(row => {
    const t1 = row.map((x, i) => x - ideal_neg[i])
    const t2 = t1.map(x => Math.pow(x, 2))
    const t3 = sum(t2)
    const t4 = Math.sqrt(t3)
    return t4
  })

  const prefs = range(Xs.length).map(ix => {
    return D_neg[ix] / (D_pos[ix] + D_neg[ix])
  })
  console.log('prefs')
  console.log(prefs)

  let biggest_index = -1;
  let biggest_pref = -1;
  for (let ix = 0; ix < Xs.length; ix++) {
    if (prefs[ix] > biggest_pref) {
      biggest_pref = prefs[ix]
      biggest_index = ix;
    }
  }
  if (biggest_index == -1) {
    throw new Error(`tidak dapat menemukan rekomendasi terbaik`)
  }
  // throw new Error('stop')

  return {
    pref: biggest_pref,
    biggest_index
  }
}