import mongoose from 'mongoose';

const KriteriaType = {
  NUMBER: 'NUMBER',
  OPTIONS: 'OPTIONS',
  MULTIPLE: 'MULTIPLE',
}

const WeightType = {
  TIDAK_PENTING: 'TIDAK_PENTING',
  KURANG_PENTING: 'KURANG_PENTING',
  CUKUP_PENTING: 'CUKUP_PENTING',
  PENTING: 'PENTING',
  SANGAT_PENTING: 'SANGAT_PENTING'
}

const BoundaryType = {
  GT: 'GT',
  GTE: 'GTE',
  LT: 'LT',
  LTE: 'LTE',
  NONE: 'NONE'
}

const NumberOptionSchema = new mongoose.Schema({
  lower: Number,
  lower_sign: { type: String, enum: Object.values(BoundaryType) },
  upper: Number,
  upper_sign: { type: String, enum: Object.values(BoundaryType) },
  value: Number
})

const TextOptionSchema = new mongoose.Schema({
  label: String,
  value: Number
})

const MultipleTextOptionSchema = new mongoose.Schema({
  label: String,
  value: Number
})

export const KriteriaSchema = new mongoose.Schema({
  nama: String,
  type: {
    type: String,
    enum: Object.values(KriteriaType)
  },
  weight: { type: Number, required: true },
  number_options: [NumberOptionSchema],
  text_options: [TextOptionSchema],
  multiple_options: [MultipleTextOptionSchema],
  multiple: Boolean,
  benefit: {
    type: Boolean,
    required: true,
  },
  text_value: {
    type: [String],
    required: false,
  },
  number_value: {
    type: Number,
    required: false,
  }
}, { timestamps: true })

KriteriaSchema.methods.addOption = function (option) {
  if (this.type == 'MULTIPLE') {
    this.multiple_options.push(option)
  } else if (this.type == 'NUMBER') {
    this.number_options.push(option)
  } else if (this.type == 'OPTIONS') {
    this.text_options.push(option)
  }
}

export const Kriteria = mongoose.model('Kriteria', KriteriaSchema)


export const KriteriaValueSchema = new mongoose.Schema({
  kriteria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kriteria'
  },
  value: mongoose.Schema.Types.Mixed,
  wisata: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wisata'
  }
}, { timestamps: true })

export const KriteriaValue = mongoose.model('KriteriaValue', KriteriaValueSchema)
