import mongoose from 'mongoose';
import { imagekit } from '../util.js';

export const MediaSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  file_id: {
    type: String,
  },
  alt: {
    type: String,
    required: false,
  }
})

MediaSchema.post('remove', async function () {
  if (this.file_id) {
    try {
      const deleteResponse = await imagekit.deleteFile(this.file_id);
    } catch (err) {
      console.log(err);
    }
  }
  console.log(`removing image(url=${this.url})`)
})
