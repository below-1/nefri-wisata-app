export function format_weight(x) {
  switch (x) {
    case 'TIDAK_PENTING': return 'Tidak Penting'
    case 'KURANG_PENTING': return 'Kurang Penting'
    case 'CUKUP_PENTING': return 'Cukup Penting'
    case 'PENTING': return 'Penting'
    case 'SANGAT_PENTING': return 'Sangat Penting'
    default: return '';
  }
}

export function format_sign(x) {
  switch (x) {
    case 'GT':
      return '>';
    case 'GTE':
      return '>=';
    case 'LT':
      return '<';
    case 'LTE':
      return '<';
    default: return '';
  }
}

export function format_number_option(opt) {
  let result = {
    lower: opt.lower,
    lower_sign: format_sign(opt.lower_sign),
    upper: opt.upper,
    upper_sign: format_sign(opt.upper_sign)
  }

  return `x ${result.lower_sign} ${result.lower} && x ${result.upper_sign} ${result.upper}`
}
