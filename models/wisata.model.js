import mongoose from 'mongoose';
import { MediaSchema } from './media.model.js';
import { Kriteria } from './kritsch.model.js'

export const Fasilitas = {
  Parkiran: 'Parkiran',
  Toilet: 'Toilet',
  Lopo: 'Lopo',
  Kantin: 'Kantin',
  Penginapan: 'Penginapan',
}

export const JenisWisata = {
  Alam: 'Alam',
  Budaya: 'Budaya',
  Religi: 'Religi',
}

export const Transportasi = {
  AngkutanUmum: 'AngkutanUmum',
  Motor: 'Motor',
  Mobil: 'Mobil',
  Pickup: 'Pickup',
  Bus: 'Bus',
}

export const WisataSchema = new mongoose.Schema({
  jenis: {
    type: String,
    enum: Object.values(JenisWisata),
    required: true
  },
  nama: { type: String, required: true },
  description: { type: String, required: false },
  alamat: { type: String, required: false },
  avatar: MediaSchema,
  medias: [MediaSchema]
}, { 
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})

WisataSchema.virtual('kriterias', {
  ref: 'KriteriaValue',
  localField: '_id',
  foreignField: 'wisata',
})

export const Wisata = mongoose.model('Wisata', WisataSchema);
